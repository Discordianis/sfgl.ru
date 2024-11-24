import React, {useEffect} from "react";
import './NotFound.css'
import notFound from '../../../public/background/pc-err-bg.dcfa27e.jpg'
import Button from "../Button/Button.tsx";
import {NavLink} from "react-router-dom";

const NotFound:React.FC = () => {

    useEffect(() => {
        const existVideo = document.getElementById('background-video');
        if (existVideo) {
            existVideo.remove();
        }

        const body = document.body;
        body.style.backgroundImage = `url('${notFound}')`;

        return () => {
            body.style.backgroundImage = '';
        };
    }, [])

    return (
        <div className={'not_found_root'}>
            <div className={'not_found_span'}>
                <span>—</span>
                <span>404</span>
            </div>
            <div className={'not_found_button'}>
                <NavLink to={'/'}>
                    <Button>Главная</Button>
                </NavLink>
            </div>
        </div>
    )
}
export default NotFound