import { Server } from 'socket.io';
import { lobbyManager, Lobby, Player, Meme } from '../models/Lobby';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a lobby
    socket.on('joinLobby', (data: { lobbyId: string; player: Player }) => {
      console.log(`Player ${data.player.name} joining lobby ${data.lobbyId}`);
      
      // Update player's socketId
      data.player.socketId = socket.id;
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      // Join the socket room
      socket.join(data.lobbyId);
      
      // Add player to lobby
      const existingPlayerIndex = lobby.players.findIndex(p => p.id === data.player.id);
      if (existingPlayerIndex >= 0) {
        lobby.players[existingPlayerIndex] = data.player;
      } else {
        lobby.players.push(data.player);
      }

      // Notify everyone in the lobby
      io.to(data.lobbyId).emit('lobbyUpdated', lobby);
      io.to(data.lobbyId).emit('message', {
        type: 'system',
        content: `${data.player.name} has joined the lobby`,
      });
    });

    // Leave a lobby
    socket.on('leaveLobby', (data: { lobbyId: string; playerId: string }) => {
      console.log(`Player ${data.playerId} leaving lobby ${data.lobbyId}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) return;

      // Remove player from lobby
      lobbyManager.leaveLobby(data.lobbyId, data.playerId);
      
      // Leave the socket room
      socket.leave(data.lobbyId);

      // Notify everyone in the lobby
      io.to(data.lobbyId).emit('lobbyUpdated', lobby);
      io.to(data.lobbyId).emit('message', {
        type: 'system',
        content: `A player has left the lobby`,
      });
    });

    // Create a new meme
    socket.on('createMeme', (data: { lobbyId: string; meme: Omit<Meme, 'id' | 'votes' | 'votedBy'> }) => {
      console.log(`New meme created in lobby ${data.lobbyId}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      const meme: Meme = {
        ...data.meme,
        id: Date.now().toString(),
        votes: 0,
        votedBy: [],
      };

      lobbyManager.addMeme(data.lobbyId, meme);
      
      // Notify everyone in the lobby
      io.to(data.lobbyId).emit('newMeme', meme);
      io.to(data.lobbyId).emit('message', {
        type: 'system',
        content: `New meme created by ${data.meme.creatorId}`,
      });
    });

    // Vote for a meme
    socket.on('voteMeme', (data: { lobbyId: string; memeId: string; voterId: string }) => {
      console.log(`Vote for meme ${data.memeId} in lobby ${data.lobbyId}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      const success = lobbyManager.voteForMeme(data.lobbyId, data.memeId, data.voterId);
      if (!success) {
        socket.emit('error', { message: 'Failed to vote' });
        return;
      }

      // Get updated meme
      const meme = lobby.memes.find(m => m.id === data.memeId);
      if (meme) {
        io.to(data.lobbyId).emit('memeVoted', meme);
      }
    });

    // Change lobby status (host only)
    socket.on('changeLobbyStatus', (data: { lobbyId: string; status: Lobby['status'] }) => {
      console.log(`Changing lobby ${data.lobbyId} status to ${data.status}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      lobbyManager.setLobbyStatus(data.lobbyId, data.status);
      
      // Notify everyone in the lobby
      io.to(data.lobbyId).emit('lobbyStatusChanged', {
        lobbyId: data.lobbyId,
        status: data.status,
      });
    });

    // Set current template
    socket.on('setTemplate', (data: { lobbyId: string; template: string }) => {
      console.log(`Setting template for lobby ${data.lobbyId}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      lobbyManager.setCurrentTemplate(data.lobbyId, data.template);
      
      // Notify everyone in the lobby
      io.to(data.lobbyId).emit('templateChanged', {
        lobbyId: data.lobbyId,
        template: data.template,
      });
    });

    // Chat message
    socket.on('sendMessage', (data: { lobbyId: string; playerId: string; message: string }) => {
      console.log(`Message from ${data.playerId} in lobby ${data.lobbyId}`);
      
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      const player = lobby.players.find(p => p.id === data.playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      io.to(data.lobbyId).emit('message', {
        type: 'chat',
        playerId: data.playerId,
        playerName: player.name,
        content: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Find all lobbies where this socket is connected
      const lobbies = lobbyManager.getAllLobbies();
      for (const lobby of lobbies) {
        const player = lobby.players.find(p => p.socketId === socket.id);
        if (player) {
          lobbyManager.leaveLobby(lobby.id, player.id);
          io.to(lobby.id).emit('lobbyUpdated', lobby);
          io.to(lobby.id).emit('message', {
            type: 'system',
            content: `${player.name} has disconnected`,
          });
        }
      }
    });
  });
}
