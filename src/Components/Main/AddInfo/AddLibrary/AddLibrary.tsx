import './AddLibrary.css'
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux";
import Loading from "../../../Loading/Loading.tsx";
import {useNotification} from "../../../../hooks/useSuccess.tsx";
import UTabs from "../../../UTabs/UTabs.tsx";
import AddLibraryStory from "./AddLibraryStory/AddLibraryStory.tsx";
import AddLibraryCharacter from "./AddLibraryCharacter/AddLibraryCharacter.tsx";
import AddLibraryChapter from "./AddLibraryChapter/AddLibraryChapter.tsx";
import {useParams} from "react-router-dom";
import AccessDenied from "../../../AccessDenied/AccessDenied.tsx";

interface IAllUsersInfo {
    custom_nickname: string;
    nickname: string;
    avatar: string;
    id: string;
    token: string;
    online: number;
    last_online_date: string | Date
}

interface IAllUsers {
    status: boolean,
    info: {
        length: number,
        [key: number]: IAllUsersInfo
    }
}

const AddLibrary:React.FC = () => {

    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const {showNotification, NotificationComponent} = useNotification()
    const [tab, setTab] = useState<'story' | 'character' | 'chapter'>('story')
    const [loading, setLoading] = useState(true)
    const myData = useSelector((state: RootState) => state.myData)
    const params = useParams()

    const [allUsers, setAllUsers] = useState<IAllUsers>(null)

    useEffect(() => {
        const fetching = async () => {

            const resUsers = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const dataUsers = await resUsers.json()

            if (!dataUsers?.status) {
                console.log(dataUsers?.info)
                showNotification('Упс, что-то пошло не так...', "error")
                setLoading(false)
            }
            else {
                setAllUsers(dataUsers)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    if (loading) {
        return <Loading />
    }

    if (params.nickname !== myData?.data?.info?.nickname && !loading) {
        return <AccessDenied />
    }

    return (
        <div className={'add_library_root'}>
            <div className={'add_library'}>
                <div className={'add_library_utabs'}>
                    <UTabs isActive={tab === 'story'} onClick={() => setTab('story')}>Истории</UTabs>
                    <UTabs isActive={tab === 'character'} onClick={() => setTab('character')}>Персонажи</UTabs>
                    <UTabs isActive={tab === 'chapter'} onClick={() => setTab('chapter')}>Главы</UTabs>
                </div>
                {tab === 'story' &&
                    <AddLibraryStory allUsers={allUsers} server={server} token={token} />
                }
                {tab === 'character' &&
                    <AddLibraryCharacter server={server} token={token} />
                }
                {tab === 'chapter' &&
                    <AddLibraryChapter server={server} token={token} />
                }
            </div>
            <NotificationComponent />
        </div>
    )
}
export default AddLibrary