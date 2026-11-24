/* eslint-env browser */
const app = document.getElementById('app');
const socket = io();
let me = { id: null };
let activelyInGame = false;

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function render(node) {
  app.innerHTML = '';
  app.appendChild(node);
}

function notice(text, reload = true) {
  render(el(`<div class="connecting">${esc(text)}</div>`));
  if (reload) setTimeout(() => location.reload(), 3000);
}

function modeLabel(mode) {
  return ({
    normal: '🟢 Normal',
    topics: '🔵 Topics',
    'same-meme': '🟣 Same Meme',
    relaxed: '🟡 Relaxed'
  })[mode] || mode;
}

let countdown = null;
function startCountdown(seconds) {
  let remaining = seconds;
  const timerEl = el('<span class="timer"></span>');
  const update = () => {
    timerEl.textContent = `${Math.max(remaining, 0)} s`;
    timerEl.classList.toggle('urgent', remaining <= 10);
    if (remaining <= 0) clearInterval(interval);
    remaining -= 1;
  };
  const interval = setInterval(update, 1000);
  update();
  return { timerEl, stop: () => clearInterval(interval) };
}

function homeScreen(error) {
  activelyInGame = false;
  render(el(`
    <div class="brand"><div class="logo">🖼️</div><h1>MakeYourMeme</h1>
    <p>Le party game des meilleures punchlines</p></div>
    <div class="card">
      <label class="field-label">Ton pseudo</label>
      <input id="name" type="text" maxlength="20" placeholder="Ex : MemeLord42" />
      ${error ? `<p class="error">${esc(error)}</p>` : ''}
      <button class="btn" id="create">🎉 Créer une partie privée</button>
    </div>
    <div class="card">
      <label class="field-label">Rejoindre avec un code</label>
      <input id="code" class="code-input" type="text" maxlength="4" placeholder="K4TZ" />
      <button class="btn secondary" id="join">Rejoindre</button>
    </div>
    <div class="card">
      <p class="sub">Modes : 🟢 Normal · 🔵 Topics · 🟣 Same Meme · 🟡 Relaxed — jusqu'à 30 joueurs, aucun compte requis.</p>
    </div>
  `));
  const nameInput = document.getElementById('name');
  const codeInput = document.getElementById('code');
  codeInput.addEventListener('input', () => { codeInput.value = codeInput.value.toUpperCase(); });
  document.getElementById('create').onclick = () => socket.emit('createGame', { name: nameInput.value });
  document.getElementById('join').onclick = () => socket.emit('joinGame', { name: nameInput.value, code: codeInput.value });
}

function lobbyScreen(state) {
  activelyInGame = true;
  const isHost = state.hostId === me.id;
  const s = state.settings;
  const playersHtml = state.players.map((p) => {
    const tag = p.id === state.hostId ? ' <span class="badge-host">👑 hôte</span>' : '';
    return `<li>${p.avatar} ${esc(p.name)}${tag}</li>`;
  }).join('');
  const modeCards = [
    ['normal', '🟢 Normal', 'Un template différent chacun'],
    ['topics', '🔵 Topics', 'Un thème imposé par manche'],
    ['same-meme', '🟣 Same Meme', 'Même template pour tous'],
    ['relaxed', '🟡 Relaxed', 'Sans scores, juste pour rire']
  ].map(([value, title, desc]) => `
    <div class="mode-card ${s.mode === value ? 'selected' : ''}" data-mode="${value}">
      <strong>${title}</strong>${desc}
    </div>`).join('');

  render(el(`
    <div class="topbar"><span class="code">SALLE ${esc(state.code)}</span><span class="sub">${state.players.length}/30</span></div>
    <div class="card">
      <h2>🃏 Code de partie</h2>
      <div class="code-box">${esc(state.code)}</div>
      <p class="sub">Partage ce code pour que tes amis te rejoignent (téléphone ou PC).</p>
    </div>
    <div class="card">
      <h2>👥 Joueurs (${state.players.length})</h2>
      <ul class="player-list">${playersHtml}</ul>
    </div>
    <div class="card">
      <h2>⚙️ Réglages</h2>
      ${isHost ? `<div class="mode-grid">${modeCards}</div>
        <div class="settings-row">
          <div><label class="field-label">Manches (1–20)</label><input id="rounds" type="number" min="1" max="20" value="${s.rounds}" /></div>
          <div><label class="field-label">Création (30–300 s)</label><input id="createSeconds" type="number" min="30" max="300" value="${s.createSeconds}" /></div>
          <div><label class="field-label">Vote (5–60 s)</label><input id="voteSeconds" type="number" min="5" max="60" value="${s.voteSeconds}" /></div>
        </div>` : `<p class="sub">${esc(modeLabel(s.mode))} · ${s.rounds} manches · ${s.createSeconds} s de création · ${s.voteSeconds} s de vote</p>`}
    </div>
    ${isHost ? '<button class="btn" id="start">🚀 Lancer la partie</button>' : '<p class="sub" style="text-align:center;margin-top:16px">En attente que l&rsquo;hôte lance la partie…</p>'}
  `));

  if (isHost) {
    document.querySelectorAll('.mode-card').forEach((card) => {
      card.onclick = () => socket.emit('updateSettings', { mode: card.dataset.mode });
    });
    ['#rounds', '#createSeconds', '#voteSeconds'].forEach((sel) => {
      document.querySelector(sel).addEventListener('change', () => {
        socket.emit('updateSettings', {
          rounds: parseInt(document.getElementById('rounds').value, 10),
          createSeconds: parseInt(document.getElementById('createSeconds').value, 10),
          voteSeconds: parseInt(document.getElementById('voteSeconds').value, 10)
        });
      });
    });
    document.getElementById('start').onclick = () => socket.emit('startGame');
  }
}

