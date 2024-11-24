import React from "react";
import telegram from '../../../../public/icons/telegramIcon.png'
import gmail from '../../../../public/icons/gmailIcon.png'
import vk from '../../../../public/icons/vkIcon.png'
import './Footer.css'
import {NavLink} from "react-router-dom";

const Footer: React.FC = () => {
    return(
        <div className={'footer_root'}>
            <footer>
                <div className={'footer_top'}>
                    <div className={'footer_support'}>
                        <span>Блок помощи</span>
                        <div className={'footer_faq'}>
                            <NavLink to={'/faq'}>
                                <span>ЧаВо</span>
                            </NavLink>
                        </div>
                    </div>
                    <div className={'footer_social'}>
                        <span>Связаться с автором:</span>
                        <div>
                            <a href={'https://t.me/MrZaxter'}>
                                <img src={`${telegram}`} alt={'tg'}/>
                            </a>
                            <a href={'https://vk.com/discordianis'}>
                                <img src={`${vk}`} alt={'vk'}/>
                            </a>
                            <div>
                                <img src={`${gmail}`} alt={'gmail'}/>
                                <a href={'mailto:SymphonyOfFinality@gmail.com'}>SymphonyOfFinality@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'footer_bottom'}>
                    <div className={'footer_site'}>
                        <span>@ 2024, Time;Gate Keepers</span>
                    </div>
                    <div className={'footer_license'}>
                        <span>Все права (не) защищены. Все жалобы не принимаются</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
export default Footer