import express from 'express';
import { lobbyManager } from '../models/Lobby';

const router = express.Router();

// Create a new lobby
router.post('/', (req, res) => {
  try {
    const { hostId, name, maxPlayers, isPublic } = req.body;
    
    if (!hostId || !name) {
      return res.status(400).json({ error: 'hostId and name are required' });
    }

    const lobby = lobbyManager.createLobby(hostId, name, maxPlayers, isPublic);
    res.status(201).json(lobby);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lobby' });
  }
});

// Get all public lobbies
router.get('/', (req, res) => {
  try {
    const lobbies = lobbyManager.getAllLobbies().filter(l => l.isPublic);
    res.json(lobbies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lobbies' });
  }
});

// Get a specific lobby
router.get('/:id', (req, res) => {
  try {
    const lobby = lobbyManager.getLobby(req.params.id);
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    res.json(lobby);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lobby' });
  }
});

// Join a lobby
router.post('/:id/join', (req, res) => {
  try {
    const { player } = req.body;
    const lobby = lobbyManager.getLobby(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    if (!player || !player.id || !player.name) {
      return res.status(400).json({ error: 'Player id and name are required' });
    }

    const success = lobbyManager.joinLobby(req.params.id, player);
    if (!success) {
      return res.status(400).json({ error: 'Failed to join lobby (maybe full)' });
    }

    res.json({ message: 'Joined lobby successfully', lobby });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join lobby' });
  }
});

// Leave a lobby
router.post('/:id/leave', (req, res) => {
  try {
    const { playerId } = req.body;
    const success = lobbyManager.leaveLobby(req.params.id, playerId);
    
    if (!success) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    res.json({ message: 'Left lobby successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave lobby' });
  }
});

// Delete a lobby
router.delete('/:id', (req, res) => {
  try {
    const success = lobbyManager.deleteLobby(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    res.json({ message: 'Lobby deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lobby' });
  }
});

export { router as lobbyRouter };
