import React, {useEffect, useState} from "react";
import deadAvatar from '../../public/icons/dead_avatar.png';
import Loading from "../Components/Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../redux";
import moment from "moment-timezone";
import {NavLink} from "react-router-dom";

interface IUserInfo {
    custom_nickname: string;
    nickname: string;
    avatar: string;
    id: string;
    token: string;
    online: number;
    last_online_date: string
    orientation: string,
    about: string,
}

interface User {
    status: boolean,
    info: {
        [key: number]: IUserInfo
    }
}

const GetAllUsers: React.FC = () => {
    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')

    const [dataJson, setDataJson] = useState<User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!dataJson) {
                const response = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllUsers'})
                })
                const data = await response.json()
                if (data) {
                    setDataJson(data);
                }
            }
        };
        fetchData().then();
    }, [server]);

    function convertUTCToLocal(dateString, originalTimezone, timeZone) {
        const utcDate = moment.tz(dateString, originalTimezone);
        return utcDate.tz(timeZone);
    }

    const sortedUsers = dataJson?.info
        ? Object.values(dataJson.info).sort((a: IUserInfo, b: IUserInfo) => {
            const now = moment();
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const originalTimezone = 'Europe/Moscow';
            const dateA = convertUTCToLocal(a.last_online_date, originalTimezone, tz);
            const dateB = convertUTCToLocal(b.last_online_date, originalTimezone, tz);

            const offlineTimeA = now.diff(dateA);
            const offlineTimeB = now.diff(dateB);

            if (offlineTimeA >= 2 * 60 * 1000 && offlineTimeB < 2 * 60 * 1000) {
                return 1;
            }
            if (offlineTimeA < 2 * 60 * 1000 && offlineTimeB >= 2 * 60 * 1000) {
                return -1;
            }

            const isOnlineA = offlineTimeA < 2 * 60 * 1000;
            const isOnlineB = offlineTimeB < 2 * 60 * 1000;

            if (isOnlineA && !isOnlineB) return -1;
            if (!isOnlineA && isOnlineB) return 1;

            if (!isOnlineA && !isOnlineB) {
                return dateB.diff(dateA);
            }

            const isRussianA = /^[а-яА-ЯёЁ]/.test(a.custom_nickname);
            const isRussianB = /^[а-яА-ЯёЁ]/.test(b.custom_nickname);

            if (isRussianA && !isRussianB) return -1;
            if (!isRussianA && isRussianB) return 1;

            return a.custom_nickname?.localeCompare(b.custom_nickname, 'ru');
        })
        : [];


    const checkOnline = (lastOnlineDate: Date | string, originalTimezone: string, timeZone: string) => {
        const utcDate = moment.tz(lastOnlineDate, originalTimezone);
        const lastOnline = utcDate.tz(timeZone).valueOf();

        const fiveMin = new Date().getTime() - 2 * 60 * 1000;
        return lastOnline >= fiveMin;
    }

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

    if (!dataJson) return <Loading />

    return (
        <div className={'user_profiles'}>
            {sortedUsers.map((nick: IUserInfo, index: number) => (
                <NavLink to={`/users/${nick.nickname}`} key={index}>
                    <>
                        <div className={'user_profile_block'}>
                            <div className={'user_profile_block_left'}>
                                {!checkOnline(nick?.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone) ? (
                                    <div className={'avatar_offline'}>
                                        {(nick?.avatar.length !== 0 && dataJson) && (
                                            <>
                                                <img src={`${deadAvatar}`} alt={'dead'} className={'dead_tape'}/>
                                                <img src={nick?.avatar} alt={'user-avatar'} className={'profile_avatar'}/>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className={'avatar_online'}>
                                        <img src={nick?.avatar} alt={'user-avatar'}
                                             className={checkOnline(nick?.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone) ? 'profile_avatar online' : 'profile_avatar'} />
                                    </div>
                                )}
                            </div>
                            <div className={'user_profile_block_middle'}>
                                <div className={'user_profile_block_middle_top'}>
                                    <span className={'profile_user_nick'}>{nick?.custom_nickname}</span>
                                    <span className={'profile_user_online_mainmenu'}>
                                        {checkOnline(nick.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)
                                        ? '(в сети)'
                                        : nick.orientation === 'woman'
                                        ? `(была в сети: ${formatDate(nick.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                        : nick.orientation === 'man'
                                        ? `(был в сети: ${formatDate(nick.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`
                                        : `(был(-а) в сети: ${formatDate(nick.last_online_date, 'Europe/Moscow', Intl.DateTimeFormat().resolvedOptions().timeZone)})`}
                                    </span>
                                </div>
                                <div className={'user_profile_block_middle_down'}>
                                    <span>
                                        {nick?.about && nick?.about}
                                    </span>
                                </div>
                            </div>
                            <div className={'user_profile_block_right'}>

                            </div>
                        </div>
                    </>
                </NavLink>
            ))}
        </div>
    );
};

export default GetAllUsers;
