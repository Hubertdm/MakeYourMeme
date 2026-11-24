const crypto = require('crypto');
const { TEMPLATES, TOPICS } = require('./templates');

const MAX_PLAYERS = 30;
const POINTS_UP = 20;
const POINTS_DOWN = -20;
const POINTS_MEH = 0;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const GAMES = new Map();
const SIDEBET = new Map();

function randomCode() {
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    }
    if (!GAMES.has(code)) return code;
  }
  return null;
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickTopic() {
  return TOPICS[crypto.randomInt(TOPICS.length)];
}

function loosePlayerInfo(p) {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isHost: p.game.players[0] && p.game.players[0].id === p.id,
    connected: p.connected
  };
}

function looseLobbyPlayers(game) {
  return game.players.map(loosePlayerInfo);
}

class Game {
  constructor(io, hostSocket, hostName, settings = {}) {
    this.io = io;
    this.code = randomCode();
    this.players = [];
    this.settings = {
      mode: ['normal', 'topics', 'same-meme', 'relaxed'].includes(settings.mode)
        ? settings.mode
        : 'normal',
      rounds: this.clampInt(settings.rounds, 1, 20, 3),
      createSeconds: this.clampInt(settings.createSeconds, 30, 300, 90),
      voteSeconds: this.clampInt(settings.voteSeconds, 5, 60, 15)
    };
    this.phase = 'lobby';
    this.roundIndex = 0;
    this.topic = null;
    this.sharedTemplate = null;
    this.memes = [];
    this.resultsPerMeme = null;
    this.timer = null;
    this.voteOrder = [];
    this.voteCursor = 0;
    this.hostId = null;
    this.gameOver = false;
    this.addPlayer(hostSocket, hostName, true);
  }

  clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  broadcast(event, payload) {
    this.io.to(this.code).emit(event, payload);
  }

  lobbyState() {
    return {
      code: this.code,
      phase: this.phase,
      players: looseLobbyPlayers(this),
      settings: this.settings,
      hostId: this.hostId
    };
  }

  addPlayer(socket, name, isHost = false) {
    const avatars = ['🐸', '🦊', '🐼', '🦄', '🐙', '🍕', '🚀', '👾'];
    const player = {
      id: socket.id,
      socket,
      game: this,
      name,
      avatar: avatars[this.players.length % avatars.length],
      score: 0,
      connected: true,
      memes: [],
      buddy: null,
      buddyPoints: 0
    };
    this.players.push(player);
    if (isHost) this.hostId = player.id;
    socket.join(this.code);
    SIDEBET.set(socket.id, { player, gameId: this.code });
    return player;
  }

  getPlayer(socketId) {
    return this.players.find((p) => p.id === socketId);
  }

  updateSettings(partial, senderId) {
    if (senderId !== this.hostId) return { error: 'Seul l\u2019h\u00f4te peut modifier les r\u00e9glages.' };
    if (this.phase !== 'lobby') return { error: 'Les r\u00e9glages sont fig\u00e9s en pleine partie.' };
    if (partial.mode) {
      if (!['normal', 'topics', 'same-meme', 'relaxed'].includes(partial.mode)) {
        return { error: 'Mode de jeu inconnu.' };
      }
      this.settings.mode = partial.mode;
    }
    if (partial.rounds !== undefined) this.settings.rounds = this.clampInt(partial.rounds, 1, 20, 3);
    if (partial.createSeconds !== undefined) this.settings.createSeconds = this.clampInt(partial.createSeconds, 30, 300, 90);
    if (partial.voteSeconds !== undefined) this.settings.voteSeconds = this.clampInt(partial.voteSeconds, 5, 60, 15);
    this.broadcast('lobby:update', this.lobbyState());
    return {};
  }

