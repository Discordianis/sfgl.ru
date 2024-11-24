import React from "react";
import login from '../../../../public/icons/login.png'
import {NavLink} from "react-router-dom";
import ProfileButton from "./ProfileButton.tsx";

const Login: React.FC = () => {
    const token = localStorage.getItem('token')

    return(
        <>
            {!token ?
                <div className={'login_root'}>
                    <div>
                        <nav>
                            <NavLink to={'/login'}>
                                <span>Войти</span>
                                <img src={`${login}`} alt={'login_icon'}/>
                            </NavLink>
                        </nav>
                    </div>
                </div>
            :
                <div className={'profile_button'}>
                    <ProfileButton />
                </div>
            }
        </>
    )
}

export default Login