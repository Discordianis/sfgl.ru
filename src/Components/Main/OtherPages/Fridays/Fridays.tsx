import React, {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import UTabs from "../../../UTabs/UTabs.tsx";
import Loading from "../../../Loading/Loading.tsx";
import CurrentFridayPerson from "./CurrentFridayPerson.tsx";
import './Fridays.css'
import {RootState} from "../../../../redux";
import Modal from "../../../Modal/Modal.tsx";
import Button from "../../../Button/Button.tsx";
import sfglMusic from '../../../../../public/icons/SFGLFridayMusic.jpg'
import sfglVideo from '../../../../../public/icons/SFGLFridayVideo.jpg'
import AudioImagePlayer from "../../../AudioPlayer/AudioImagePlayer.tsx";
import titleImg from '../../../../../public/background/text-bg.png'
import {Link} from "react-router-dom";

interface IFridayInfo {
    author: string,
    custom_nickname: string,
    date: string,
    date_created: string,
    date_modified: string,
    music: string | null,
    video: string | null,
    image: string | null,
    id: number,
    number: number,
    text: string
}

interface IFriday {
    status: boolean,
    info: {
        length: number,
        [key: number]: IFridayInfo
    }
}

const Fridays:React.FC = () => {

    const [tab, setTab] = useState('lastFriday')
    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData.data?.info)
    const [allFridays, setAllFridays] = useState<IFriday | null>(null);
    const [lastFriday, setLastFriday] = useState<IFridayInfo | null>(null);
    const [currentImageFriday, setCurrentImageFriday] = useState<IFridayInfo | null>(null);
    const [currentVideoFriday, setCurrentVideoFriday] = useState<IFridayInfo | null>(null);
    const [currentMusicFriday, setCurrentMusicFriday] = useState<IFridayInfo | null>(null);
    const [loading, setLoading] = useState(true)
    const [modalImageIsOpen, setModalImageIsOpen] = useState(false)
    const [modalVideoIsOpen, setModalVideoIsOpen] = useState(false)
    const [modalMusicIsOpen, setModalMusicIsOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllFridays'})
            })
            const data = await response.json()
            if (!data?.status) {
                console.log(data?.info)
                setLoading(false)
            }
            else {
                const numArray = Object.values(data.info).map((num: IFridayInfo) => num.number)
                const maxNum = Math.max(...numArray)
                const lastFriday = (data.info).find((numData: IFridayInfo) => numData.number.toString() === maxNum.toString())
                setLastFriday(lastFriday)
                setAllFridays(data)
                setLoading(false)
            }
        };
        fetchData().then();
    }, [server, token]);

    const formatDate = (formatedDate: string | Date) => {
        const date = new Date(formatedDate)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        if (!day || !month || !year) {
            return null
        }
        return `${day}.${month}.${year}`
    }

    const formatLongDate = (dateString: Date | string) => {
        const date = new Date(dateString);

        const day = date.getDate();
        const months = {
            'январь': 'января',
            'февраль': 'февраля',
            'март': 'марта',
            'апрель': 'апреля',
            'май': 'мая',
            'июнь': 'июня',
            'июль': 'июля',
            'август': 'августа',
            'сентябрь': 'сентября',
            'октябрь': 'октября',
            'ноябрь': 'ноября',
            'декабрь': 'декабря'
        };
        const month = months[date.toLocaleString('ru-RU', { month: 'long' })];
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day} ${month} ${year}г., ${hours}:${minutes}:${seconds}`;
    }

    const handleOpenModal = () => {
        setModalImageIsOpen(true)
    }

    const handleOpenModalCurrImage = (number: string) => {
        setModalImageIsOpen(true);
        const curr = Object.values(allFridays.info).find((current: IFridayInfo | number): current is IFridayInfo =>
            typeof current !== 'number' && current.number.toString() === number.toString()
        );
        if (curr) {
            setCurrentImageFriday(curr);
        }
    };
    const handleOpenModalCurrVideo = (number: string) => {
        setModalVideoIsOpen(true);
        const curr = Object.values(allFridays.info).find((current: IFridayInfo | number): current is IFridayInfo =>
            typeof current !== 'number' && current.number.toString() === number.toString()
        );
        if (curr) {
            setCurrentVideoFriday(curr);
        }
    };
    const handleOpenModalCurrMusic = (number: string) => {
        setModalMusicIsOpen(true);
        const curr = Object.values(allFridays.info).find((current: IFridayInfo | number): current is IFridayInfo =>
            typeof current !== 'number' && current.number.toString() === number.toString()
        );
        if (curr) {
            setCurrentMusicFriday(curr);
        }
    };

    const handleCloseModal = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            videoRef.current.src = ''
        }
        setModalImageIsOpen(false)
        setModalVideoIsOpen(false)
        setModalMusicIsOpen(false)
        setCurrentImageFriday(null)
        setCurrentVideoFriday(null)
        setCurrentMusicFriday(null)
    }
    const handleCloseEscape = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape') {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                videoRef.current.src = ''
            }
            setModalImageIsOpen(false)
            setModalVideoIsOpen(false)
            setModalMusicIsOpen(false)
            setCurrentImageFriday(null)
            setCurrentVideoFriday(null)
            setCurrentMusicFriday(null)
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'friday_root'}>
            <div className={'friday_main_utabs'}>
                <UTabs isActive={tab === 'lastFriday'} onClick={() => setTab('lastFriday')}>Последняя пятница</UTabs>
                <UTabs isActive={tab === 'fridaysList'} onClick={() => setTab('fridaysList')}>Все пятницы</UTabs>
                <UTabs isActive={tab === 'fridaysCreators'} onClick={() => setTab('fridaysCreators')}>Создатели</UTabs>
            </div>
            <div className={'friday_window'}>
                {tab === 'lastFriday' &&
                    <>
                        <div className={'last_friday_main'}>
                            {allFridays.info.length !== 0 ?
                                <>
                                    <div className={'last_friday_content'}>
                                        {lastFriday?.image &&
                                            <div>
                                                <img onClick={handleOpenModal} src={`${lastFriday?.image}`}
                                                     alt={'last_friday'}/>
                                                <Modal open={modalImageIsOpen} onClose={handleCloseModal}
                                                       onKeyDown={handleCloseEscape}>
                                                    <Button onClick={handleCloseModal}>x</Button>
                                                    <div style={{marginTop: '50px'}}>
                                                        <img src={`${lastFriday?.image}`} alt={'last_friday'}/>
                                                    </div>
                                                </Modal>
                                            </div>
                                        }
                                        {lastFriday?.music &&
                                            <div>
                                                <AudioImagePlayer src={`${lastFriday?.music}`} image={`${sfglMusic}`}
                                                                  isPlay={null}/>
                                            </div>
                                        }
                                        {lastFriday?.video &&
                                            <div>
                                                <video controls src={`${lastFriday?.video}`} poster={`${sfglVideo}`}/>
                                            </div>
                                        }
                                    </div>
                                    <div className={'last_friday_desc'}>
                                        <div>
                                            <h4>Пятница #{lastFriday?.number} от {formatDate(lastFriday?.date)}</h4>
                                        </div>
                                        <div>
                                            <span>Автор: {lastFriday?.custom_nickname}</span>
                                        </div>
                                        {lastFriday?.text &&
                                            <div>
                                                <span>Приписка: «{lastFriday?.text}»</span>
                                            </div>
                                        }
                                        <div>
                                            <span>(Изменено: {formatLongDate(lastFriday?.date_modified)})</span>
                                        </div>
                                    </div>
                                </>
                                :
                                <div>
                                    <span>Нет ни единой пятницы...</span>
                                </div>
                            }
                        </div>
                        <div className={'create_report_href'}>
                            <Button>
                                <Link to={`/users/${myData?.nickname}/createInfo/fridays`}>
                                    Загрузить пятницу
                                </Link>
                            </Button>
                        </div>
                    </>

                }
                {tab === 'fridaysList' && (
                    <div className={'fridays_list_main'}>
                        {allFridays.info && Object.keys(allFridays.info).length > 0 ?
                            Object.values(allFridays.info)
                                .filter((sm: IFridayInfo) => sm.image !== null || sm.video !== null || sm.music !== null)
                                .sort((a: IFridayInfo, b: IFridayInfo) => b.number - a.number)
                                .map((item: IFridayInfo) => (
                                    <div key={item.id}>

                                        {item.image && (
                                            <div className={'fridays_list_title'}
                                                 onClick={() => handleOpenModalCurrImage(item.number.toString())}>
                                                <h3>Пятница #{item.number} ({item.custom_nickname})</h3>
                                                <img src={`${titleImg}`} alt={'title_img'}/>
                                            </div>
                                        )}

                                        {item.video && (
                                            <div className={'fridays_list_title'}
                                                 onClick={() => handleOpenModalCurrVideo(item.number.toString())}>
                                                <h3>Пятница #{item.number} ({item.custom_nickname})</h3>
                                                <img src={`${titleImg}`} alt={'title_img'}/>
                                            </div>
                                        )}

                                        {item.music && (
                                            <div className={'fridays_list_title'}
                                                 onClick={() => handleOpenModalCurrMusic(item.number.toString())}>
                                                <h3>Пятница #{item.number} ({item.custom_nickname})</h3>
                                                <img src={`${titleImg}`} alt={'title_img'}/>
                                            </div>
                                        )}
                                    </div>
                                ))
                            :
                            <div className={'no_fridays'}>
                                <span>Нет ни единой пятницы...</span>
                            </div>
                        }
                        {currentImageFriday?.image && (
                            <div className={'fridays_list_images'}>
                                <Modal open={modalImageIsOpen} onClose={handleCloseModal} onKeyDown={handleCloseEscape}>
                                    <Button onClick={handleCloseModal}>x</Button>
                                    <div style={{marginTop: currentImageFriday?.text ? '50px' : ''}}>
                                        {currentImageFriday?.text && <span>{currentImageFriday?.text}</span>}
                                        <img style={{marginTop: !currentImageFriday?.text ? '60px' : ''}}
                                             src={`${currentImageFriday?.image}`} alt={'last_friday'}/>
                                    </div>
                                </Modal>
                            </div>
                        )}

                        {currentVideoFriday?.video && (
                            <div className={'fridays_list_videos'}>
                                <Modal open={modalVideoIsOpen} onClose={handleCloseModal} onKeyDown={handleCloseEscape}>
                                    <Button onClick={handleCloseModal}>x</Button>
                                    <div style={{marginTop: currentVideoFriday?.text ? '50px' : ''}}
                                         className={'modal_postContent'}>
                                        {currentVideoFriday?.text && <span>{currentVideoFriday?.text}</span>}
                                        <video style={{marginTop: currentImageFriday?.text === '' ? '60px' : ''}}
                                               ref={videoRef} controls src={`${currentVideoFriday?.video}`}
                                               poster={`${sfglVideo}`}/>
                                    </div>
                                </Modal>
                            </div>
                        )}

                        {currentMusicFriday?.music && (
                            <div className={'fridays_list_music'}>
                                <Modal open={modalMusicIsOpen} onClose={handleCloseModal} onKeyDown={handleCloseEscape}>
                                    <Button onClick={handleCloseModal}>x</Button>
                                    <div style={{marginTop: currentImageFriday?.text ? '50px' : ''}}>
                                        {currentMusicFriday?.text && <span>{currentMusicFriday?.text}</span>}
                                        <AudioImagePlayer style={{marginTop: !currentImageFriday?.text ? '60px' : ''}}
                                                          src={`${currentMusicFriday?.music}`} image={`${sfglMusic}`}
                                                          isPlay={modalMusicIsOpen}/>
                                    </div>
                                </Modal>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'fridaysCreators' && <CurrentFridayPerson/>}
            </div>
        </div>
    )
}

export default Fridays;