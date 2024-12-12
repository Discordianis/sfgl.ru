import './LabLibStoryPage.css'
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import Loading from "../../../../Loading/Loading.tsx";
import {NavLink, useParams} from "react-router-dom";
import Button from "../../../../Button/Button.tsx";
import moment from "moment";
import 'moment/dist/locale/ru';
import TextOverflow from "../../../../TextOverflow/TextOverflow.tsx";
import imageNF from '../../../../../../public/icons/imageNotFound.jpeg'
import parse from "html-react-parser";
import Modal from "../../../../Modal/Modal.tsx";
import UTabs from "../../../../UTabs/UTabs.tsx";

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
    status: 'ongoing' | 'ended' | 'announce' | string,
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

interface IChapters {
    status: boolean,
    info: {
        chapter_id: string,
        date_modified: string,
        id: string,
        number: string,
        story_id: string,
        user_id: string,
        user_nickname: string,
    }
}

interface IAllChaptersInfo {
    author: string,
    date_created: string,
    date_modified: string,
    id: string,
    image: string,
    name: string,
    number: string,
    story_id: string,
    text: string,
}

interface IAllChapters {
    status: boolean,
    info: {
        length: number,
        [key: number]: IAllChaptersInfo
    }
}

const LabLibStoryPage: React.FC = () => {
    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')
    const params = useParams()

    const {showNotification, NotificationComponent} = useNotification()

    const [story, setStory] = useState<IStoriesInfo | null>(null)
    const [characters, setCharacters] = useState<ICharacters | null>(null)
    const [chapters, setChapters] = useState<IAllChapters | null>(null)
    const [loading, setLoading] = useState(true)
    const [smallWidth, setSmallWidth] = useState(false)

    const [tab, setTab] = useState<'common' | 'chapters'>('common')

    moment().locale('ru')

    const [usersData, setUsersData] = useState<User | null>(null);
    const [authorInfo, setAuthorInfo] = useState<IUserInfo>(null)
    const [readingChapters, setReadingChapters] = useState<IChapters>(null)
    const [chapterNumber, setChapterNumber] = useState('')
    const [openModal, setOpenModal] = useState(false)

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
            const author = Object.values(usersData?.info).find((user: IUserInfo) => user?.nickname === story?.author);
            setAuthorInfo(author)
        }
    }, [story?.author, usersData]);

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
                body: JSON.stringify({token: token, action: 'getStory', conditions: {id: (params.story).split('-')[0]}})
            })
            const data = await res.json()
            const resCharacter = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getCharacters', conditions: {story_id: data?.info?.id}})
            })
            const dataCharacter = await resCharacter.json()
            const resChap = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getReading', conditions: {story_id: data?.info?.id}})
            })
            const dataChap = await resChap.json();
            const resAllChap = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({ token, action: 'getChapters', conditions: { story_id: data?.info?.id } }),
            });
            const dataAllChap = await resAllChap.json();
            if (!data?.status || !dataCharacter?.status || !dataChap?.status || !dataAllChap?.status) {
                console.log(data?.info || dataCharacter?.info || dataChap?.info || dataAllChap?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
                setLoading(false)
            }
            else {
                setStory(data?.info)
                setCharacters(dataCharacter)
                setReadingChapters(dataChap)
                setChapters(dataAllChap)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    useEffect(() => {
        const smaller = () => {
            if (window.innerWidth <= 349) {
                setSmallWidth(true)
            }
            else {
                setSmallWidth(false)
            }
        }
        smaller()
        window.addEventListener('resize', smaller)
    }, []);

    useEffect(() => {
        if (readingChapters?.info && (typeof readingChapters.info === 'object' && !Array.isArray(readingChapters.info))) {
            console.log('Данные присутствуют');
            setChapterNumber(readingChapters.info.number);
        }
    }, [readingChapters]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'story_page_root'}>
            {story ?
                <div>
                    <div className={'story_info_top'}>
                        <div className={'story_right_title'}>
                            <h4>{story?.name_rus} {story?.name_eng && <span style={{color: 'gray'}}>/</span>} {story?.name_eng}</h4>
                        </div>
                        <div className={'story_info_right_left'}>
                            <div className={'story_info_left'}>
                                <div>
                                    <div onClick={handleModal} className={'story_info_cover'}>
                                        <img src={`${story?.cover ? story?.cover : imageNF}`} alt={'story_img'}/>
                                    </div>
                                    <Modal open={openModal} onClose={handleClose} onKeyDown={handleCloseModal}>
                                        <div>
                                            <Button onClick={handleClose}>x</Button>
                                        </div>
                                        <div style={{marginTop: '50px'}}>
                                            <img src={`${story?.cover ? story?.cover : imageNF}`} alt={'story_img'}/>
                                        </div>
                                    </Modal>
                                    {(story?.status !== 'announce' && story?.chapters_count !== '0' && story?.chapters_count) &&
                                    <div>
                                        <NavLink
                                            to={`/library/story/${params.story}/read/${chapterNumber ? chapterNumber : '1'}`}>
                                            <Button>{chapterNumber ? 'Продолжить читать' : 'Начать читать'}</Button>
                                        </NavLink>
                                    </div>
                                    }
                                </div>
                            </div>
                            <div className={'story_info_right'}>
                                <div className={'story_right_chapters'}>
                                    <UTabs isActive={tab === 'common'} onClick={() => setTab('common')}>Основная информация</UTabs>
                                    <UTabs isActive={tab === 'chapters'} onClick={() => setTab('chapters')}>Главы</UTabs>
                                </div>
                                <div>
                                    {tab === 'common' &&
                                        <div>
                                            <div className={'story_right_commons'}>
                                                <div>
                                                    <div>
                                                        <span><strong>Главы: </strong>{story?.chapters_count}</span>
                                                    </div>
                                                    <div className={'story_right_status'}>
                                                        <div>
                                                            <div>
                                                                <span><strong>Статус: </strong></span>
                                                            </div>
                                                            <div
                                                                className={story?.status === 'ongoing' ? 'story_right_status_ongoing' :
                                                                    story?.status === 'ended' ? 'story_right_status_ended' :
                                                                        story?.status === 'announce' ? 'story_right_status_announce' : 'story_right_status_unknown'}>
                                                    <span>{story?.status === 'ongoing' ? 'Онгоинг' :
                                                        story?.status === 'ended' ? 'Вышло' :
                                                            story?.status === 'announce' ? 'Анонс' : 'Неизвестно'}</span>
                                                            </div>
                                                            <div>
                                                                {story?.date_start &&
                                                                    <span>{story?.status === 'ongoing' && `с ${moment(story?.date_start).format('D MMM YYYY [г.]')}`}</span>
                                                                }
                                                                {(story?.date_start && story?.date_end) &&
                                                                    story?.status === 'ended' && `с ${moment(story?.date_start).format('D MMM YYYY [г.]')} по ${moment(story?.date_end).format('D MMM YYYY [г.]')}`
                                                                }
                                                                {story?.status === 'announce' && ''}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {story?.status === 'announce' && story?.date_start &&
                                                                <div>
                                                                    <span>Дата релиза: {moment(story?.date_start).format('D MMM YYYY [г.]')}</span>
                                                                </div>
                                                            }
                                                            <div>
                                                    <span><strong>Дата создания: </strong>
                                                        {story?.date_created
                                                            ?
                                                            `${moment(story?.date_created).format('D MMM YYYY [г.]')}`
                                                            :
                                                            'Неизвестно'}
                                                    </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className={'story_right_author'}>
                                                        <div>
                                                            <h4>Автор:</h4>
                                                        </div>
                                                        {!smallWidth ?
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
                                                            :
                                                            <div>
                                                                <div>
                                                                    <div>
                                                                        <img
                                                                            src={`${authorInfo?.avatar && authorInfo?.avatar}`}
                                                                            alt={'author_avatar'}/>
                                                                    </div>
                                                                    <div>
                                                                        <span><strong>{authorInfo?.custom_nickname && authorInfo?.custom_nickname}</strong></span>
                                                                    </div>
                                                                </div>
                                                                <NavLink to={`/users/${authorInfo?.nickname}`}>
                                                                <span
                                                                    style={{fontSize: '14px'}}><i>Перейти в профиль</i></span>
                                                                </NavLink>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={'story_right_description'}>
                                                <div>
                                                    <span><strong>Описание</strong></span>
                                                </div>
                                                <div>
                                                    {story?.description ?
                                                        <span><TextOverflow maxHeight={600} text=
                                                            {parse((story.description
                                                            .split('\n')
                                                            .map((line, index) =>
                                                                `${index > 0 ? '\n' : ''}${line[0] !== '<' ? '&emsp;&emsp;' : ''}${line}`
                                                            )).join(''))
                                                        }/>
                                                    </span>
                                                        :
                                                        <span>Описание отсутствует...</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {tab === 'chapters' &&
                                        <div className={'story_page_chapter_list'}>
                                            {(Array.isArray(chapters?.info) && chapters?.info.length > 0) ?
                                                <TextOverflow maxHeight={600} text={
                                                    Object.values(chapters?.info).map((chap: IAllChaptersInfo, index) =>
                                                        <div key={index}>
                                                            <NavLink to={`/library/story/${params.story}/read/${chap?.number}`}>
                                                                <div className={'chapters_props'}>
                                                                    <span className={'chapter_first'}><strong>Глава {chap?.number}</strong></span>
                                                                    <span className={'chapter_second'}> – {chap?.name}</span>
                                                                </div>
                                                            </NavLink>
                                                        </div>
                                                    )
                                                } />
                                                :
                                                <span><b><center>Нет ни одной главы...</center></b></span>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'story_info_bottom'}>
                        <div className={'story_info_char_main'}>
                            <NavLink to={`/library/story/${params.story}/characters`}>
                                <div>
                                    <h4>Главные герои</h4>
                                </div>
                            </NavLink>
                            <div>
                                {(characters?.info.length > 0 && Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'main').length > 0) ?
                                    Object.values(characters?.info).filter((filt: ICharactersInfo) => filt.role === 'main').map((char: ICharactersInfo) =>
                                        <NavLink to={`/library/characters/${char.id}-${char.name_eng}`}>
                                            <div className={'story_info_char'} key={char?.id}>
                                                <div>
                                                    <img src={`${char?.cover ? char?.cover : imageNF}`}
                                                         alt={'char_avatar'}/>
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
                </div>
                :
                <div>
                    <span>Такой истории не существует</span>
                </div>
            }
            <NotificationComponent/>
        </div>
    )

}
export default LabLibStoryPage