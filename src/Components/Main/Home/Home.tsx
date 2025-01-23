import React from "react";
import telegram from '../../../../public/icons/telegram.jpg'
import shikimori from '../../../../public/icons/shikimori.jpg'
import discord from '../../../../public/icons/discord.jpg'
import './Home.css'
import Footer from "../Footer/Footer.tsx";

const Home: React.FC = () => {
    return (
        <div className={'home_page_root'}>
            <div className={'home_info'}>
                <div className={'home_title'}>
                    <div className={'home_main_title'}>
                        <h3>Future</h3>
                        <h3>Gadget Lab</h3>
                    </div>
                    <div className={'home_subtitle'}>
                <h3>
                    Хранилище вечных и великих душ Хранителей
                </h3>
                    </div>
                </div>
                <div className={'home_social'}>
                    <div>
                        <img src={`${telegram}`} alt={'telegram qrcode'}/>
                    </div>
                    <a href={'https://discord.gg/jYbsPjw'}>
                        <img src={`${discord}`} alt={'discord link'}/>
                    </a>
                    <a href={'https://shikimori.one/clubs/2624-klub-gadzhetov-buduschego'}>
                        <img src={`${shikimori}`} alt={'shikimori link'}/>
                    </a>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default Home