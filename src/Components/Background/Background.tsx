import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BGdal from '../../../public/background/bgVideo.229165b.mp4';
import BGfog from '../../../public/background/fog.webm';
import BGlib from '../../../public/background/witches.jpg';

const Background: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const body = document.body;

        let bgDalVideo = document.getElementById('background-video') as HTMLVideoElement;
        let bgFogVideo = document.getElementById('bg-fog-video') as HTMLVideoElement;

        if (!bgDalVideo) {
            bgDalVideo = document.createElement('video');
            bgDalVideo.id = 'background-video';
            bgDalVideo.src = BGdal;
            bgDalVideo.autoplay = true;
            bgDalVideo.loop = true;
            bgDalVideo.muted = true;
            bgDalVideo.style.position = 'fixed';
            bgDalVideo.style.top = '0';
            bgDalVideo.style.left = '0';
            bgDalVideo.style.width = '100%';
            bgDalVideo.style.height = '100%';
            bgDalVideo.style.objectFit = 'cover';
            bgDalVideo.style.zIndex = '1';
            bgDalVideo.style.display = 'none';
            document.body.appendChild(bgDalVideo);
        }

        if (!bgFogVideo) {
            bgFogVideo = document.createElement('video');
            bgFogVideo.id = 'bg-fog-video';
            bgFogVideo.src = BGfog;
            bgFogVideo.autoplay = true;
            bgFogVideo.loop = true;
            bgFogVideo.muted = true;
            bgFogVideo.style.position = 'fixed';
            bgFogVideo.style.top = '0';
            bgFogVideo.style.left = '0';
            bgFogVideo.style.width = '100%';
            bgFogVideo.style.height = '100%';
            bgFogVideo.style.objectFit = 'cover';
            bgFogVideo.style.zIndex = '1';
            bgFogVideo.style.display = 'none';
            bgFogVideo.style.filter = 'brightness(3.0)';
            document.body.appendChild(bgFogVideo);
        }

        if (location.pathname === '/library' || location.pathname === '/library/') {
            body.style.backgroundImage = `url(${BGlib})`;
            bgFogVideo.style.display = 'block';
            bgDalVideo.style.display = 'none';
        } else {
            body.style.backgroundImage = 'none';
            bgFogVideo.style.display = 'none';
            bgDalVideo.style.display = 'block';
        }

        body.style.backgroundSize = 'cover';
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';

        return () => {
            if (bgDalVideo) {
                bgDalVideo.style.display = 'none';
            }
            if (bgFogVideo) {
                bgFogVideo.style.display = 'none';
            }
        };
    }, [location.pathname]);

    return null;
};

export default Background;
