import React, { useRef, useState, useEffect } from "react";
import './AudioPlayer.css';

interface ISrc {
    src: string;
}

const AudioPlayer: React.FC<ISrc> = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.06;
            audioRef.current.loop = true
        }
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;

        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;

        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, []);

    return (
        <div className="audio-player">
            <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`} onClick={togglePlayPause}>
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
                <div className="bar bar5"></div>
            </div>

            <audio ref={audioRef} src={src}></audio>
        </div>
    );
};

export default AudioPlayer;
