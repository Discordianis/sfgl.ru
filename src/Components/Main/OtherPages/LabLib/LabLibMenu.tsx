import React, {useEffect, useState} from "react";
import './LabLibMenu.css'
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux";
import Loading from "../../../Loading/Loading.tsx";
import {NavLink} from "react-router-dom";
import imageNF from '../../../../../public/icons/imageNotFoundLong.jpeg'
import witches from '../../../../../public/background/witches.jpg'
import TextOverflow from "../../../TextOverflow/TextOverflow.tsx";

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
    length: number
}

const LabLibMenu: React.FC = () => {

    const body = document.body
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData.data?.info)
    const token = localStorage.getItem('token')

    const [stories, setStories] = useState<IStoriesInfo | null>(null)
    const [selectedStory, setSelectedStory] = useState<IStoriesInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [isActive, setIsActive] = useState('')

    useEffect(() => {
        const fetching = async() => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllStories'})
            })
            const data = await res.json()
            if (!data?.status) {
                console.log(data?.info)
                setLoading(false)
            }
            else {
                setStories(data?.info)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    const getStoryById = (id: string) => {
        if (stories) {
            const data = Object.values(stories).find((item: IStoriesInfo) => item.id === id) as IStoriesInfo;
            if (data) {
                setSelectedStory(data);
                setIsActive(data.id)
            }
        }
    };

    useEffect(() => {
        if (selectedStory) {
            body.style.backgroundImage = `url('${selectedStory.poster}')`
            body.style.backdropFilter = 'brightness(0.8)'
            body.style.backgroundSize = 'cover';
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundPosition = 'center';
            body.style.backgroundRepeat = 'no-repeat';
        }
        return () => {
            body.style.backgroundImage = 'none'
            body.style.backdropFilter = 'none'
        }
    }, [selectedStory]);

    useEffect(() => {
        const fog = document.getElementById('bg-fog-video')
        if (fog && !selectedStory) {
            fog.style.visibility = 'hidden'
        }
        else {
            fog.style.visibility = 'visible'
        }

        if (!selectedStory?.poster) {
            const body = document.body
            if (body && fog) {
                body.style.backgroundImage = `url('${witches}')`
                body.style.backdropFilter = 'brightness(0.8)'
                body.style.backgroundSize = 'cover';
                body.style.backgroundAttachment = 'fixed';
                body.style.backgroundPosition = 'center left';
                body.style.backgroundRepeat = 'no-repeat';
                fog.style.visibility = 'hidden'
            }
        }
    }, [selectedStory]);

    if (loading) {
        return <Loading />
    }

    return(
        <div className={'lablib_root'}>
            <div>
                <div className={'lablib_menu_right'}>
                    {(stories && stories?.length > 0) ?
                        <>
                            <div>
                                <h3>Выберите историю</h3>
                            </div>
                            <div className={'lablib_menu_selector'}>
                                {Object.values(stories).map((story: IStoriesInfo) =>
                                    <div className={'lablib_selector_preview'} key={story.id}
                                         onClick={() => getStoryById(story.id)}>
                                        <div
                                            className={isActive === story?.id ? 'lablib_selector_image active' : 'lablib_selector_image'}>
                                            <img src={`${story?.cover ? story?.cover : imageNF}`} alt={'title_image'}/>
                                        </div>
                                        <div className={'lablib_selector_titles'}>
                                            <h4>{story.name_rus}</h4>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={'library_create_btn'}>
                                <NavLink to={`/users/${myData?.nickname}/createInfo/library`}>Написать историю</NavLink>
                            </div>
                        </>
                        :
                        <div className={'library_page_no_story'}>
                            <div>
                                <span><strong>Нет ни одной истории...</strong></span>
                            </div>
                            <div className={'no_library_create_first'}>
                                <NavLink to={`/users/${myData?.nickname}/createInfo/library`}>Создать историю</NavLink>
                            </div>
                        </div>
                    }
                        </div>
                    {selectedStory &&
                        <div className={'lablib_menu_description'}>
                            {selectedStory?.description ?
                                <TextOverflow text={selectedStory?.description} maxHeight={9999} />
                                :
                                <span>Описание отсутствует...</span>
                            }
                    <NavLink to={`/library/story/${selectedStory.id}-${selectedStory.name_eng}`}>
                        <div>Зайти в область истории</div>
                    </NavLink>
                </div>
                }
            </div>
        </div>
    )
}
export default LabLibMenu