function createScreen(data) {
  if (countdown) countdown.stop();
  const others = data.players || [];
  render(el(`
    <div class="topbar">
      <span class="sub">Manche ${data.round}/${data.totalRounds} · ${esc(modeLabel(data.mode))}</span>
      <span id="timer"></span>
    </div>
    ${data.topic ? `<div style="text-align:center"><span class="topic-chip">🎯 ${esc(data.topic)}</span></div>` : ''}
    <div class="meme-preview" style="background:linear-gradient(135deg,${data.template.gradient[0]},${data.template.gradient[1]})">
      <div class="big">${data.template.emoji}</div>
      <div class="meme-top">${esc(data.template.topText)}</div>
      <div class="meme-text" id="previewText">…</div>
    </div>
    <p class="sub" style="margin-top:10px">💡 ${esc(data.template.hint)}</p>
    <div id="createForm">
      <label class="field-label">Ta punchline</label>
      <input id="text" type="text" maxlength="120" placeholder="Écris la meilleure punchline…" />
      <div class="counter"><span id="count">0</span>/120</div>
      <div class="card">
        <h2>🤝 Ton Meme Buddy (optionnel)</h2>
        <p class="sub">Pari sur le joueur dont le meme va cartonner : tu gagnes la moitié de ses points… ou tu perds avec lui.</p>
        <div class="buddy-row" id="buddyRow">
          ${others.map((p) => `<span class="buddy-chip" data-buddy="${p.id}">${p.avatar} ${esc(p.name)}</span>`).join('')}
        </div>
      </div>
    </div>
    <p class="progress" id="submittedNote"></p>
  `));

  const timerSlot = document.getElementById('timer');
  countdown = startCountdown(data.createSeconds);
  timerSlot.appendChild(countdown.timerEl);

  const textInput = document.getElementById('text');
  const previewText = document.getElementById('previewText');
  textInput.addEventListener('input', () => {
    previewText.textContent = textInput.value || '…';
    document.getElementById('count').textContent = textInput.value.length;
  });

  const confirmMeme = () => {
    if (!textInput.value.trim()) return;
    textInput.disabled = true;
    socket.emit('submitMeme', { text: textInput.value.trim() });
  };
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmMeme();
  });

  document.querySelectorAll('.buddy-chip').forEach((chip) => {
    chip.onclick = () => {
      document.querySelectorAll('.buddy-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      socket.emit('chooseBuddy', { buddyId: chip.dataset.buddy });
    };
  });

  listenOnce('meme:accepted', () => {
    textInput.disabled = true;
    document.getElementById('createForm').style.display = 'none';
    document.getElementById('submittedNote').textContent = '✅ Meme envoyé ! En attente des autres joueurs…';
  });

  listenOnce('create:progress', (progress) => {
    document.getElementById('submittedNote').textContent = progress
      ? `${progress.submitted}/${progress.total} memes envoyés`
      : document.getElementById('submittedNote').textContent;
  });
}

function voteScreen(data) {
  if (countdown) countdown.stop();
  const isMine = data.authorId === me.id;
  render(el(`
    <div class="topbar">
      <span class="sub">Meme ${data.index + 1}/${data.total}</span>
      <span id="timer"></span>
    </div>
    <div class="vote-meme" style="background:linear-gradient(135deg,${data.gradient[0]},${data.gradient[1]})">
      <div class="big">${data.emoji}</div>
      <div class="meme-top">${esc(data.topText)}</div>
      <div class="meme-text">${esc(data.text)}</div>
      <div class="vote-author">par ${esc(data.authorName)}${isMine ? ' (toi)' : ''}</div>
    </div>
    ${isMine
      ? '<p class="sub" style="text-align:center;margin-top:14px">C\'est ton meme — tu ne votes pas pour toi 😎</p>'
      : `<div class="vote-buttons">
          <button class="vote-btn" data-vote="up">👍</button>
          <button class="vote-btn" data-vote="meh">😐</button>
          <button class="vote-btn" data-vote="down">👎</button>
        </div>
        <p class="sub" style="text-align:center;margin-top:10px">👍 +20 · 😐 0 · 👎 −20</p>`}
  `));
  const timerSlot = document.getElementById('timer');
  countdown = startCountdown(data.voteSeconds);
  timerSlot.appendChild(countdown.timerEl);
  if (!isMine) {
    document.querySelectorAll('.vote-btn').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.vote-btn').forEach((b) => b.classList.remove('picked'));
        btn.classList.add('picked', btn.dataset.vote);
        socket.emit('castVote', { vote: btn.dataset.vote });
      };
    });
    listenOnce('vote:accepted', ({ vote }) => {
      document.querySelectorAll('.vote-btn').forEach((b) => {
        b.classList.toggle('picked', b.dataset.vote === vote);
      });
    });
    listenOnce('vote:progress', (progress) => {
      const note = document.querySelector('.vote-author');
      if (note && progress) note.textContent = `${progress.votes} vote(s) enregistré(s)`;
    });
  }
}

