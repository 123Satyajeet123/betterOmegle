"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRooms = void 0;
class ManageRooms {
    constructor() {
        this.rooms = {};
    }
    addRoom(user1, user2) {
        const roomId = this.generateRoomId();
        this.rooms[roomId] = { user1, user2 };
        user1.socket.emit("send-offer", { roomId });
        user2.socket.emit("send-answer", { roomId });
        return roomId;
    }
    deleteRoom(roomId) {
        delete this.rooms[roomId];
    }
    onOffer(roomId, sdp, senderId) {
        const room = this.rooms[roomId];
        if (!room)
            return; // Check if room exists
        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;
        user2.socket.emit("offer", { sdp, roomId });
    }
    onAnswer(roomId, sdp, senderId) {
        const room = this.rooms[roomId];
        if (!room)
            return; // Check if room exists
        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;
        user2.socket.emit("answer", { sdp, roomId });
    }
    onIceCandidate(roomId, senderId, candidate, type) {
        const room = this.rooms[roomId];
        if (!room)
            return; // Check if room exists
        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;
        user2.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
    generateRoomId() {
        let roomId;
        do {
            roomId = Math.random().toString(36).substring(7);
        } while (this.rooms.hasOwnProperty(roomId));
        return roomId;
    }
    getRoom(roomId) {
        return this.rooms[roomId];
    }
}
exports.ManageRooms = ManageRooms;
