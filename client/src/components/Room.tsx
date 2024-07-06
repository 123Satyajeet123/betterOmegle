import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:5000";

const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [lobby, setLobby] = useState(true);
    const [roomId, setRoomId] = useState<string | null>(null);

    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);

    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);

    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = io(URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('send-offer', async ({ roomId }) => {
            setLobby(false);
            setRoomId(roomId);

            const pc = new RTCPeerConnection();
            setSendingPc(pc);

            if (localAudioTrack) pc.addTrack(localAudioTrack);
            if (localVideoTrack) pc.addTrack(localVideoTrack);

            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: event.candidate, type: "sender",
                        roomId
                    });
                }
            };

            // const offer = await pc.createOffer();
            // await pc.setLocalDescription(offer);

            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { sdp: offer, roomId });
            }
        });

        socket.on('offer', async ({ roomId, sdp: remoteSdp }) => {
            alert("send answer please");
            setLobby(false);
            setRoomId(roomId);

            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp);

            const sdp = await pc.createAnswer();

            await pc.setLocalDescription(sdp);

            const stream = new MediaStream();

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);

            // trickle ice
            setReceivingPc(pc);
            (window as any).pcr = pc;

            pc.ontrack = (event) => {
                alert("track received");
            }

            pc.onicecandidate = async (event) => {
                if (!event.candidate) {
                    return;
                }

                if (event.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: event.candidate, type: "receiver",
                        roomId
                    });
                }
            };

            socket.emit("answer", { sdp, roomId });

            setTimeout(() => {

                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;

                if (track1.kind == "video") {
                    setRemoteVideoTrack(track2);
                    setRemoteAudioTrack(track1);

                }
                else {
                    setRemoteAudioTrack(track1);
                    setRemoteVideoTrack(track2);
                }

                remoteVideoRef.current.srcObject.addTrack(track1);
                remoteVideoRef.current.srcObject.addTrack(track2);

                remoteVideoRef.current.play();

            }, 5000);

            // await pc.setRemoteDescription(remoteSdp);
            // const answer = await pc.createAnswer();
            // await pc.setLocalDescription(answer);
        });

        socket.on('answer', async ({ roomId, sdp }) => {
            setLobby(false);
            setSendingPc((prev) => {
                prev?.setRemoteDescription(sdp);

                return prev;
            }
            );
        });

        socket.on("lobby", () => {
            setLobby(true);
        });

        socket.on("add-ice-candidate", async ({ candidate, type }) => {
            if (type == "sender") {
                setSendingPc((prev) => {

                    prev?.addIceCandidate(candidate);

                    return prev;
                });
            }
            else {
                setReceivingPc((prev) => {
                    prev?.addIceCandidate(candidate);
                    return prev;
                });
            }
        }
        );
        setSocket(socket);
    }, [name]);

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef]);

    return (
        <div>
            <h1>Hi {name}</h1>
            {lobby && <p>Waiting for other user to join</p>}
            {roomId && <p>Connected to room: {roomId}</p>}
            <video autoPlay width={400} height={400} ref={localVideoRef} />
            <video autoPlay width={400} height={400} ref={remoteVideoRef} />
        </div>
    );
};

export default Room;
