import { Socket } from 'socket.io';
import { ManageRooms } from './manageRooms';

export interface User {
    socket: Socket;
    name: string;
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
        this.users.push({ socket, name });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.handlers(socket);

    }

    removeUser(socketId: string) {

        const user = this.users.find(user => user.socket.id === socketId);
        if (!user) return;
        this.users = this.users.filter(user => user.socket.id !== socketId);
        this.queue = this.queue.filter(id => id === socketId);

    }

    clearQueue() {
        console.log("clearing queue", this.queue.length)
        if (this.queue.length < 2) return;

        const id1 = this.queue.pop();
        const id2 = this.queue.pop();

        const user1 = this.users.find(user => user.socket.id === id1);
        const user2 = this.users.find(user => user.socket.id === id2);


        if (!user1 || !user2) return;

        const room = this.roomManager.addRoom(user1, user2);
        // Remove the users from the queue before the next recursion
        this.queue.shift(); // Remove the first user
        this.queue.shift(); // Remove the second user

        this.clearQueue();
    }

    handlers(socket: Socket) {
        socket.on('offer', ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });

        socket.on('answer', ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });

        socket.on('add-ice-candidate', ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
        }
        );

        socket.on('disconnect', () => {
            this.removeUser(socket.id);
        });
    }

}