  startRound() {
    this.phase = 'create';
    this.roundIndex += 1;
    this.memes = [];
    this.voteOrder = [];
    this.voteCursor = 0;
    this.topic = this.settings.mode === 'topics' ? pickTopic() : null;
    this.sharedTemplate = null;

    if (this.settings.mode === 'same-meme') {
      this.sharedTemplate = TEMPLATES[crypto.randomInt(TEMPLATES.length)];
    }

    const used = shuffle(TEMPLATES);
    this.players.forEach((player, index) => {
      player.memes = [];
      player.buddy = null;
      player.buddyPoints = 0;
      const template = this.sharedTemplate || used[index % used.length];
      player.currentTemplate = template;
      player.socket.emit('round:create', {
        round: this.roundIndex,
        totalRounds: this.settings.rounds,
        mode: this.settings.mode,
        topic: this.topic,
        template,
        createSeconds: this.settings.createSeconds,
        players: this.players
          .filter((other) => other.id !== player.id && other.connected)
          .map((other) => ({ id: other.id, name: other.name, avatar: other.avatar }))
      });
    });
    this.broadcast('round:create-broadcast', {
      round: this.roundIndex,
      totalRounds: this.settings.rounds,
      createSeconds: this.settings.createSeconds
    });
    this.timer = setTimeout(() => this.beginVoting(), this.settings.createSeconds * 1000);
  }

  submitMeme(player, meme) {
    if (this.phase !== 'create') return;
    const text = String(meme.text || '').trim();
    if (!text || text.length > 120) return;
    if (player.memes.length) return;
    const newMeme = {
      id: crypto.randomUUID(),
      author: player,
      text,
      topText: player.currentTemplate ? player.currentTemplate.topText : '',
      hint: player.currentTemplate ? player.currentTemplate.hint : '',
      emoji: player.currentTemplate ? player.currentTemplate.emoji : '🖼️',
      gradient: player.currentTemplate ? player.currentTemplate.gradient : ['#222', '#444'],
      votes: null,
      score: 0
    };
    player.memes.push(newMeme);
    this.memes.push(newMeme);
    player.socket.emit('meme:accepted');
    this.broadcast('create:progress', {
      submitted: this.players.filter((p) => p.memes.length > 0).length,
      total: this.players.length
    });
    if (this.players.every((p) => !p.connected || p.memes.length > 0)) {
      clearTimeout(this.timer);
      this.beginVoting();
    }
  }

  chooseBuddy(player, buddyId) {
    if (player.game.phase !== 'create') return;
    if (buddyId === null || buddyId === undefined || buddyId === '') {
      player.buddy = null;
      return;
    }
    if (buddyId === player.id) return;
    const buddy = this.getPlayer(buddyId);
    if (!buddy) return;
    player.buddy = buddy.id;
  }

