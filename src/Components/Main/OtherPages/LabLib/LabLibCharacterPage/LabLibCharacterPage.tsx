import './LabLibCharacterPage.css'
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import {NavLink, useParams} from "react-router-dom";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import moment from "moment";
import "moment/dist/locale/ru";
import Loading from "../../../../Loading/Loading.tsx";
import imageNF from "../../../../../../public/icons/imageNotFound.jpeg";
import TextOverflow from "../../../../TextOverflow/TextOverflow.tsx";
import Button from "../../../../Button/Button.tsx";
import Modal from "../../../../Modal/Modal.tsx";
import NotFound from "../../../../NotFound/NotFound.tsx";

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

interface IStories {
    status: boolean,
    info: {
        [key: number]: IStoriesInfo
    }
}

interface ICharacters {
    age: string,
    author: string,
    birthday: string | Date,
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
    length: number
}

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

const LabLibCharacterPage: React.FC = () => {

    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')
    const params = useParams()

    const {showNotification, NotificationComponent} = useNotification()

    const [story, setStory] = useState<IStories | null>(null)
    const [characters, setCharacters] = useState<ICharacters | null>(null)
    const [authorInfo, setAuthorInfo] = useState<IUserInfo>(null)
    const [usersData, setUsersData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true)
    const [openModal, setOpenModal] = useState(false)
    moment().locale('ru')

    const handleModal = () => {
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
    }

    const handleCloseModal = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape'){
            setOpenModal(false)
        }
    }

    useEffect(() => {
        if (usersData) {
            const author = Object.values(usersData?.info).find((user: IUserInfo) => user?.nickname === characters?.author);
            setAuthorInfo(author)
        }
    }, [characters?.author, usersData]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const data = await response.json()
            if (data) {
                setUsersData(data);
            }
        };
        fetchData().then();
    }, [server, token]);

    useEffect(() => {
        const fetching = async() => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getCharacter', conditions: {id: (params.characters).split('-')[0]}})
            })
            const data = await res.json()
            const resStories = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getStories', conditions: {character_id: data?.info.id}})
            })
            const dataStories = await resStories.json()
            if (!data?.status || !dataStories?.status) {
                console.log(data?.info || dataStories?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
            }
            else {
                setCharacters(data?.info)
                setStory(dataStories?.info)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    if (loading) {
        return <Loading />
    }

    if (typeof characters === 'object' && Object.keys(characters).length <= 0) {
        return <NotFound />
    }

    return (
        <div className={'lablib_char_page_root'}>
            <div className={'story_page_root'}>
                {story &&
                    <div>
                        <div className={'story_info_top'}>
                            <div className={'story_right_title'}>
                                <h4>{characters?.name_rus} {characters?.name_eng && <span style={{color: 'gray'}}>/</span>} {characters?.name_eng}</h4>
                            </div>
                            <div className={'story_info_right_left'}>
                                <div className={'story_info_left'}>
                                    <div>
                                        <div onClick={handleModal} className={'char_info_cover'}>
                                            <div className={'div_image_big'}
                                                 style={{backgroundImage: 'url(' + `${characters?.cover ? characters?.cover : imageNF}` + ')'}}>
                                            </div>
                                        </div>
                                        <Modal open={openModal} onClose={handleClose} onKeyDown={handleCloseModal}>
                                            <div>
                                                <Button onClick={handleClose}>x</Button>
                                            </div>
                                            <div style={{marginTop: '50px'}}>
                                                <img src={`${characters?.cover ? characters?.cover : imageNF}`} alt={'story_img'}/>
                                            </div>
                                        </Modal>
                                    </div>
                                </div>
                                <div className={'char_info_right'}>
                                    <div>
                                        <div className={'story_right_commons'}>
                                            <div>
                                                <div>
                                                    <span><strong>Дата рождения: </strong>{characters?.birthday ? moment(characters?.birthday).format('D MMM YYYY [г.]') : 'Неизвестно'}</span>
                                                </div>
                                                <div>
                                                    <span><strong>Возраст в годах: </strong>{characters?.age ? characters?.age : 'Неизвестно'}</span>
                                                </div>
                                                <div className={'character_right_status'}>
                                                    <div>
                                                        <span><strong>Статус: </strong></span>
                                                    </div>
                                                    <div
                                                        className={(characters?.life_status === 'lively') ? 'char_right_status_lively' : characters?.life_status === 'dead' ? 'char_right_status_dead' : 'char_right_status_unknown'}>
                                                        <span>{(characters?.life_status === 'lively') ? 'Жив(-а)' : characters?.life_status === 'dead' ? 'Мертв(-а)' : 'Неизвестно'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                </div>
                                                <div>
                                                    <span><strong>Дата добавления: </strong>
                                                        {characters?.date_created
                                                            ?
                                                            `${moment(characters?.date_created).format('D MMM YYYY [г.]')}`
                                                            :
                                                            'Неизвестно'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className={'char_right_author'}>
                                                    <div>
                                                        <h4>Автор:</h4>
                                                    </div>
                                                    <div>
                                                        <div>
                                                            <img
                                                                src={`${authorInfo?.avatar ? authorInfo?.avatar : imageNF}`}
                                                                alt={'author_avatar'}/>
                                                        </div>
                                                        <div>
                                                            <span><strong>{authorInfo?.custom_nickname && authorInfo?.custom_nickname}</strong></span>
                                                            <NavLink to={`/users/${authorInfo?.nickname}`}>
                                                            <span
                                                                style={{fontSize: '14px'}}><i>Перейти в профиль</i></span>
                                                            </NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={'char_page_va_root'}>
                                            {characters?.va_char_name &&
                                                <div>
                                                    <div className={'char_page_va_char'}>
                                                        <div className={'char_page_va_char_title'}>
                                                            <h4>Персонаж озвучки:</h4>
                                                        </div>
                                                        <div className={'char_page_va_char_info'}>
                                                            <div>
                                                                <img src={`${characters?.va_char_avatar ? characters?.va_char_avatar : imageNF}`} alt={'char_va_avatar'}/>
                                                            </div>
                                                            <div>
                                                                <h4>{characters?.va_char_name}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            {characters?.va_name &&
                                                <div>
                                                    <div className={'char_page_va_seiyuu'}>
                                                        <div className={'char_page_va_seiyuu_title'}>
                                                            <h4>Сэйю:</h4>
                                                        </div>
                                                        <div className={'char_page_va_info'}>
                                                            <div>
                                                                <img
                                                                    src={`${characters?.va_avatar ? characters?.va_avatar : imageNF}`}
                                                                    alt={'char_va_avatar'}/>
                                                            </div>
                                                            <div>
                                                                <h4>{characters?.va_name}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className={'story_right_description'}>
                                            <div className={'story_right_description_title'}>
                                                <span><strong>Описание</strong></span>
                                            </div>
                                            <div>
                                                {characters?.description ?
                                                    <span><TextOverflow maxHeight={600} text={characters?.description}/></span>
                                                    :
                                                    <span>Описание отсутствует...</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className={'story_info_bottom'}>
                            <div className={'char_worlds_info_main'}>
                                <a href={'#'} style={{pointerEvents: 'none'}}>
                                    <div>
                                        <h4>Связанные миры</h4>
                                    </div>
                                </a>
                                <div>
                                    {typeof characters === 'object' && Object.keys(characters).length > 0 ?
                                        Object.values(story).map((stories: IStoriesInfo) =>
                                            <NavLink to={`/library/story/${stories.id}-${stories.name_eng}`}>
                                                <div className={'story_info_char'} key={stories?.id}>
                                                    <div>
                                                        <div className={'div_image_small'}
                                                             style={{backgroundImage: 'url(' + `${stories?.cover ? stories?.cover : imageNF}` + ')',}}>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span>{stories?.name_rus}</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                        :
                                        <div>
                                            <span>Нет связанных миров...</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <NotificationComponent/>
            </div>
        </div>
    )
}
export default LabLibCharacterPage