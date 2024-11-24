import Logotype from '../../../../public/icons/logo.png'
import React from "react";
import {NavLink} from "react-router-dom";

const Logo: React.FC = () => {
    return (
        <div className={'logo'}>
            <nav>
                <NavLink to={'/'}>
                    <img src={`${Logotype}`} alt={'logotype'}/>
                </NavLink>
            </nav>
        </div>
    )
}

export default Logo