  beginVoting() {
    this.phase = 'vote';
    this.voteOrder = this.memes
      .concat()
      .sort((a, b) => crypto.randomInt(3) - 1);
    this.voteCursor = 0;
    this.resultsPerMeme = null;
    if (this.voteOrder.length === 0) {
      this.finishRound();
      return;
    }
    this.broadcast('vote:start', {
      memesCount: this.voteOrder.length,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: this.settings.mode === 'relaxed' ? null : p.score
      }))
    });
    this.startVoteWindow();
  }

  startVoteWindow() {
    const meme = this.voteOrder[this.voteCursor];
    if (!meme) {
      this.finishRound();
      return;
    }
    this.broadcast('vote:meme', {
      index: this.voteCursor,
      total: this.voteOrder.length,
      memeId: meme.id,
      emoji: meme.emoji,
      gradient: meme.gradient,
      topText: meme.topText,
      text: meme.text,
      authorId: meme.author.id,
      authorName: meme.author.name,
      voteSeconds: this.settings.voteSeconds
    });
    this.timer = setTimeout(() => this.closeVoteWindow(), this.settings.voteSeconds * 1000);
  }

  castVote(player, vote) {
    if (this.phase !== 'vote') return;
    const meme = this.voteOrder[this.voteCursor];
    if (!meme) return;
    if (meme.author.id === player.id) return;
    if (player.currentVote) return;
    if (!['up', 'down', 'meh'].includes(vote)) return;
    player.currentVote = { memeId: meme.id, vote };
    player.socket.emit('vote:accepted', { vote });
    const votes = this.players.filter((p) => p.currentVote).length;
    this.broadcast('vote:progress', { votes });
    if (
      this.players
        .filter((p) => p.connected && p.id !== meme.author.id)
        .every((p) => p.currentVote)
    ) {
      clearTimeout(this.timer);
      this.closeVoteWindow();
    }
  }

  closeVoteWindow() {
    const meme = this.voteOrder[this.voteCursor];
    if (meme) {
      const tally = { up: 0, down: 0, meh: 0 };
      this.players.forEach((p) => {
        if (p.currentVote && p.currentVote.memeId === meme.id) {
          tally[p.currentVote.vote] += 1;
        }
        p.currentVote = null;
      });
      meme.votes = tally;
      meme.score = tally.up * POINTS_UP + tally.down * POINTS_DOWN + tally.meh * POINTS_MEH;
      meme.author.score += meme.score;
    }
    if (this.voteCursor + 1 < this.voteOrder.length) {
      this.voteCursor += 1;
      this.startVoteWindow();
    } else {
      this.finishRound();
    }
  }

  finishRound() {
    this.phase = 'results';
    const buddyResults = {};
    this.players.forEach((donor) => {
      if (!donor.buddy) return;
      const buddyMeme = this.memes.find((m) => m.author && m.author.id === donor.buddy);
      if (!buddyMeme) return;
      const bonus = Math.round(buddyMeme.score / 2);
      donor.score += bonus;
      donor.buddyPoints = bonus;
      buddyResults[donor.id] = {
        buddyId: donor.buddy,
        buddyName: buddyMeme.author.name,
        bonus
      };
    });
    const standings = this.players
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: this.settings.mode === 'relaxed' ? null : p.score,
        roundDelta: this.settings.mode === 'relaxed' ? null : p.score - (p.scoreAtRoundStart || 0)
      }));
    this.players.forEach((p) => {
      p.scoreAtRoundStart = p.score;
    });
    this.resultsPerMeme = this.memes.map((m) => ({
      memeId: m.id,
      authorId: m.author.id,
      authorName: m.author.name,
      emoji: m.emoji,
      gradient: m.gradient,
      topText: m.topText,
      text: m.text,
      votes: m.votes,
      score: this.settings.mode === 'relaxed' ? null : m.score
    }));
    const gameOver = this.roundIndex >= this.settings.rounds;
    this.gameOver = gameOver;
    this.broadcast('round:results', {
      rounds: this.roundIndex,
      totalRounds: this.settings.rounds,
      buddyResults,
      memes: this.resultsPerMeme,
      standings,
      gameOver
    });
  }

  nextGame(socket) {
    if (socket.id !== this.hostId) return;
    this.players.forEach((p) => {
      p.score = 0;
      p.scoreAtRoundStart = 0;
      p.memes = [];
      p.buddy = null;
      p.buddyPoints = 0;
    });
    this.roundIndex = 0;
    this.memes = [];
    this.resultsPerMeme = null;
    this.gameOver = false;
    this.broadcast('game:reset', {});
    this.phase = 'lobby';
    this.broadcast('lobby:update', this.lobbyState());
  }

  removePlayer(socket) {
    const index = this.players.findIndex((p) => p.id === socket.id);
    if (index === -1) return;
    const player = this.players[index];
    player.connected = false;
    setTimeout(() => {
      const stillHere = this.players.find((p) => p.id === socket.id);
      if (stillHere && !stillHere.connected) {
        this.players = this.players.filter((p) => p.id !== socket.id);
        if (this.phase === 'lobby') {
          this.broadcast('lobby:update', this.lobbyState());
        } else {
          this.broadcast('game:player-left', { playerId: socket.id, name: stillHere.name });
        }
        if (socket.id === this.hostId && this.players.length) {
          this.hostId = this.players[0].id;
        }
      }
    }, 15000);
    if (this.phase === 'lobby') {
      this.broadcast('lobby:update', this.lobbyState());
    } else {
      this.broadcast('game:player-left', { playerId: socket.id, name: player.name });
    }
    if (!this.players.length) {
      this.dispose();
    } else if (this.players.every((p) => !p.connected) && this.phase !== 'results') {
      this.dispose();
    }
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer);
    GAMES.delete(this.code);
  }
}

function findOrCreateBinding(socketId) {
  if (!SIDEBET.has(socketId)) SIDEBET.set(socketId, { player: null, gameId: null });
  return SIDEBET.get(socketId);
}

