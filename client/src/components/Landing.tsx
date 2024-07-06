import { useEffect, useRef, useState } from 'react';
import Room from './Room';


const Landing = () => {

    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const getMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        if (!videoRef.current) {
            return;
        }

        videoRef.current.srcObject = new MediaStream([videoTrack]);
        videoRef.current.play();
    }

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getMedia();
        }
    }
        , [videoRef])

    if (!joined) {
        return (
            <div>
                <video ref={videoRef} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <button onClick={() => {
                    setJoined(true);
                }}>Join</button>
            </div>
        );
    }

    return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
}

export default Landing;