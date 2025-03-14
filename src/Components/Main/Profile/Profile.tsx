import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import './Profile.css'
import ProfileRelationShip from "./ProfileRelationShip/ProfileRelationShip.tsx";
import ProfileModalMenu from "./ProfileModalMenu/ProfileModalMenu.tsx";
import loadingCrab from '../../../../public/icons/loading.gif'
import useInput from "../../../hooks/useInput.tsx";
import editIcon from '../../../../public/icons/edit.png'
import AudioPlayer from "../../AudioPlayer/AudioPlayer.tsx";
import Loading from "../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import NotFound from "../../NotFound/NotFound.tsx";
import notFound from "../../../../public/background/pc-err-bg.dcfa27e.jpg";
import moment from "moment-timezone";
import {Button, TextField} from "@mui/material";
import {AboutPlaceholders} from "../../../placeholders/aboutPlaceholders.tsx";

const Profile: React.FC = () => {

    const [aboutEmpty, setAboutEmpty] = useState(false)
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState('')
    const [openInput, setOpenInput] = useState(false)
    const [musicExist, setMusicExist] = useState(false)
    const params = useParams()
    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const [innerWidth, setInnerWidth] = useState(window.innerWidth)

    const myself = useSelector((state: RootState) => state.myData)

    const aboutInput = useInput('', {maxLengthError: 601})

    const [placeholder, setPlaceholder] = useState("");

    useEffect(() => {
        const keys = Object.keys(AboutPlaceholders);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setPlaceholder(AboutPlaceholders[randomKey]);
    }, []);

    useEffect(() => {
        const handleResize = () => setInnerWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetching = async () => {
            const userRes = await fetch(`${server}`, {
                method: 'POST',
                body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
            })
            const data = await userRes.json();
            setProfile(data)
        }
        fetching().then()
    }, [params.nickname, server, token]);

    useEffect(() => {
        if (!profile?.status) {
            setError('Такого пользователя не существует!')
        }
        else {
            setError('')
        }
    }, [profile?.status]);

    useEffect(() => {
        if (profile?.info.about === null || profile?.info.about === '') {
            setAboutEmpty(true)
        }
        else setAboutEmpty(false)
    }, [profile?.info.about]);

    const updateAbout = async (e: React.FormEvent) => {
        e.preventDefault()
            const fetching = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'updateMyAbout', data: {about: aboutInput.value}, conditions: {nickname: params.nickname}})
            })
        const data = await fetching.json()
        if (!data.status){
            console.log(data?.info)
        }
        else {
            const fetching = async () => {
                const userRes = await fetch(`${server}`, {
                    method: 'POST',
                    body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
                })
                const data = await userRes.json();
                setProfile(data)
            }
            fetching()
        }
            setOpenInput(false)
    }

    useEffect(() => {
        if (profile?.info.about) {
            aboutInput.setValue(profile?.info.about)
        }
    }, [profile?.info.about]);

    useEffect(() => {
        if (profile?.info && profile?.info.background) {
            const backgroundOverlay = document.getElementById('background-overlay');

            if (backgroundOverlay) {
                backgroundOverlay.style.position = 'fixed';
                backgroundOverlay.style.top = '0';
                backgroundOverlay.style.left = '0';
                backgroundOverlay.style.width = '100%';
                backgroundOverlay.style.height = '100%';
                backgroundOverlay.style.zIndex = '-1';
                backgroundOverlay.style.background = `url('${profile?.info.background}') center / cover no-repeat`;
                backgroundOverlay.style.filter = 'brightness(70%)';

                const existVideo = document.getElementById('background-video');
                if (existVideo) {
                    existVideo.remove();
                }
            }
        } else {
            document.body.style.background = '';
        }
    }, [profile?.info]);

    useEffect(() => {
        if (profile?.info && profile?.info.music) {
            setMusicExist(true)
        }
        else {
            setMusicExist(false)
        }
    }, [profile?.info]);

    useEffect(() => {
        if (profile && profile?.info?.styles) {
            const styles = document.createElement('style');
            styles.id = 'custom_css';
            styles.innerHTML = profile?.info?.styles;
            document.head.appendChild(styles);
            console.log(styles)

            return () => {
                const style = document.getElementById('custom_css');
                if (style) {
                    style.remove();
                }
            };
        }
    }, [profile]);

    function formatDate(dateString: string, originalTimezone: string, timeZone: string): string {
        const utcDate = moment.tz(dateString, originalTimezone);
        const localDate = utcDate.tz(timeZone);

        const months = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];

        const day = localDate.date().toString().padStart(2, '0');
        const month = months[localDate.month()];
        const year = localDate.year();
        const hours = String(localDate.hours()).padStart(2, '0');
        const minutes = String(localDate.minutes()).padStart(2, '0');
        const seconds = String(localDate.seconds()).padStart(2, '0');

        return `${day} ${month} ${year}г., ${hours}:${minutes}:${seconds}`;
    }

    const checkOnline = (lastOnlineDate: Date | string, originalTimezone: string, timeZone: string) => {
        const utcDate = moment.tz(lastOnlineDate, originalTimezone);
        const lastOnline = utcDate.tz(timeZone).valueOf();

        const fiveMin = new Date().getTime() - 2 * 60 * 1000;
        return lastOnline >= fiveMin;
    }


    if (profile === null) {
        return <Loading />
    }
    if (profile?.info.length === 0) {
        const body = document.body
        body.style.backgroundImage = `url('${notFound}')`;
        return <NotFound />
    }

    return(
        <>
            <div className={'profile_main'}>
                {(musicExist && profile?.info) && (
                    <div className={'profile_audio_root'}>
                        <AudioPlayer src={`${profile?.info.music}`}/>
                    </div>
                )}
                {profile?.info ?
                    <div className={'profile_info'}>
                        <div className={'profile_left'}>
                            <div className={'user_avatar'}>
                                {innerWidth < 1110 &&
                                    <div className={'user_nickname'}>
                                        <span><strong>{profile?.info.custom_nickname}</strong></span>
                                        <span className={'profile_user_online'}>
                                    {checkOnline(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)
                                        ? '(в сети)'
                                        : profile?.info.orientation === 'woman'
                                            ? `(была в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                            : profile?.info.orientation === 'man'
                                                ? `(был в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                                : `(был(-а) в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`}
                                        </span>

                                    </div>
                                }
                                <img src={`${profile?.info.avatar}`} alt={'user-avatar'}/>
                                {profile?.info.nickname === myself.data?.info.nickname &&
                                    <ProfileModalMenu/>
                                }
                            </div>
                        </div>
                        <div className={'profile_right'}>
                            {innerWidth > 1110 &&
                                <div className={'user_nickname'}>
                                    <span><strong>{profile?.info.custom_nickname}</strong></span>
                                    <span className={'profile_user_online'}>
                                    {checkOnline(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)
                                        ? '(в сети)'
                                        : profile?.info.orientation === 'woman'
                                            ? `(была в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                            : profile?.info.orientation === 'man'
                                                ? `(был в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                                : `(был(-а) в сети: ${formatDate(profile?.info.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`}
                                    </span>
                                </div>
                            }
                            <div className={'user_about'}>
                                {(aboutEmpty && !openInput) ?
                                    profile?.info.nickname === myself.data?.info.nickname &&
                                    <div className={'user_about_empty'} onClick={() => setOpenInput(true)}>
                                        <span>Обо мне...
                                        <img src={`${editIcon}`} alt={'edit'}/>
                                        </span>
                                    </div>
                                    : (!openInput) &&
                                    <div className={'user_about_filled'}>
                                        <span>{aboutInput.value}
                                            {profile?.info.nickname === myself.data?.info.nickname &&
                                                <img src={`${editIcon}`} alt={'edit'}
                                                     onClick={() => setOpenInput(true)}/>
                                            }
                                        </span>
                                    </div>
                                }
                                {openInput &&
                                    <div className={'profile_about_input'}>
                                        <form onSubmit={updateAbout}>
                                            <TextField
                                                multiline
                                                inputProps={{ maxLength: 600 }}
                                                variant={'outlined'}
                                                label={'Обо мне'}
                                                placeholder={placeholder}
                                                minRows={2}
                                                sx={{
                                                    '&::before': {
                                                        border: '1.5px solid var(--Textarea-focusedHighlight)',
                                                        transform: 'scaleX(0)',
                                                        left: '2.5px',
                                                        right: '2.5px',
                                                        bottom: 0,
                                                        top: 'unset',
                                                        transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
                                                        borderRadius: 0,
                                                        borderBottomLeftRadius: '64px 20px',
                                                        borderBottomRightRadius: '64px 20px',
                                                    },
                                                    '&:focus-within::before': {
                                                        transform: 'scaleX(1)',
                                                    },
                                                }}
                                                value={aboutInput.value}
                                                onChange={(e) => aboutInput.onChange(e)}
                                            />
                                            <div>
                                                <Button variant={'contained'} disabled={aboutInput.maxLengthError}>Сохранить</Button>
                                                <Button variant={'contained'} onClick={() => {
                                                    setOpenInput(false);
                                                    aboutInput.setValue(`${profile?.info.about ? profile?.info.about : ''}`)
                                                }}>Отмена</Button>
                                            </div>
                                        </form>
                                    </div>
                                }
                            </div>
                            <ProfileRelationShip/>
                        </div>
                    </div>
                    :
                    <div>
                        {error ?
                            <span>{error}</span>
                            :
                            <div className={'loading'} style={{textAlign: 'center'}}>
                                <img src={`${loadingCrab}`} alt={'loading'}/>
                            </div>
                        }
                    </div>
                }
            </div>
            <div id="background-overlay"></div>
        </>
    )
}
export default Profile