import {Socket } from 'socket.io';
import { ManageRooms } from './manageRooms';

export interface User {
    socket: Socket;
    name : string;
}

export class ManageUsers {
    private users: User[];
    private queue: string[];
    private roomManager: ManageRooms;

    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new ManageRooms();
    }

    addUser(socket: Socket, name: string) {
        this.users.push({socket, name});
        this.queue.push(socket.id);
        this.clearQueue();
        this.handlers(socket);

    }

    removeUser(socketId: string) {
        this.users = this.users.filter(user => user.socket.id !== socketId);
        this.queue = this.queue.filter(id => id !== socketId);

    }

    clearQueue() {
        if (this.queue.length < 2) return;

        const user1 = this.users.find(user => user.socket.id === this.queue[0]);
        const user2 = this.users.find(user => user.socket.id === this.queue[1]);

        if (!user1 || !user2) return;

        const room = this.roomManager.addRoom(user1, user2);
    }

    handlers(socket: Socket) {
        socket.on('offer', ({sdp, roomId}:{sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp);
        });

        socket.on('answer', ({sdp, roomId}:{sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp);
        });
    }

}