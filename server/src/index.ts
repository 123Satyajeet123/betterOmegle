import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { ManageUsers } from './managers/manageUsers';

const app = express();
const server = http.createServer(app); // Create the server with the express app

const io = new Server(server,{
    cors: {
        origin: "*"
    }

}); // Attach socket.io to the server instance

const userManager =  new ManageUsers();
io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  userManager.addUser(socket, "user");
  socket.on('disconnect', () => {
    console.log('user disconnected');
    userManager.removeUser(socket.id);
  });
});

server.listen(5000, () => {
  console.log('server running at http://localhost:5000');
});
