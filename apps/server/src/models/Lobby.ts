import { v4 as uuidv4 } from 'uuid';

export interface Player {
  id: string;
  name: string;
  score: number;
  socketId: string;
}

export interface Meme {
  id: string;
  template: string;
  caption: string;
  creatorId: string;
  votes: number;
  votedBy: string[];
}

export interface Lobby {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  memes: Meme[];
  currentTemplate: string;
  status: 'waiting' | 'submitting' | 'voting' | 'results';
  createdAt: Date;
  maxPlayers: number;
  isPublic: boolean;
}

export class LobbyManager {
  private lobbies: Map<string, Lobby>;

  constructor() {
    this.lobbies = new Map();
  }

  createLobby(hostId: string, name: string, maxPlayers: number = 8, isPublic: boolean = true): Lobby {
    const lobby: Lobby = {
      id: uuidv4(),
      name,
      hostId,
      players: [{ id: hostId, name: 'Host', score: 0, socketId: '' }],
      memes: [],
      currentTemplate: '',
      status: 'waiting',
      createdAt: new Date(),
      maxPlayers,
      isPublic,
    };
    this.lobbies.set(lobby.id, lobby);
    return lobby;
  }

  getLobby(id: string): Lobby | undefined {
    return this.lobbies.get(id);
  }

  joinLobby(lobbyId: string, player: Player): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    if (lobby.players.length >= lobby.maxPlayers) return false;
    
    lobby.players.push(player);
    return true;
  }

  leaveLobby(lobbyId: string, playerId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    lobby.players = lobby.players.filter(p => p.id !== playerId);
    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
    }
    return true;
  }

  addMeme(lobbyId: string, meme: Meme): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    lobby.memes.push(meme);
    return true;
  }

  voteForMeme(lobbyId: string, memeId: string, voterId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    const meme = lobby.memes.find(m => m.id === memeId);
    if (!meme) return false;
    if (meme.votedBy.includes(voterId)) return false;
    
    meme.votes += 1;
    meme.votedBy.push(voterId);
    return true;
  }

  setCurrentTemplate(lobbyId: string, template: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    lobby.currentTemplate = template;
    return true;
  }

  setLobbyStatus(lobbyId: string, status: Lobby['status']): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    lobby.status = status;
    return true;
  }

  getAllLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  deleteLobby(id: string): boolean {
    return this.lobbies.delete(id);
  }
}

export const lobbyManager = new LobbyManager();
