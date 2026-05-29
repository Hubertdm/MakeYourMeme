import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { lobbyRouter } from './routes/lobby';
import { setupSocketHandlers } from './sockets/socketHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/lobbies', lobbyRouter);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io connected and ready`);
});

export { io };
