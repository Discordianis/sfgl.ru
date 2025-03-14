import React, {useEffect, useState} from "react";
import './MainMenu.css';
import Loading from "../../Loading/Loading.tsx";
import GetAllUsers from "../../../api/GetAllUsers.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import UTabs from "../../UTabs/UTabs.tsx";

interface IUsersInfo {
    partner_custom_nickname?: string
    partner_name?: string
    partner_avatar: string
    custom_nickname: string
    avatar: string
}

interface IUsersList {
    info: {
        [key: number]: IUsersInfo
    }
}

const MainMenu: React.FC = () => {
    const [tab, setTab] = useState('profiles');
    const [jsonData, setJsonData] = useState<IUsersList | null>(null);
    const [loading, setLoading] = useState(true)

    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllRelations'})
            })
            const data = await response.json()
            setJsonData(data)
            setLoading(false)
        };
        fetchData().then();
    }, [server, token]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'main_menu_root'}>
            <div className={'main_utabs'} style={{maxHeight: tab === 'news' ? "unset" : ""}}>
                <UTabs isActive={tab === 'profiles'} onClick={() => setTab('profiles')}>Профили</UTabs>
                <UTabs isActive={tab === 'current'} onClick={() => setTab('current')}>Текущие отношения</UTabs>
            </div>
            {(jsonData) ? (
                <div className={'main_window'} style={{maxHeight: tab === 'news' ? "unset" : ""}}>
                    {tab === 'profiles' && <GetAllUsers />}
                    {tab === 'current' && (
                        <div className={'main_window_current'}>
                            {(jsonData.info && Object.keys(jsonData.info).length > 0) ?
                                <div>
                                    {Object.values(jsonData.info).map((pair: IUsersInfo, index) =>
                                        <div key={index}>
                                            <div>
                                                <img src={pair?.avatar} alt={'user_avatar'}/>
                                                <span>{pair?.custom_nickname}</span>
                                            </div>
                                            <span>+</span>
                                            <div>
                                                <img src={pair?.partner_avatar} alt={'user_avatar'}/>
                                                <span>{pair?.partner_custom_nickname ? pair?.partner_custom_nickname : pair?.partner_name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                :
                                <div className={'no_relationships'}>
                                    <span>
                                        Ни у кого нет отношений...
                                    </span>
                                </div>
                            }
                        </div>
                    )}
                </div>
            ) : (
                <Loading/>
            )}
        </div>
    );
};
export default MainMenu;