function deltaHtml(delta) {
  if (delta === null || delta === undefined || delta === 0) return '';
  return delta > 0
    ? ` <span class="delta pos">(+${delta})</span>`
    : ` <span class="delta neg">(${delta})</span>`;
}

function resultsScreen(data) {
  if (countdown) countdown.stop();
  const isHost = lobby && lobby.hostId === me.id;
  const isRelaxed = data.memes.some((m) => m.score === null);
  const myBuddy = data.buddyResults && data.buddyResults[me.id];
  const podium = isRelaxed ? '' : `
    <table class="standings"><tbody>${data.standings.map((p, i) => `
      <tr>
        <td class="rank">${['🥇', '🥈', '🥉'][i] || i + 1}</td>
        <td>${p.avatar} ${esc(p.name)}</td>
        <td class="score">${p.score === null ? '—' : p.score}${deltaHtml(p.roundDelta)}</td>
      </tr>`).join('')}</tbody></table>`;
  const memesHtml = (data.memes || []).map((m) => `
    <div class="result-meme" style="background:linear-gradient(135deg,${m.gradient[0]},${m.gradient[1]})">
      <div class="who">${m.emoji} par ${esc(m.authorName)}</div>
      <div class="meme-top">${esc(m.topText)}</div>
      <div class="meme-text" style="font-size:1.1rem">${esc(m.text)}</div>
      ${m.votes ? `<div class="result-votes">👍 ${m.votes.up} · 😐 ${m.votes.meh} · 👎 ${m.votes.down}</div>` : ''}
      <div class="result-score">${m.score === null ? 'Mode relaxed 😌' : `${m.score > 0 ? '+' : ''}${m.score} pts`}</div>
    </div>`).join('');
  const buddyNote = myBuddy
    ? `<div class="buddy-note">🤝 Ton Meme Buddy (${esc(myBuddy.buddyName)}) : ${myBuddy.bonus >= 0 ? '+' : ''}${myBuddy.bonus} pts pour toi</div>`
    : '';
  render(el(`
    <h2>${data.gameOver ? '🏁 Résultats finaux' : `📊 Résultats — manche ${data.rounds}/${data.totalRounds}`}</h2>
    ${buddyNote}
    ${podium}
    <h2>🃏 Les memes de la manche</h2>
    ${memesHtml}
    ${isHost && !data.gameOver ? '<button class="btn" id="next">➡️ Manche suivante</button>' : ''}
    ${isHost && data.gameOver ? '<button class="btn" id="again">🔁 Nouvelle partie</button>' : ''}
    ${!isHost ? '<div class="card"><p class="sub" style="text-align:center">En attente de l&rsquo;hôte…</p></div>' : ''}
  `));
  const nextBtn = document.getElementById('next');
  if (nextBtn) nextBtn.onclick = () => socket.emit('startGame');
  const againBtn = document.getElementById('again');
  if (againBtn) againBtn.onclick = () => socket.emit('nextGame');
}

const onceHandlers = new Map();
function listenOnce(event, handler) {
  if (!onceHandlers.has(event)) {
    onceHandlers.set(event, []);
  }
  onceHandlers.get(event).push(handler);
}
socket.onAny((event, ...args) => {
  const handlers = onceHandlers.get(event);
  if (!handlers) return;
  onceHandlers.set(event, []);
  handlers.forEach((h) => h(...args));
});

function clearOnce(event) {
  onceHandlers.set(event, []);
}

socket.on('connect', () => {
  me.id = socket.id;
  clearOnce('meme:accepted');
  clearOnce('create:progress');
  clearOnce('vote:accepted');
  clearOnce('vote:progress');
  homeScreen();
});

socket.on('joinResult', ({ lobby: state, error }) => {
  if (error) {
    homeScreen(error);
    return;
  }
  lobby = state;
  lobbyScreen(state);
});

socket.on('lobby:update', (state) => {
  if (!activelyInGame) return;
  lobby = state;
  if (state.phase === 'lobby') lobbyScreen(state);
});

socket.on('round:create', (data) => {
  createScreen(data);
});

socket.on('vote:meme', (data) => {
  voteScreen(data);
});

socket.on('round:results', (data) => {
  resultsScreen(data);
});

socket.on('game:reset', () => {
  notice('🔁 Nouvelle partie ! Retour au lobby…');
});

socket.on('game:closed', () => notice('La partie a été fermée par l&rsquo;hôte.'));

socket.on('connect_error', () => {
  if (!app.childNodes.length) render(el('<div class="connecting">Connexion au serveur…</div>'));
});