function registerGameHandlers(io, socket) {
  const getBinding = () => findOrCreateBinding(socket.id);

  socket.on('createGame', ({ name } = {}) => {
    gameAction(socket, io, 'create', validateName(name));
  });

  socket.on('joinGame', ({ name, code } = {}) => {
    gameAction(socket, io, 'join', validateName(name), code);
  });

  socket.on('updateSettings', (partial = {}) => {
    const binding = getBinding();
    const game = GAMES.get(binding.gameId);
    if (!game) return;
    game.updateSettings(partial, socket.id);
  });

  socket.on('startGame', () => {
    const binding = getBinding();
    const game = GAMES.get(binding.gameId);
    if (!game || socket.id !== game.hostId) return;
    if (game.phase !== 'lobby' && game.phase !== 'results') return;
    if (!game.players.length) return;
    if (game.phase === 'results' && game.gameOver) return;
    game.players.forEach((p) => {
      p.score = 0;
      p.scoreAtRoundStart = 0;
    });
    game.startRound();
  });

  socket.on('submitMeme', (meme = {}) => {
    const binding = getBinding();
    const game = GAMES.get(binding.gameId);
    if (!game) return;
    const player = game.getPlayer(socket.id);
    if (!player) return;
    game.submitMeme(player, meme);
  });

  socket.on('chooseBuddy', ({ buddyId } = {}) => {
    const binding = getBinding();
    const game = GAMES.get(binding.gameId);
    if (!game) return;
    const player = game.getPlayer(socket.id);
    if (!player) return;
    game.chooseBuddy(player, buddyId);
  });

  socket.on('castVote', ({ vote } = {}) => {
    gameAction(socket, io, 'vote', { vote });
  });

  socket.on('nextGame', () => {
    const binding = getBinding();
    const game = GAMES.get(binding.gameId);
    if (game) game.nextGame(socket);
  });

  socket.on('disconnect', () => {
    const binding = SIDEBET.get(socket.id);
    if (!binding) return;
    const game = GAMES.get(binding.gameId);
    if (game) game.removePlayer(socket);
    SIDEBET.delete(socket.id);
  });
}

function validateName(raw) {
  const name = String(raw || '').trim();
  if (!name) return { error: 'Choisis un pseudo.' };
  if (name.length > 20) return { error: 'Pseudo trop long (20 caract\u00e8res max).' };
  return { name };
}

function gameAction(socket, io, kind, nameOrMeme, code) {
  if (kind === 'vote') {
    const binding = SIDEBET.get(socket.id);
    const game = binding && GAMES.get(binding.gameId);
    if (!game) return;
    const player = game.getPlayer(socket.id);
    if (!player) return;
    game.castVote(player, nameOrMeme.vote);
    return;
  }

  if (nameOrMeme && nameOrMeme.error) {
    socket.emit('joinResult', { error: nameOrMeme.error });
    return;
  }

  const name = nameOrMeme.name;

  if (kind === 'create') {
    const game = new Game(io, socket, name);
    GAMES.set(game.code, game);
    SIDEBET.set(socket.id, { player: null, gameId: game.code });
    socket.emit('joinResult', { lobby: game.lobbyState() });
    return;
  }

  const wantedCode = String(code || '').trim().toUpperCase();
  const game = GAMES.get(wantedCode);
  if (!game) {
    socket.emit('joinResult', { error: 'Aucune partie avec ce code.' });
    return;
  }
  const existing = game.getPlayer(socket.id);
  if (existing) {
    existing.connected = true;
  } else {
    if (game.players.length >= MAX_PLAYERS) {
      socket.emit('joinResult', { error: 'La partie est pleine (30 joueurs max).' });
      return;
    }
    if (game.phase !== 'lobby') {
      socket.emit('joinResult', { error: 'La partie a d\u00e9j\u00e0 commenc\u00e9.' });
      return;
    }
    game.addPlayer(socket, name);
  }
  socket.emit('joinResult', { lobby: game.lobbyState() });
  game.broadcast('lobby:update', game.lobbyState());
}

module.exports = { registerGameHandlers, GAMES };
