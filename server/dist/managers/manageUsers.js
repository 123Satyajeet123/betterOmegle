"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageUsers = void 0;
const manageRooms_1 = require("./manageRooms");
class ManageUsers {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new manageRooms_1.ManageRooms();
    }
    addUser(socket, name) {
        this.users.push({ socket, name });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.handlers(socket);
    }
    removeUser(socketId) {
        const user = this.users.find(user => user.socket.id === socketId);
        if (!user)
            return;
        this.users = this.users.filter(user => user.socket.id !== socketId);
        this.queue = this.queue.filter(id => id === socketId);
    }
    clearQueue() {
        console.log("clearing queue", this.queue.length);
        if (this.queue.length < 2)
            return;
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        const user1 = this.users.find(user => user.socket.id === id1);
        const user2 = this.users.find(user => user.socket.id === id2);
        if (!user1 || !user2)
            return;
        const room = this.roomManager.addRoom(user1, user2);
        // Remove the users from the queue before the next recursion
        this.queue.shift(); // Remove the first user
        this.queue.shift(); // Remove the second user
        this.clearQueue();
    }
    handlers(socket) {
        socket.on('offer', ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        socket.on('answer', ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        socket.on('add-ice-candidate', ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
        });
        socket.on('disconnect', () => {
            this.removeUser(socket.id);
        });
    }
}
exports.ManageUsers = ManageUsers;
