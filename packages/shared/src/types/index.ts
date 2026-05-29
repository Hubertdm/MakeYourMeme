// Game Types
export interface Player {
  id: string;
  name: string;
  score: number;
  socketId?: string;
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

// Socket Events
export interface SocketEvents {
  joinLobby: { lobbyId: string; player: Player };
  leaveLobby: { lobbyId: string; playerId: string };
  createMeme: { lobbyId: string; meme: Omit<Meme, 'id' | 'votes' | 'votedBy'> };
  voteMeme: { lobbyId: string; memeId: string; voterId: string };
  changeLobbyStatus: { lobbyId: string; status: Lobby['status'] };
  setTemplate: { lobbyId: string; template: string };
  sendMessage: { lobbyId: string; playerId: string; message: string };
  
  // Server to client events
  lobbyUpdated: Lobby;
  lobbyStatusChanged: { lobbyId: string; status: Lobby['status'] };
  templateChanged: { lobbyId: string; template: string };
  newMeme: Meme;
  memeVoted: Meme;
  message: {
    type: 'system' | 'chat';
    playerId?: string;
    playerName?: string;
    content: string;
    timestamp?: string;
  };
  error: { message: string };
}

// API Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateLobbyRequest {
  hostId: string;
  name: string;
  maxPlayers?: number;
  isPublic?: boolean;
}

export interface JoinLobbyRequest {
  player: Player;
}
