import './LabLibStoryCharacters.css'
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import Loading from "../../../../Loading/Loading.tsx";
import {NavLink, useParams} from "react-router-dom";
import moment from "moment";
import 'moment/dist/locale/ru';
import imageNF from '../../../../../../public/icons/imageNotFound.jpeg'

interface IStoriesInfo {
    id: string,
    cover: string,
    poster: string,
    name_rus: string,
    name_eng: string,
    description: string,
    date_created: string,
    date_modified: string,
    date_start: string,
    date_end: string,
    status: string,
    author: string,
    chapters_count: string
}

interface ICharactersInfo {
    age: string,
    author: string,
    birthday: string,
    cover: string,
    date_created: string,
    date_modified: string,
    description: string,
    id: string,
    life_status: string,
    name_eng: string,
    name_rus: string,
    role: string,
    va_avatar: string,
    va_char_avatar: string,
    va_char_name: string,
    va_name: string,
}

interface ICharacters {
    status: boolean,
    info: {
        length: number,
        [key: number]: ICharactersInfo
    }
}

const LabLibStoryCharacters: React.FC = () => {
    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')
    const params = useParams()

    const {showNotification, NotificationComponent} = useNotification()

    const [story, setStory] = useState<IStoriesInfo | null>(null)
    const [characters, setCharacters] = useState<ICharacters | null>(null)
    const [loading, setLoading] = useState(true)

    moment().locale('ru')

    useEffect(() => {
        const fetching = async() => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getStory', conditions: {id: (params.story).split('-')[0]}})
            })
            const data = await res.json()
            if (!data?.status) {
                console.log(data?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
                setLoading(false)
            }
            else {
                setStory(data?.info)
            }
        }
        fetching().then()
    }, [server, token]);

    useEffect(() => {
        if (!story) {
            return
        }
        const fetching = async() => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getCharacters', conditions: {story_id: story?.id}})
            })
            const data = await res.json()
            if (!data?.status) {
                console.log(data?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
                setLoading(false)
            }
            else {
                setCharacters(data)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token, story]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'story_page_root'}>
            <div>
                {story &&
                    <div>
                        <div className={'story_characters_title'}>
                            <h4>
                                <NavLink to={`/library/story/${params.story}`} className={'back'}/>
                                {story?.name_rus} {story?.name_eng && <span style={{color: 'gray'}}>/</span>} {story?.name_eng}
                            </h4>
                        </div>
                    </div>
                }
                {characters &&
                    <div>
                        <div className={'story_characters_main'}>
                            <div className={'story_characters_main_title'}>
                                <h4>
                                    Главные герои
                                </h4>
                            </div>
                            <div className={'story_characters_main_list story_characters_list'}>
                                {(characters?.info.length > 0 && Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'main').length > 0) ?
                                    Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'main')
                                        .map((char: ICharactersInfo) =>
                                            <NavLink to={`/library/characters/${char.id}-${char.name_eng}`}>
                                                <div className={'story_info_char'} key={char?.id}>
                                                    <div>
                                                        <div className={'div_image_small'}
                                                            style={{backgroundImage: 'url(' + `${char?.cover ? char?.cover : imageNF}` + ')',}}>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span>{char?.name_rus}</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    :
                                    <div>
                                        <span>Персонажи отсутствуют...</span>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className={'story_characters_seconds'}>
                            <div className={'story_characters_seconds_title'}>
                                <h4>
                                    Второстепенные герои
                                </h4>
                            </div>
                            <div className={'story_characters_second_list story_characters_list'}>
                                {(characters?.info.length > 0 && Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'second').length > 0) ?
                                    Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'second')
                                        .map((char: ICharactersInfo) =>
                                            <NavLink to={`/library/characters/${char.id}-${char.name_eng}`}>
                                                <div className={'story_info_char'} key={char?.id}>
                                                    <div>
                                                        <div className={'div_image_small'}
                                                            style={{backgroundImage: 'url(' + `${char?.cover ? char?.cover : imageNF}` + ')',}}>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span>{char?.name_rus}</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    :
                                    <div>
                                        <span>Персонажи отсутствуют...</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
            <NotificationComponent/>
        </div>
    )

}
export default LabLibStoryCharacters