const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { registerGameHandlers } = require('./src/game');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  registerGameHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`MakeYourMeme pret sur http://localhost:${PORT}`);
});
