import React, {useEffect} from "react";
import accessDeniedBG from "../../../public/background/accessDenied.jpg";
import './AccessDenied.css'
import Button from "../Button/Button.tsx";
import {NavLink} from "react-router-dom";
const AccessDenied:React.FC = () => {

    useEffect(() => {
        const body = document.body;
        const existVideo = document.getElementById('background-video')
        if (existVideo){
            existVideo.remove()
        }
        const previousBackgroundImage = body.style.backgroundImage;
        body.style.backgroundImage = `url('${accessDeniedBG}')`;
        return () => {
            body.style.backgroundImage = previousBackgroundImage;
        };
    }, []);

    return (
        <div className={'access_denied_root'}>
            <div>
                <span>Доступ был заблокирован. Если у вас возникли проблемы, пожалуйста, обратитесь к администрации сайта.</span>
            </div>
            <div>
                <NavLink to={'/'}>
                    <Button>На главную</Button>
                </NavLink>
            </div>
        </div>
    )
}
export default AccessDenied