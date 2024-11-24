import React, {useRef, useState, useEffect, CSSProperties} from "react";
import './AudioPlayer.css';
import Button from "../Button/Button.tsx";

interface ISrc {
    src: string;
    image: string;
    isPlay: boolean;
    style?: CSSProperties
}

const AudioImagePlayer: React.FC<ISrc> = ({ src, image, isPlay, style }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.06);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.loop = false;
        }
    }, [volume]);

    const audio = audioRef.current;

    useEffect(() => {
        if (isPlay) {
            setIsPlaying(false)
            setProgress(0)
        }
        else {
            setIsPlaying(true)
        }
    }, [isPlay]);

    const togglePlayPause = () => {
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
        if (audio?.currentTime === audio?.duration) {
            setIsPlaying(false)
            setProgress(0)
            setCurrentTime(0)
        }
    }, [audio?.currentTime]);

    useEffect(() => {
        const audio = audioRef.current;

        if (audio) {
            const updateProgress = () => {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            };

            const handleLoadedMetadata = () => {
                setDuration(audio.duration);
            };

            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                audio.removeEventListener('timeupdate', updateProgress);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, []);

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(event.target.value));
    };

    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const clickPosition = (event.nativeEvent.offsetX / event.currentTarget.offsetWidth) * 100;
        if (audio) {
            audio.currentTime = (clickPosition / 100) * audio.duration;
        }
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
        } else {
            return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
        }
    };

    return (
        <div className="audio_image_player">
            <div className="controls">
                <img style={style} src={image} alt="music" className="audio-image" onClick={togglePlayPause} />
                <div className={'audio_img_controls'}>
                    <Button onClick={togglePlayPause}>
                        {isPlaying ?
                            <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                                <use className="ytp-svg-shadow"></use>
                                <path className="ytp-svg-fill"
                                      d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"
                                      id="ytp-id-60"></path>
                            </svg>
                            :
                            <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                                <use className="ytp-svg-shadow"></use>
                                <path className="ytp-svg-fill"
                                      d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"
                                      id="ytp-id-69"></path>
                            </svg>
                        }
                    </Button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                    <div>
                        <span>{formatTime(currentTime)} / {duration ? formatTime(duration) : '00:00'}</span>
                    </div>
                    <div className="progress-bar" onClick={handleProgressClick}>
                    <div className="progress" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
            </div>
            <audio ref={audioRef} src={src}></audio>
        </div>
    );
};

export default AudioImagePlayer;
