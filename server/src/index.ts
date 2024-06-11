import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app); // Create the server with the express app

const io = new Server(server); // Attach socket.io to the server instance

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:5000');
});
