import { User } from "./manageUsers";

export class ManageRooms {

    private rooms: { [key: string]: { user1: User, user2: User } };
    
    constructor() {
        this.rooms = {};
    }

    addRoom(user1: User, user2: User) {
        let roomId = this.generateRoomId();
        this.rooms[roomId] = { user1, user2 };
        
        user1.socket.emit("send-offer",{
            roomId: roomId
        })
    }

    onOffer (roomId:string, sdp : string){
        const user2 = this.rooms[roomId].user2;
        user2.socket.emit("offer",{
            sdp

        })
    }

    onAnswer(roomId:string, sdp: string){
        const user1 = this.rooms[roomId].user1;
        user1.socket.emit("offer",{
            sdp
        })
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