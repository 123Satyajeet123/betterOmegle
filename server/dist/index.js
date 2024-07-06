"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const manageUsers_1 = require("./managers/manageUsers");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // Create the server with the express app
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
}); // Attach socket.io to the server instance
const userManager = new manageUsers_1.ManageUsers();
io.on('connection', (socket) => {
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
