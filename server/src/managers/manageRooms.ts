import { User } from "./manageUsers";

export class ManageRooms {

    private rooms: { [key: string]: { user1: User, user2: User } };

    constructor() {
        this.rooms = {};
    }

    addRoom(user1: User, user2: User): string {
        const roomId = this.generateRoomId();
        this.rooms[roomId] = { user1, user2 };

        user1.socket.emit("send-offer", { roomId });
        user2.socket.emit("send-answer", { roomId });


        return roomId;
    }

    deleteRoom(roomId: string) {
        delete this.rooms[roomId];
    }

    onOffer(roomId: string, sdp: string, senderId: string) {

        const room = this.rooms[roomId];
        if (!room) return; // Check if room exists

        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;

        user2.socket.emit("offer", { sdp, roomId });

    }

    onAnswer(roomId: string, sdp: string, senderId: string) {

        const room = this.rooms[roomId];

        if (!room) return; // Check if room exists
        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;

        user2.socket.emit("answer", { sdp, roomId });
    }

    onIceCandidate(roomId: string, senderId: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms[roomId];
        if (!room) return; // Check if room exists

        const user2 = room.user1.socket.id === senderId ? room.user2 : room.user1;

        user2.socket.emit("add-ice-candidate", ({ candidate, type }));
    }


    generateRoomId() {
        let roomId: string;
        do {
            roomId = Math.random().toString(36).substring(7);
        } while (this.rooms.hasOwnProperty(roomId));
        return roomId;
    }

    getRoom(roomId: string) {
        return this.rooms[roomId];
    }
}