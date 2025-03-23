import './LabLibRead.css';
import React, {useEffect, useRef, useState} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import { NavLink, useParams } from "react-router-dom";
import { useNotification } from "../../../../../hooks/useSuccess.tsx";
import Loading from "../../../../Loading/Loading.tsx";
import TextOverflow from "../../../../TextOverflow/TextOverflow.tsx";
import parse from "html-react-parser";
import {Button} from "@mui/material";

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

interface IChaptersInfo {
    author: string,
    date_created: string,
    date_modified: string,
    id: string,
    image: string,
    name: string,
    number: string,
    story_id: string,
    text: string,
    no_format: string,
    reactions: string
}

interface IChapters {
    status: boolean,
    info: {
        length: number,
        [key: number]: IChaptersInfo
    }
}

interface IReactions {
    reactions: [],
    user_date_created: string | Date,
    user_reaction: string
}

const LabLibRead: React.FC = () => {
    const server = useSelector((state: RootState) => state.server.server);
    const myData = useSelector((state: RootState) => state.myData);
    const token = localStorage.getItem('token');
    const params = useParams();

    const { showNotification, NotificationComponent } = useNotification();
    const [story, setStory] = useState<IStoriesInfo | null>(null);
    const [chapter, setChapter] = useState<IChaptersInfo | null>(null);
    const [allChapters, setAllChapters] = useState<IChapters | null>(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false)
    const popupRef = useRef<HTMLDivElement | null>(null)

    const [isVisible, setIsVisible] = useState<boolean>(true)
    const [lastScroll, setLastScroll] = useState<number>(0)

    const [reactions, setReactions] = useState<IReactions | null>(null);
    const [disableReactions, setDisableReactions] = useState<boolean>(false)

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY
            if (currentScroll < lastScroll || currentScroll < 50) {
                setIsVisible(true)
            }
            else {
                setIsVisible(false)
            }
            setLastScroll(currentScroll)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScroll]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (popupRef.current && !popupRef.current.contains(target)) {
                setOpenModal(false)
            }
        };

        if (openModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef, openModal]);

    useEffect(() => {
        if (openModal) {
            document.body.style.overflow = 'hidden'
        }
        else {
            document.body.style.overflow = 'hidden auto'
        }
        return () => {
            document.body.style.overflow = 'hidden auto'
        }
    }, [openModal]);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({ token, action: 'getStory', conditions: { id: params.story.split('-')[0] } }),
            });
            const data = await res.json();

            if (Array.isArray(data.info) && data.info.length === 0) {
                showNotification('Такой истории не существует', 'error');
                setLoading(false)
                return;
            }
            else {
                const resChap = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({ token, action: 'getChapters', conditions: { story_id: data?.info?.id } }),
                });
                const dataChap = await resChap.json();

                if (!data?.status || !dataChap?.status) {
                    console.log(data?.info || dataChap?.info);
                    setLoading(false)
                    showNotification('Упс, что-то пошло не так...', 'error');
                }
                else {
                    const currChap = Object.values(dataChap?.info).find((chap: IChaptersInfo) => chap.number === params.read) as IChaptersInfo
                    if (currChap) {
                        setChapter(currChap);
                    }
                    setStory(data?.info);
                    setAllChapters(dataChap?.info)
                    setLoading(false)
                }
            }
        };
        fetching().then();
    }, [params.story, server, token]);

    const getAllReactions = async () => {
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({
                token: token,
                action: 'getChapterReactions',
                conditions: { id: chapter?.id },
            })
        })
        const data = await res.json()
        if (!data.status) {
            console.log('')
        }
        else {
            setReactions(data.info)
            console.log(data.info)
            if (!data.info.user_date_created) {
                await sendReaction('read').then()
            }
        }
    }

    useEffect(() => {
        if (chapter) {
            const updateReading = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({
                        token: token,
                        action: 'updateMyReading',
                        data: {
                            story_id: story?.id,
                            chapter_id: chapter?.id,
                            number: chapter?.number,
                            user_nickname: myData.data?.info?.nickname,
                            user_id: myData.data?.info?.id
                        }
                    })
                })
                const data = await res.json()
                if (!data?.status) {
                    console.log(data?.info)
                    showNotification('Упс, что-то пошло не так...', 'error');
                }
            }
            getAllReactions().then()
            updateReading().then()
        }
    }, [chapter]);

    const sendReaction = async (type: string) => {
        setDisableReactions(true);

        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({
                token: token,
                action: 'updateUserChapterReaction',
                conditions: { id: chapter?.id },
                data: { reaction: type }
            })
        });

        const data = await res.json();
        if (!data.status) {
            showNotification('Упс, что-то пошло не так...', 'error');
            setReactions(reactions);
            setDisableReactions(false);
        }
        else {
            getAllReactions().then()
            setDisableReactions(false);
        }
    };

    useEffect(() => {
        const videoElementBG = document.getElementById('background-video');
        const videoElementFog = document.getElementById('bg-fog-video');
        videoElementBG?.remove();
        videoElementFog?.remove();
    }, []);

    const maxChapterNumber = allChapters
        ? Math.max(...Object.values(allChapters).map(chap => Number(chap.number)))
        : 0;
    const minChapterNumber = allChapters
        ? Math.min(...Object.values(allChapters).map(chap => Number(chap.number)))
        : 0;

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={'lablib_read_root'}>
            <div>
                <div className={`popup_root ${openModal ? 'visible' : 'hidden'}`}>
                    <div className={`popup_prop ${openModal ? 'popup_opened' : ''}`} ref={popupRef}>
                        <div className="popup_content">
                            <div className="lablib_modal_chapters">
                                <div className="lablib_modal_controls">
                                    <div>
                                        <div className="popup_close_button"
                                             onClick={() => setOpenModal(false)}>
                                            <span>←</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4>Список глав</h4>
                                    </div>
                                </div>
                                <div className="lablib_modal_chapters_list">
                                    {allChapters &&
                                        Object.values(allChapters).map((chap: IChaptersInfo, index) => (
                                            <NavLink reloadDocument={true}
                                                     to={`/library/story/${params.story}/read/${chap?.number}`}
                                                     key={index}>
                                                <div>
                                                    <div>
                                                        <span>Глава {chap?.number}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{color: '#a1a1a1'}}> – {chap?.name}</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'lablib_read_header_root'}
                     style={{transform: `translateY(${isVisible ? '0px' : '-130px'})`}}>
                    <div className={'lablib_read_header'}>
                        <NavLink to={`/library/story/${params.story}`} className={'lablib_read_title'}>
                            {story?.name_eng && <span>{story.name_eng}</span>}
                            {story?.name_rus && <span>{story.name_rus}</span>}
                        </NavLink>
                        <div className={'chapters_controls'}>
                            <NavLink
                                to={`/library/story/${params.story}/read/${Number(chapter?.number) - 1}`}
                                reloadDocument={true}
                                className={Number(chapter?.number) > minChapterNumber ? 'chapters_controls_left' : 'chapters_controls_left navDisable'}>
                                <svg
                                    focusable={false}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    style={{width: '24px', height: '24px'}}>
                                    <path fill="currentColor"
                                          d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
                                </svg>
                            </NavLink>
                            <div className={'chapters_controls_title'} onClick={() => setOpenModal(true)}>
                                <span>Оглавление</span>
                                <span>{chapter?.name}</span>
                            </div>
                            <NavLink
                                to={`/library/story/${params.story}/read/${Number(chapter?.number) + 1}`}
                                reloadDocument={true}
                                className={Number(chapter?.number) < maxChapterNumber ? 'chapters_controls_right' : 'chapters_controls_right navDisable'}>
                                <svg
                                    className="svg-inline--fa fa-chevron-right"
                                    focusable={false}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    style={{width: '24px', height: '24px'}}>
                                    <path fill="currentColor"
                                          d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
                                </svg>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className={'lablib_read_text'}>
                    {chapter?.text ?
                        <>
                            <h1>Глава {chapter?.number} – {chapter?.name}</h1>
                            <div className={'lablib_read_text_map'}>
                                {chapter?.no_format === '0' ?
                                    <TextOverflow maxHeight={999999} text={chapter?.text}/>
                                    :
                                    <span>{parse(chapter?.text)}</span>
                                }
                                {chapter?.image &&
                                    <div className={'story_image'}>
                                        <img src={`${chapter?.image}`} alt={'story_img'}/>
                                    </div>
                                }
                            </div>
                        </>
                        :
                        <div>
                            <span>
                                <center>
                                    Вы ощущаете чей-то взор в бесконечной тьме...<br/><br/>
                                    Давление в пространстве было настолько мощным, что у вас начала идти кровь из носа и глаз.<br/><br/>
                                    Эта мощь не сравнится даже с Демоном Театра <i>Асмодеем</i>, что уже несколько вселенных наблюдает за разумными видами... По его словам.<br/><br/>
                                    Но вы понимаете, что именно сделали не так, почему оказались здесь и почему вас выворачивает от чьего-то давления.<br/><br/>
                                    Вы совершили грех вселенских масштабов — зашли на территорию Божества Начала и Конца <i>Икса</i>.<br/><br/>
                                    Вам тут не место. По крайней мере, если вас не пленил соблазн вселенской чёрной дыры, которой никто никогда не видел...<br/><br/>
                                    Вернитесь на существующие главы или существующую историю.
                                </center>
                            </span>
                        </div>
                    }
                </div>
                <div className={'read_reactions'}>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('heart')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'heart' ? "secondary" : "primary"}
                        className={'btn_mui_cus'}
                    >
                        <div className={'read_reactions_content'}>
                            <span>❤️</span>
                            {reactions?.reactions && reactions.reactions['heart'] > 0 && (
                                <span>{Object.values(reactions.reactions['heart'].toString())}</span>
                            )}
                        </div>
                    </Button>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('fire')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'fire' ? "secondary" : "primary"}
                    >
                        <div className={'read_reactions_content'}>
                            <span>🔥</span>
                            {reactions?.reactions && reactions.reactions['fire'] > 0 && (
                                <span>{Object.values(reactions.reactions['fire'].toString())}</span>
                            )}
                        </div>
                    </Button>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('laugh')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'laugh' ? "secondary" : "primary"}
                    >
                        <div className={'read_reactions_content'}>
                            <span>😂</span>
                            {reactions?.reactions && reactions.reactions['laugh'] > 0 && (
                                <span>{Object.values(reactions.reactions['laugh'].toString())}</span>
                            )}
                        </div>
                    </Button>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('shock')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'shock' ? "secondary" : "primary"}
                    >
                        <div className={'read_reactions_content'}>
                            <span>🤯</span>
                            {reactions?.reactions && reactions.reactions['shock'] > 0 && (
                                <span>{Object.values(reactions.reactions['shock'].toString())}</span>
                            )}
                        </div>
                    </Button>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('cry')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'cry' ? "secondary" : "primary"}
                    >
                        <div className={'read_reactions_content'}>
                            <span>😭</span>
                            {reactions?.reactions && reactions.reactions['cry'] > 0 && (
                                <span>{Object.values(reactions.reactions['cry'].toString())}</span>
                            )}
                        </div>
                    </Button>
                    <Button
                        variant={'contained'} style={{pointerEvents: disableReactions ? "none" : "unset"}}
                        onClick={() => sendReaction('reviewed')}
                        color={reactions && reactions.user_reaction && reactions.user_reaction === 'reviewed' ? "secondary" : "primary"}
                    >
                        <div className={'read_reactions_content'}>
                            <span>📖</span>
                            {reactions?.reactions && reactions.reactions['reviewed'] > 0 && (
                                <span>{Object.values(reactions.reactions['reviewed'].toString())}</span>
                            )}
                        </div>
                    </Button>
                </div>
                <div className={'lablib_read_end'}>
                    <span>Конец главы</span>
                    <div className={'chapters_controls'}>
                        <NavLink reloadDocument={true}
                                 to={`/library/story/${params.story}/read/${Number(chapter?.number) - 1}`}
                                 className={Number(chapter?.number) > minChapterNumber ? 'chapters_controls_left' : 'chapters_controls_left navDisable'}>
                            <span>Предыдущая глава</span>
                        </NavLink>
                        <NavLink reloadDocument={true}
                                 to={`/library/story/${params.story}/read/${Number(chapter?.number) + 1}`}
                                 className={Number(chapter?.number) < maxChapterNumber ? 'chapters_controls_right' : 'chapters_controls_right navDisable'}>
                            <span>Следующая глава</span>
                        </NavLink>
                    </div>
                </div>
                <NotificationComponent/>
            </div>
        </div>
    );
};

export default LabLibRead;
