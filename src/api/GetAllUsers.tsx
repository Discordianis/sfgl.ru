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
    last_online_date: string | Date
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
            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const data = await response.json()
            if (data) {
                setDataJson(data);
            }
        };
        fetchData();
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

            const isRussianA = /^[а-яА-ЯёЁ]/.test(a.custom_nickname);
            const isRussianB = /^[а-яА-ЯёЁ]/.test(b.custom_nickname);

            if (isRussianA && !isRussianB) return -1;
            if (!isRussianA && isRussianB) return 1;

            return a.custom_nickname.localeCompare(b.custom_nickname, 'ru');
        })
        : [];


    const checkOnline = (lastOnlineDate: Date | string) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const originalTimezone = 'Europe/Moscow';
        const date = convertUTCToLocal(lastOnlineDate, originalTimezone, tz);
        const fiveMin = new Date().getTime() - 2 * 60 * 1000;
        const lastOnline = date.toDate().getTime();
        return lastOnline >= fiveMin;
    }

    if (!dataJson) return <Loading />

    return (
        <div className={'user_profiles'}>
            {sortedUsers.map((nick: IUserInfo, index: number) => (
                <NavLink to={`/users/${nick.nickname}`} key={index}>
                    <>
                        {!checkOnline(nick?.last_online_date) ? (
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
                                     className={checkOnline(nick?.last_online_date) ? 'profile_avatar online' : 'profile_avatar'} />
                            </div>
                        )}
                    </>
                    <span>{nick.custom_nickname}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default GetAllUsers;
