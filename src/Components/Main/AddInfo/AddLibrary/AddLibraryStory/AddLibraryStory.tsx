import './AddLibraryStory.css'
import React, {useEffect, useRef, useState} from "react";
import imageNG from '../../../../../../public/icons/imageNotFound.jpeg'
import useInput from "../../../../../hooks/useInput.tsx";
import moment from "moment";
import Button from "../../../../Button/Button.tsx";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import {NavLink} from "react-router-dom";
import HoldButton from "../../../../Button/HoldButton.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import Loading from "../../../../Loading/Loading.tsx";

interface IAllCharactersInfo {
    age: string,
    author: string,
    birthday: string,
    cover: string,
    description: string,
    height: string,
    id: string,
    life_status: string,
    name_eng: string,
    name_rus: string,
    va_avatar: string,
    va_char_avatar: string,
    va_char_name: string,
    va_name: string,
    role: string
}

interface IAllChaptersInfo {
    author: string,
    date_created: string,
    date_modified: string,
    forbidden: boolean,
    id: string,
    image: string,
    name: string,
    number: string,
    story_id: string,
    text: string
}

interface IAllChaptersInfo {
    author: string,
    chapters: {
        [key: number]: IAllChaptersInfo
    }
    cover: string,
    date_created: string,
    date_end: string,
    date_modified: string,
    date_start: string,
    description: string,
    id: string,
    name_eng: string,
    name_rus: string,
    poster: string,
    status: string,
    visibility: boolean
}

interface IAllStoriesInfo {
    author: string,
    characters: {
        [key: number]: IAllCharactersInfo
    }
    cover: string,
    date_created: string,
    date_end: string,
    date_modified: string,
    date_start: string,
    description: string,
    id: string,
    name_eng: string,
    name_rus: string,
    poster: string,
    status: string
}

interface IAllData {
    status: boolean,
    info: {
        chapters_edit: {
            [key: number]: IAllChaptersInfo
        },
        characters_edit: {
            [key: number]: IAllCharactersInfo
        },
        stories_edit: {
            [key: number]: IAllStoriesInfo
        },

    }
}

interface IAllUsersInfo {
    custom_nickname?: string;
    nickname?: string;
    avatar?: string;
    id?: string;
    online?: number;
    last_online_date?: string | Date
}

interface IAllUsers {
    status: boolean,
    info: {
        [key: number]: IAllUsersInfo
    }
}

interface ICallback {
    allUsers: IAllUsers,
    token: string,
    server: string
}

const AddLibraryStory: React.FC<ICallback> = ({allUsers, server, token}) => {

    const [allLibraryData, setAllLibraryData] = useState<IAllData | null>(null)
    const [allStoryCharacters, setAllStoryCharacters] = useState<IAllCharactersInfo[] | null>(null)
    const [allCharacters, setAllCharacters] = useState<{ [key: number]: IAllCharactersInfo } | null>(null)
    const myData = useSelector((state: RootState) => state.myData)
    const [activeStory, setActiveStory] = useState('')

    const storyRusNameEdit = useInput('', {emptyInput: false})
    const storyEngNameEdit = useInput('', {emptyInput: false})
    const storyDescriptionEdit = useInput('', {emptyInput: false})
    const storyStartDateEdit = useInput('', {emptyInput: false})
    const storyEndDateEdit = useInput('', {emptyInput: false})
    const [storyStatusEdit, setStoryStatusEdit] = useState<'announce' | 'ongoing' | 'ended' | string>('announce')
    const storyCoverEdit = useRef<HTMLInputElement | null>(null)
    const storyPosterEdit = useRef<HTMLInputElement | null>(null)

    const storyRusNameNew = useInput('', {emptyInput: false})
    const storyEngNameNew = useInput('', {emptyInput: false})
    const storyDescriptionNew = useInput('', {emptyInput: false})
    const storyStartDateNew = useInput('', {emptyInput: false})
    const storyEndDateNew = useInput('', {emptyInput: false})
    const [storyStatusNew, setStoryStatusNew] = useState<'announce' | 'ongoing' | 'ended' | string>('announce')
    const storyCoverNew = useRef<HTMLInputElement | null>(null)
    const storyPosterNew = useRef<HTMLInputElement | null>(null)

    const userSearch = useInput('', {})
    const [selectedUsers, setSelectedUsers] = useState<IAllUsersInfo[]>([])
    const [typeSelectedCharacters, setTypeSelectedCharacters] = useState<{ [key: string]: string }>({});
    const [typeCurrentCharacters, setTypeCurrentCharacters] = useState<{ [key: string]: string }>({});

    const [currentStory, setCurrentStory] = useState<IAllStoriesInfo | null>(null)
    const [currentAuthor, setCurrentAuthor] = useState<IAllUsersInfo>(null)

    const [openCharacterList, setOpenCharacterList] = useState(false)
    const [posting, setPosting] = useState(false)
    const [createNewStory, setCreateNewStory] = useState(false)
    const [inputsErrorEdit, setInputsErrorEdit] = useState(false)
    const [inputsErrorNew, setInputsErrorNew] = useState(false)
    const [nihility, setNihility] = useState(false)
    const [loading, setLoading] = useState(true)

    const [coverEditError, setCoverEditError] = useState(false)
    const [posterEditError, setPosterEditError] = useState(false)
    const [coverNewError, setCoverNewError] = useState(false)
    const [posterNewError, setPosterNewError] = useState(false)


    const {showNotification, NotificationComponent} = useNotification()

    const [fileCoverError, setFileCoverError] = useState('')
    const [fileCoverUrl, setFileCoverUrl] = useState<string | null>(null)

    const [filePosterError, setFilePosterError] = useState('')
    const [filePosterUrl, setFilePosterUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetching = async () => {

            const resAll = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllForEditLibrary'})
            })
            const dataAll = await resAll.json()

            if (!dataAll?.status) {
                console.log(dataAll?.info)
                setLoading(false)
            } else {
                setAllLibraryData(dataAll)
                setAllCharacters(dataAll.info?.characters_edit)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    const getCurrentStory = (id: string) => {
        if (allLibraryData) {
            const currentStory = Object.values(allLibraryData?.info?.stories_edit).find((find: IAllStoriesInfo) => find.id === id) as IAllStoriesInfo
            if (currentStory?.characters) {
                const currentCharacters = Object.values(currentStory?.characters)
                if (currentCharacters) {
                    setAllStoryCharacters(currentCharacters);
                }
            }
            const currentAuthor = Object.values(allUsers?.info || {}).find((user) => user.nickname === currentStory?.author)
            if (currentAuthor) {
                setCurrentAuthor(currentAuthor)
            }
            if (currentStory) {
                setCurrentStory(currentStory)
                setActiveStory(currentStory?.id)
                setSelectedUsers([])
                setTypeSelectedCharacters({})
                setOpenCharacterList(false)
                setCreateNewStory(false)
                if (storyCoverEdit.current) {
                    storyCoverEdit.current.value = ''
                }
                if (storyPosterEdit.current) {
                    storyPosterEdit.current.value = ''
                }
                setFileCoverError('')
                setFilePosterError('')
                setFileCoverUrl('')
                setFilePosterUrl('')
            }
        }
    }

    const addAcceptCharacter = (id: string, type: 'main' | 'second') => {

        const currentCharacter: IAllCharactersInfo = Object.values(allCharacters)
            .find((story: IAllCharactersInfo) => story.id === id);

        if (currentCharacter) {
            const userArray = {
                id: currentCharacter?.id,
                name_rus: currentCharacter?.name_rus,
                name_eng: currentCharacter?.name_eng,
                cover: currentCharacter?.cover
            }

            setSelectedUsers([...selectedUsers, userArray])

            if (type === 'main') {
                const mainCharacter = {
                    [currentCharacter?.id]: 'main'
                }
                setTypeSelectedCharacters(prevState => ({...prevState, ...mainCharacter}))
            }
            if (type === 'second') {
                const secondCharacter = {
                    [currentCharacter?.id]: 'second'
                }
                setTypeSelectedCharacters(prevState => ({...prevState, ...secondCharacter}))
            }
        }
    }

    const deleteAcceptUser = (id: string) => {
        setSelectedUsers(selectedUsers.filter(filter => filter.id !== id))
        const filteredStoryChars = Object.values(allStoryCharacters).filter((filter: IAllCharactersInfo) => filter?.id !== id)
        if (filteredStoryChars) {
            setAllStoryCharacters(filteredStoryChars)
        }
        setTypeSelectedCharacters((prevState) => {
            const updState = {...prevState}
            delete updState[id]
            return updState
        });
        setTypeCurrentCharacters((prevState) => {
            const updState = {...prevState}
            delete updState[id]
            return updState
        });
    }

    useEffect(() => {
        if (currentStory) {
            storyRusNameEdit.setValue(currentStory?.name_rus || '')
            storyEngNameEdit.setValue(currentStory?.name_eng || '')
            setStoryStatusEdit(currentStory?.status || 'announce')
            storyStartDateEdit.setValue(currentStory?.date_start || '')
            storyEndDateEdit.setValue(currentStory?.date_end || '')
            storyDescriptionEdit.setValue(currentStory?.description || '')
            if (currentStory?.characters) {
                const charactersArray = Object.values(currentStory.characters).reduce((acc, character) => {
                    if (character.id && character.role) {
                        acc[character.id] = character.role;
                    }
                    return acc;
                }, {} as Record<string, string>);

                setTypeCurrentCharacters(charactersArray);
            }
        }
    }, [currentStory]);

    const voidingInputs = () => {
        storyRusNameNew.setValue('')
        storyEngNameNew.setValue('')
        setStoryStatusNew('announce')
        storyStartDateNew.setValue('')
        storyEndDateNew.setValue('')
        storyDescriptionNew.setValue('')
        setTypeCurrentCharacters(null)
        if (storyCoverNew.current) {
            storyCoverNew.current.value = ''
        }
        if (storyPosterNew.current) {
            storyPosterNew.current.value = ''
        }
    }

    useEffect(() => {
        if (createNewStory) {
            setCurrentStory(null)
            setActiveStory('')
            setAllStoryCharacters(null)
        }
    }, [createNewStory]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFileCoverError('')

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setFileCoverError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, .jpg');
            return;
        }
        if (file.size > 1024 * 1024) {
            setFileCoverError('Выбранный файл превышает максимально допустимый размер (1 МБ).');
            return;
        }
        const render = new FileReader()
        render.onloadend = () => {
            setFileCoverUrl(render.result as string)
        }
        render.readAsDataURL(file)
        console.log('Загруженный файл:', file);
    }
    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFilePosterError('')

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setFilePosterError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, или .jpg');
            return;
        }
        if (file.size > 1024 * 1024) {
            setFilePosterError('Выбранный файл превышает максимально допустимый размер (1 МБ).');
            return;
        }
        const render = new FileReader()
        render.onloadend = () => {
            setFilePosterUrl(render.result as string)
        }
        render.readAsDataURL(file)
        console.log('Загруженный файл:', file);
    }

    useEffect(() => {
        if (!storyRusNameEdit.value || !storyEngNameEdit.value || (storyStatusEdit === 'ongoing' && !storyStartDateEdit.value) ||
            (storyStatusEdit === 'ended' && !storyStartDateEdit.value && !storyEndDateEdit.value) ||
            !storyCoverEdit?.current?.files[0] || !storyPosterEdit?.current?.files[0]) {
            setInputsErrorEdit(true)
        }
        if (!storyRusNameNew.value || !storyEngNameNew.value || (storyStatusNew === 'ongoing' && !storyStartDateNew.value) ||
            (storyStatusNew === 'ended' && !storyStartDateNew.value && !storyEndDateNew.value) ||
            !storyCoverNew?.current?.files[0] || !storyPosterNew?.current?.files[0]) {
            setInputsErrorNew(true)
        }
        setInputsErrorEdit(false)
        setInputsErrorNew(false)
    }, [storyEndDateEdit.value, storyEndDateNew.value, storyEngNameEdit.value, storyEngNameNew.value, storyRusNameEdit.value,
        storyRusNameNew.value, storyStartDateEdit.value, storyStartDateNew.value, storyStatusEdit, storyStatusNew,
        storyCoverEdit.current, storyPosterEdit.current, storyCoverNew.current, storyPosterNew.current]);

    const uploadStory = async (e: React.FormEvent) => {
        e.preventDefault()

        setPosting(true)

        if (createNewStory && inputsErrorNew) {
            if (!fileCoverUrl) {
                setCoverNewError(true)
            }
            if (!filePosterUrl) {
                setPosterNewError(true)
            }
            showNotification('Отсутствует обложка или постер!', 'error')
            setPosting(false)
            return;
        }
        if (!createNewStory && inputsErrorEdit) {
            if (!fileCoverUrl) {
                setCoverEditError(true)
            }
            if (!filePosterUrl) {
                setPosterEditError(true)
            }
            showNotification('Упс, вы что-то забыли...', 'error')
            setPosting(false)
            return;
        }

        if (filePosterError.length > 0) {
            showNotification(`${filePosterError}`, 'error')
            setPosting(false)
            return;
        }
        if (fileCoverError.length > 0) {
            showNotification(`${fileCoverError}`, 'error')
            setPosting(false)
            return;
        }

        if ((storyStatusEdit === 'ongoing') && !storyStartDateEdit.value) {
            showNotification('Выберите дату начала', 'error')
            setPosting(false)
            return;
        }
        if ((storyStatusEdit === 'ended') && (!storyStartDateEdit.value || !storyEndDateEdit.value)) {
            showNotification('Выберите дату начала и конца', 'error')
            setPosting(false)
            return;
        }
        if (storyStatusNew === 'ongoing' && !storyStartDateNew.value) {
            showNotification('Выберите дату начала', 'error')
            setPosting(false)
            return;
        }
        if ((storyStatusNew === 'ended') && (!storyStartDateNew.value || !storyEndDateNew.value)) {
            showNotification('Выберите дату начала и конца', 'error')
            setPosting(false)
            return;
        }

        setCoverNewError(false)
        setPosterNewError(false)
        setCoverEditError(false)
        setPosterEditError(false)

        const updForm = new FormData()
        const newForm = new FormData()

        const allCharacters = {...typeCurrentCharacters, ...typeSelectedCharacters}

        const updBody = {
            token: token,
            action: 'updateStory',
            data: {
                author: currentStory?.author,
                name_rus: storyRusNameEdit.value,
                name_eng: storyEngNameEdit.value,
                description: storyDescriptionEdit.value,
                status: storyStatusEdit,
                date_start: storyStartDateEdit.value,
                date_end: storyEndDateEdit.value,
                characters: allCharacters || '',
            },
            conditions: {id: currentStory?.id},
        }

        const newBody = {
            token: token,
            action: 'insertStory',
            data: {
                author: myData?.data?.info?.nickname,
                name_rus: storyRusNameNew.value,
                name_eng: storyEngNameNew.value,
                description: storyDescriptionNew.value,
                status: storyStatusNew,
                date_start: storyStartDateNew.value,
                date_end: storyEndDateNew.value,
                characters: allCharacters || '',
            }
        }

        if (createNewStory) {
            if (storyCoverNew.current.files[0]) {
                newForm.append('cover', storyCoverNew.current.files[0])
            }
            if (storyPosterNew.current.files[0]) {
                newForm.append('poster', storyPosterNew.current.files[0])
            }
            newForm.append('post', JSON.stringify(newBody))

            const resNew = await fetch(server, {
                method: 'POST',
                body: newForm
            })
            const data = await resNew.json()

            if (!data.status) {
                console.log(data?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
            } else {
                showNotification('Данные обновлены', 'success')
                voidingInputs()
            }
        } else {
            if (storyCoverEdit.current.files[0]) {
                updForm.append('cover', storyCoverEdit.current.files[0])
            }
            if (storyPosterEdit.current.files[0]) {
                updForm.append('poster', storyPosterEdit.current.files[0])
            }
            updForm.append('post', JSON.stringify(updBody))

            const resEdit = await fetch(server, {
                method: 'POST',
                body: updForm
            })
            const data = await resEdit.json()

            if (!data.status) {
                console.log(data?.info)
                showNotification('Упс, что-то пошло не так...', 'error')
                setPosting(false)
            } else {
                showNotification('Данные обновлены', 'success')
            }
        }
        const resAll = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'getAllForEditLibrary', conditions: {}})
        })
        const dataAll = await resAll.json()
        if (!dataAll?.status) {
            console.log(dataAll?.info)
            showNotification('Упс, что-то пошло не так...', "error")
        } else {
            setAllLibraryData(dataAll)
            setFileCoverUrl(null)
            setFilePosterUrl(null)
            if (storyCoverNew.current) {
                storyCoverNew.current.value = ''
            }
            if (storyPosterNew.current) {
                storyPosterNew.current.value = ''
            }
            setPosting(false)
        }
    }

    const deleteStory = async (id: string) => {
        setPosting(true)
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteStory', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data?.status) {
            console.log(data?.info)
            setPosting(false)
            showNotification('Упс, что-то пошло не так...', "error")
        } else {
            showNotification('История была отправлена в Горизонт Историй', "success")
            const resAll = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllForEditLibrary', conditions: {}})
            })
            const dataAll = await resAll.json()
            if (!dataAll?.status) {
                console.log(dataAll?.info)
                setAllLibraryData(null)
                setPosting(false)
            } else {
                setAllLibraryData(dataAll)
            }
            storyRusNameNew.setValue('')
            storyEngNameNew.setValue('')
            storyStartDateNew.setValue('')
            storyEndDateNew.setValue('')
            storyDescriptionNew.setValue('')
            if (storyCoverNew.current) {
                storyCoverNew.current.value = ''
            }
            if (storyPosterNew.current) {
                storyPosterNew.current.value = ''
            }
            setFileCoverUrl('')
            setFilePosterUrl('')
            setStoryStatusNew('ongoing')
            setCurrentStory(null)
            setActiveStory(null)
            setNihility(false)
            setPosting(false)
        }
    }

    if (loading) {
        return <Loading/>
    }

    return (
        <div className={'add_library_story_root'}>
            {allLibraryData?.info?.stories_edit ?
                <div>
                    <div className={'add_library_story_header'}>
                        <div className={'add_library_story_header_choose_story'}>
                            <h3>Список историй</h3>
                        </div>
                        <div className={'add_library_story_list'}>
                            {Object.values(allLibraryData?.info?.stories_edit).map((story: IAllStoriesInfo, index) =>
                                <div key={index}
                                     className={`add_library_story_prop ${activeStory === story.id ? 'active' : ''}`}
                                     onClick={() => getCurrentStory(story?.id)}>
                                    <div>
                                        <img src={`${story?.cover ? story?.cover : imageNG}`} alt={'story_img'}/>
                                    </div>
                                    <div className={'add_library_story_prop_title'}>
                                        {story?.name_rus &&
                                            <span><strong>{story?.name_rus}</strong></span>
                                        }
                                        {story?.name_eng &&
                                            <span>{story?.name_eng}</span>
                                        }
                                        {!story?.name_rus && !story?.name_eng &&
                                            <span><strong>Безымянная история</strong></span>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                        {!createNewStory &&
                            <Button onClick={() => setCreateNewStory(true)}>Создать историю</Button>
                        }
                    </div>
                    {(currentStory && !createNewStory) &&
                        <div className={'add_library_story_main'}>
                            <div className={'add_library_story_main_title'}>
                                <h3>Изменение истории</h3>
                            </div>
                            <div className={'add_library_story_main_info'}>
                                <div className={'add_library_story_main_inputs'}>
                                    <div className={'add_library_story_comm_inputs'}>
                                        <div>
                                            <div>
                                                <label>Название истории (рус.):
                                                    <input type={"text"} value={storyRusNameEdit.value}
                                                           style={{outline: storyRusNameEdit.emptyInput ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyRusNameEdit.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div>
                                                <label>Название истории (англ.):
                                                    <input type={"text"} value={storyEngNameEdit.value}
                                                           style={{outline: storyEngNameEdit.emptyInput ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyEngNameEdit.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div className={'add_library_story_main_select filter_buttons'}>
                                                <span>Статус истории:</span>
                                                <select value={storyStatusEdit}
                                                        onChange={(e) => setStoryStatusEdit(e.target.value)}>
                                                    <option value={'announce'}>Анонс</option>
                                                    <option value={'ongoing'}>Онгоинг</option>
                                                    <option value={'ended'}>Завершено</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <label>Дата начала:
                                                    <input type={"date"} value={storyStartDateEdit.value}
                                                           style={{outline: (storyStartDateEdit.emptyInput && storyStatusEdit !== 'announce') ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyStartDateEdit.onChange(e)}/>
                                                </label>
                                            </div>
                                            {storyStatusEdit === 'ended' &&
                                                <div>
                                                    <label>Дата конца:
                                                        <input type={"date"} value={storyEndDateEdit.value}
                                                               style={{outline: storyEndDateEdit.emptyInput ? '#af4545 solid' : ''}}
                                                               max={moment().format('YYYY-MM-DD')}
                                                               onChange={(e) => storyEndDateEdit.onChange(e)}/>
                                                    </label>
                                                </div>
                                            }
                                            <div>
                                                <label>Обложка (4:3):
                                                    <input type={"file"} ref={storyCoverEdit}
                                                           onChange={handleCoverChange}
                                                           style={{outline: coverEditError ? '#af4545 solid' : ''}}
                                                           accept={'.jpg, .jpeg, .png'}/>
                                                </label>
                                                {fileCoverError &&
                                                    <span>{fileCoverError}</span>
                                                }
                                            </div>
                                            <div>
                                                <label>Постер (16:9):
                                                    <input type={"file"} ref={storyPosterEdit}
                                                           onChange={handlePosterChange}
                                                           style={{outline: posterEditError ? '#af4545 solid' : ''}}
                                                           accept={'.jpg, .jpeg, .png'}/>
                                                </label>
                                                {filePosterError &&
                                                    <span>{filePosterError}</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={'textarea_span'}>
                                            <span>Описание истории:</span>
                                            <textarea value={storyDescriptionEdit.value}
                                                      onChange={(e) => storyDescriptionEdit.onChange(e)} rows={10}/>
                                        </div>
                                    </div>
                                    {!openCharacterList &&
                                        <div>
                                            <Button onClick={() => setOpenCharacterList(true)}>Персонажи
                                                истории</Button>
                                        </div>
                                    }
                                    {openCharacterList &&
                                        <div className={'story_accept_root'}>
                                            <div>
                                                <h3>Персонажи истории</h3>
                                            </div>
                                            <div className={'story_accept_root_now_root'}>
                                                {(allStoryCharacters && Object.values(allStoryCharacters).length > 0) &&
                                                    <div className={'story_accept_root_current'}>
                                                        <div>
                                                            <span><strong>Текущие персонажи:</strong></span>
                                                        </div>
                                                        <div>
                                                            {Object.values(allStoryCharacters).map((character: IAllCharactersInfo, index) =>
                                                                <div className={'story_accept_user_prop'} key={index}>
                                                                    <div>
                                                                        <div className={'story_accept_user_avatar'}>
                                                                            <img src={`${character?.cover}`}
                                                                                 alt={'user_avatar'}/>
                                                                        </div>
                                                                        <div className={'story_accept_user_nickname'}>
                                                                            <span><strong>{character?.name_rus}</strong></span>
                                                                            <span>{character?.name_eng}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={'story_accept_user_prop_buttons'}>
                                                                        <Button>{character?.role === 'main' ? 'MC' : 'S'}</Button>
                                                                        <Button onClick={() => deleteAcceptUser(character?.id)}>x</Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                }
                                                {selectedUsers.length > 0 &&
                                                    <div className={'story_accept_root_now'}>
                                                        <div>
                                                            <span><strong>Будут добавлены:</strong></span>
                                                        </div>
                                                        <div className={'story_accept_root_now_list'}>
                                                            <div>
                                                                {Object.values(selectedUsers).map((accept: IAllCharactersInfo, index) =>
                                                                    <div className={'story_accept_user_prop'}
                                                                         key={index}>
                                                                        <div>
                                                                            <div className={'story_accept_user_avatar'}>
                                                                                <img src={`${accept?.cover}`}
                                                                                     alt={'user_avatar'}/>
                                                                            </div>
                                                                            <div
                                                                                className={'story_accept_user_nickname'}>
                                                                                <span><strong>{accept?.name_rus}</strong></span>
                                                                                <span>{accept?.name_eng}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className={'story_accept_user_prop_buttons'}>
                                                                            <Button>{typeSelectedCharacters[accept?.id] === 'main' ? 'MC' : 'S'}</Button>
                                                                            <Button onClick={() => deleteAcceptUser(accept?.id)}>x</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span>Внимание! Авторы персонажей получат доступ к созданию собственных глав в Вашей истории!</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <div className={'story_accept_search'}>
                                                    <input placeholder={'Поиск персонажа...'}
                                                           value={userSearch.value}
                                                           onChange={(e) => userSearch.onChange(e)}/>
                                                </div>
                                                <div className={'story_accept_char_list'}>
                                                    {Object.values(allCharacters)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            (userSearch.value === '' ||
                                                                filter?.name_rus.toLowerCase().includes(userSearch.value.toLowerCase()) ||
                                                                filter?.name_eng.toLowerCase().includes(userSearch.value.toLowerCase())))
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            !selectedUsers.find(selected => selected.id === filter?.id))
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            allStoryCharacters ?
                                                                !allStoryCharacters.find(selected => selected.id === filter?.id) :
                                                                true)

                                                        .map((user: IAllCharactersInfo, index) =>
                                                            <div className={'story_accept_user_prop'} key={index}>
                                                                <div>
                                                                    <div className={'story_accept_user_avatar'}>
                                                                        <img src={`${user?.cover}`}
                                                                             alt={'user_avatar'}/>
                                                                    </div>
                                                                    <div className={'story_accept_user_nickname'}>
                                                                        <span><strong>{user?.name_rus}</strong></span>
                                                                        <span>{user?.author}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Button
                                                                        onClick={() => addAcceptCharacter(user?.id, 'main')}>MC</Button>
                                                                    <Button
                                                                        onClick={() => addAcceptCharacter(user?.id, 'second')}>S</Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className={'story_accept_user_list'}>
                                                <span><strong>На данный момент доступ к истории имеют:</strong></span>
                                                <div>
                                                    {currentAuthor ?
                                                        <NavLink to={`/users/${currentAuthor?.nickname}`}>
                                                            <div className={'story_accept_user_prop'}
                                                                 style={{outline: 'var(--border-wheat)'}}>
                                                                <div>
                                                                    <div className={'story_accept_user_avatar'}>
                                                                        <img src={`${currentAuthor?.avatar}`}
                                                                             alt={'user_avatar'}/>
                                                                    </div>
                                                                    <div className={'story_accept_user_nickname'}>
                                                                        <span><strong>{currentAuthor?.custom_nickname}</strong></span>
                                                                        <span>{currentAuthor?.nickname}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </NavLink>
                                                        :
                                                        null
                                                    }
                                                    {(currentStory && currentStory?.characters) &&
                                                        Array.from(new Set(Object.values(currentStory.characters).flatMap((storyCharacter: IAllCharactersInfo) =>
                                                            Object.values(allUsers?.info || {}).filter((user: IAllUsersInfo) =>
                                                                user.nickname === storyCharacter.author && user.nickname !== currentAuthor?.nickname
                                                            )
                                                        )))
                                                            .map((user: IAllUsersInfo, index) => (
                                                                <NavLink to={`/users/${user?.nickname}`} key={index}>
                                                                    <div className={'story_accept_user_prop'}>
                                                                        <div>
                                                                            <div className={'story_accept_user_avatar'}>
                                                                                <img src={`${user?.avatar}`}
                                                                                     alt={'user_avatar'}/>
                                                                            </div>
                                                                            <div
                                                                                className={'story_accept_user_nickname'}>
                                                                                <span><strong>{user?.custom_nickname}</strong></span>
                                                                                <span>{user?.nickname}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </NavLink>
                                                            ))
                                                    }
                                                </div>
                                                <span>Имеющиеся разрешения у соавторов: создание, редактирование и
                                                    удаление собственных глав истории. Автор истории помечен особой рамкой.</span>
                                            </div>
                                            <div className={'story_accept_close_button'}>
                                                <Button onClick={() => setOpenCharacterList(false)}>Закрыть</Button>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className={'add_library_story_main_cover'}>
                                    <div>
                                        <h4>Обложка</h4>
                                        <img
                                            src={`${fileCoverUrl ? fileCoverUrl : currentStory?.cover ? currentStory?.cover : imageNG}`}
                                            alt={'story_cover'}/>
                                    </div>
                                    <div>
                                        <h4>Постер</h4>
                                        <img
                                            src={`${filePosterUrl ? filePosterUrl : currentStory?.poster ? currentStory?.poster : imageNG}`}
                                            alt={'story_cover'}/>
                                    </div>
                                </div>
                            </div>
                            <div className={'add_library_story_save_buttons'}>
                                <div className={'delete_buttons_root'}>
                                    {!nihility ?
                                        <Button style={{color: '#b34949'}} onClick={() => setNihility(true)}>Функция Небытия...</Button>
                                        :
                                        <>
                                            <Button onClick={() => setNihility(false)}>Отмена</Button>
                                            <HoldButton onClick={() => deleteStory(currentStory?.id)}>Удалить историю</HoldButton>
                                        </>
                                    }
                                </div>
                                <div className={'add_save_button'}>
                                    <Button onClick={uploadStory}
                                            disabled={inputsErrorEdit || posting || coverEditError ||
                                                posterEditError || fileCoverError?.length > 0 || filePosterError?.length > 0}>
                                        Сохранить изменения
                                    </Button>
                                </div>
                            </div>
                        </div>
                    }

                    {createNewStory &&
                        <div className={'add_library_story_main'}>
                            <div className={'add_library_story_main_title'}>
                                <h3>Создание истории</h3>
                            </div>
                            <div className={'add_library_story_main_info'}>
                                <div className={'add_library_story_main_inputs'}>
                                    <div className={'add_library_story_comm_inputs'}>
                                        <div>
                                            <div>
                                                <label>Название истории (рус.):
                                                    <input type={"text"} value={storyRusNameNew.value}
                                                           style={{outline: storyRusNameNew.emptyInput ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyRusNameNew.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div>
                                                <label>Название истории (англ.):
                                                    <input type={"text"} value={storyEngNameNew.value}
                                                           style={{outline: storyEngNameNew.emptyInput ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyEngNameNew.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div className={'add_library_story_main_select filter_buttons'}>
                                                <span>Статус истории:</span>
                                                <select value={storyStatusNew}
                                                        onChange={(e) => setStoryStatusNew(e.target.value)}>
                                                    <option value={'announce'}>Анонс</option>
                                                    <option value={'ongoing'}>Онгоинг</option>
                                                    <option value={'ended'}>Завершено</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <label>Дата начала:
                                                    <input type={"date"} value={storyStartDateNew.value}
                                                           style={{outline: (storyStartDateNew.emptyInput && storyStatusNew !== 'announce') ? '#af4545 solid' : ''}}
                                                           onChange={(e) => storyStartDateNew.onChange(e)}/>
                                                </label>
                                            </div>
                                            {storyStatusNew === 'ended' &&
                                                <div>
                                                    <label>Дата конца:
                                                        <input type={"date"} value={storyEndDateNew.value}
                                                               style={{outline: storyEndDateNew.emptyInput ? '#af4545 solid' : ''}}
                                                               max={moment().format('YYYY-MM-DD')}
                                                               onChange={(e) => storyEndDateNew.onChange(e)}/>
                                                    </label>
                                                </div>
                                            }
                                            <div>
                                                <label>Обложка (4:3):
                                                    <input type={"file"} ref={storyCoverNew}
                                                           onChange={handleCoverChange}
                                                           style={{outline: coverNewError ? '#af4545 solid' : ''}}
                                                           accept={'.jpg, .jpeg, .png'}/>
                                                </label>
                                                {fileCoverError &&
                                                    <span>{fileCoverError}</span>
                                                }
                                            </div>
                                            <div>
                                                <label>Постер (16:9):
                                                    <input type={"file"} ref={storyPosterNew}
                                                           onChange={handlePosterChange}
                                                           style={{outline: posterNewError ? '#af4545 solid' : ''}}
                                                           accept={'.jpg, .jpeg, .png'}/>
                                                </label>
                                                {filePosterError &&
                                                    <span>{filePosterError}</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className={'textarea_span'}>
                                        <span>Описание истории:</span>
                                        <textarea value={storyDescriptionNew.value}
                                                  onChange={(e) => storyDescriptionNew.onChange(e)} rows={10}/>
                                    </div>
                                    {!openCharacterList &&
                                        <div>
                                            <Button onClick={() => setOpenCharacterList(true)}>Персонажи
                                                истории</Button>
                                        </div>
                                    }
                                    {(openCharacterList && allCharacters) ?
                                        <div className={'story_accept_root'}>
                                            <div>
                                                <h3>Персонажи истории</h3>
                                            </div>
                                            <div className={'story_accept_root_now_root'}>
                                                {selectedUsers.length > 0 &&
                                                    <div className={'story_accept_root_now'}>
                                                        <div>
                                                            <span><strong>Будут добавлены:</strong></span>
                                                        </div>
                                                        <div className={'story_accept_root_now_list'}>
                                                            <div>
                                                                {Object.values(selectedUsers).map((accept: IAllCharactersInfo, index) =>
                                                                    <div className={'story_accept_user_prop'}
                                                                         key={index}>
                                                                        <div>
                                                                            <div className={'story_accept_user_avatar'}>
                                                                                <img src={`${accept?.cover}`}
                                                                                     alt={'user_avatar'}/>
                                                                            </div>
                                                                            <div
                                                                                className={'story_accept_user_nickname'}>
                                                                                <span><strong>{accept?.name_rus}</strong></span>
                                                                                <span>{accept?.name_eng}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className={'story_accept_user_prop_buttons'}>
                                                                            <Button>{typeSelectedCharacters[accept?.id] === 'main' ? 'MC' : 'S'}</Button>
                                                                            <Button
                                                                                onClick={() => deleteAcceptUser(accept?.id)}>x</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span>Внимание! Авторы персонажей получат доступ к созданию собственных глав в Вашей истории!</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <div className={'story_accept_search'}>
                                                    <input placeholder={'Поиск персонажа...'}
                                                           value={userSearch.value}
                                                           onChange={(e) => userSearch.onChange(e)}/>
                                                </div>
                                                <div className={'story_accept_char_list'}>
                                                    {Object.values(allCharacters)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            (userSearch.value === '' ||
                                                                filter?.name_rus.toLowerCase().includes(userSearch.value.toLowerCase()) ||
                                                                filter?.name_eng.toLowerCase().includes(userSearch.value.toLowerCase())))
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            selectedUsers ?
                                                                !selectedUsers.find(selected => selected.id === filter?.id) :
                                                                true)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            allStoryCharacters ?
                                                                !allStoryCharacters.find(selected => selected.id === filter?.id) :
                                                                true)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            allCharacters ?
                                                                Object.values(allCharacters).some((find: IAllCharactersInfo) => find.id !== filter.id) :
                                                                true)
                                                        .map((user: IAllCharactersInfo, index) =>
                                                            <div className={'story_accept_user_prop'} key={index}>
                                                                <div>
                                                                    <div className={'story_accept_user_avatar'}>
                                                                        <img src={`${user?.cover}`}
                                                                             alt={'user_avatar'}/>
                                                                    </div>
                                                                    <div className={'story_accept_user_nickname'}>
                                                                        <span><strong>{user?.name_rus}</strong></span>
                                                                        <span>{user?.author}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Button
                                                                        onClick={() => addAcceptCharacter(user?.id, 'main')}>MC</Button>
                                                                    <Button
                                                                        onClick={() => addAcceptCharacter(user?.id, 'second')}>S</Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className={'story_accept_close_button'}>
                                                <Button onClick={() => setOpenCharacterList(false)}>Закрыть</Button>
                                            </div>
                                        </div>
                                        : openCharacterList &&
                                        <div className={'no_characters'}>
                                            <span>Нет ни одного персонажа...</span>
                                            <div className={'story_accept_close_button'}>
                                                <Button onClick={() => setOpenCharacterList(false)}>Закрыть</Button>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {(fileCoverUrl || filePosterUrl) &&
                                    <div className={'add_library_story_main_cover'}>
                                        {fileCoverUrl &&
                                            <div>
                                                <h4>Обложка</h4>
                                                <img
                                                    src={`${fileCoverUrl}`}
                                                    alt={'story_cover'}/>
                                            </div>
                                        }
                                        {filePosterUrl &&
                                            <div>
                                                <h4>Постер</h4>
                                                <img
                                                    src={`${filePosterUrl}`}
                                                    alt={'story_cover'}/>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <div className={'add_save_button'}>
                                <div>
                                    <Button onClick={uploadStory}
                                            disabled={inputsErrorNew || posting || coverNewError || posterNewError ||
                                                fileCoverError?.length > 0 || filePosterError?.length > 0}>Создать историю</Button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                :
                <div>
                    {!createNewStory ?
                        <div className={'add_first_story'}>
                            <span>Нет ни одной истории...</span>
                            <Button onClick={() => setCreateNewStory(true)}>Создать первую историю</Button>
                        </div>
                        :
                        <div className={'add_library_story_main'}>
                            <div className={'add_library_story_main_title'}>
                                <h3>Создание истории</h3>
                            </div>
                            <div className={'add_library_story_main_info'}>
                                <div className={'add_library_story_main_inputs'}>
                                    <div className={'add_library_story_comm_inputs'}>
                                        <div>
                                            <label>Название истории (рус.):
                                                <input type={"text"} value={storyRusNameNew.value}
                                                       style={{outline: storyRusNameNew.emptyInput ? '#af4545 solid' : ''}}
                                                       onChange={(e) => storyRusNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Название истории (англ.):
                                                <input type={"text"} value={storyEngNameNew.value}
                                                       style={{outline: storyEngNameNew.emptyInput ? '#af4545 solid' : ''}}
                                                       onChange={(e) => storyEngNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div className={'add_library_story_main_select filter_buttons'}>
                                            <span>Статус истории:</span>
                                            <select value={storyStatusNew}
                                                    onChange={(e) => setStoryStatusNew(e.target.value)}>
                                                <option value={'announce'}>Анонс</option>
                                                <option value={'ongoing'}>Онгоинг</option>
                                                <option value={'ended'}>Завершено</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <label>Дата начала:
                                                <input type={"date"} value={storyStartDateNew.value}
                                                       style={{outline: (storyStartDateNew.emptyInput && storyStatusNew !== 'announce') ? '#af4545 solid' : ''}}
                                                       onChange={(e) => storyStartDateNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        {storyStatusNew === 'ended' &&
                                            <div>
                                                <label>Дата конца:
                                                    <input type={"date"} value={storyEndDateNew.value}
                                                           style={{outline: storyEndDateNew.emptyInput ? '#af4545 solid' : ''}}
                                                           max={moment().format('YYYY-MM-DD')}
                                                           onChange={(e) => storyEndDateNew.onChange(e)}/>
                                                </label>
                                            </div>
                                        }
                                        <div>
                                            <label>Обложка (4:3):
                                                <input type={"file"} ref={storyCoverNew} onChange={handleCoverChange}
                                                       style={{outline: coverNewError ? '#af4545 solid' : ''}}
                                                       accept={'.jpg, .jpeg, .png'}/>
                                            </label>
                                            {fileCoverError &&
                                                <span>{fileCoverError}</span>
                                            }
                                        </div>
                                        <div>
                                            <label>Постер (16:9):
                                                <input type={"file"} ref={storyPosterNew} onChange={handlePosterChange}
                                                       style={{outline: posterNewError ? '#af4545 solid' : ''}}
                                                       accept={'.jpg, .jpeg, .png'}/>
                                            </label>
                                            {filePosterError &&
                                                <span>{filePosterError}</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className={'textarea_span'}>
                                        <span>Описание истории:</span>
                                        <textarea value={storyDescriptionNew.value}
                                                  onChange={(e) => storyDescriptionNew.onChange(e)} rows={10}/>
                                    </div>
                                    {!openCharacterList &&
                                        <div>
                                            <Button onClick={() => setOpenCharacterList(true)}>Персонажи
                                                истории</Button>
                                        </div>
                                    }
                                    {(openCharacterList && allCharacters) ?
                                        <div className={'story_accept_root'}>
                                            <div>
                                                <h3>Персонажи истории</h3>
                                            </div>
                                            <div className={'story_accept_root_now_root'}>
                                                {selectedUsers.length > 0 &&
                                                    <div className={'story_accept_root_now'}>
                                                        <div>
                                                            <span><strong>Будут добавлены:</strong></span>
                                                        </div>
                                                        <div className={'story_accept_root_now_list'}>
                                                            <div>
                                                                {Object.values(selectedUsers).map((accept: IAllCharactersInfo, index) =>
                                                                    <div className={'story_accept_user_prop'}
                                                                         key={index}>
                                                                        <div>
                                                                            <div className={'story_accept_user_avatar'}>
                                                                                <img src={`${accept?.cover}`}
                                                                                     alt={'user_avatar'}/>
                                                                            </div>
                                                                            <div
                                                                                className={'story_accept_user_nickname'}>
                                                                                <span><strong>{accept?.name_rus}</strong></span>
                                                                                <span>{accept?.name_eng}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className={'story_accept_user_prop_buttons'}>
                                                                            <Button>{typeSelectedCharacters[accept?.id] === 'main' ? 'MC' : 'S'}</Button>
                                                                            <Button
                                                                                onClick={() => deleteAcceptUser(accept?.id)}>x</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span>Внимание! Авторы персонажей получат доступ к созданию собственных глав в Вашей истории!</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <div className={'story_accept_search'}>
                                                    <input placeholder={'Поиск персонажа...'}
                                                           value={userSearch.value}
                                                           onChange={(e) => userSearch.onChange(e)}/>
                                                </div>
                                                <div className={'story_accept_char_list'}>
                                                    {Object.values(allCharacters)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            (userSearch.value === '' ||
                                                                filter?.name_rus.toLowerCase().includes(userSearch.value.toLowerCase()) ||
                                                                filter?.name_eng.toLowerCase().includes(userSearch.value.toLowerCase())))
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            selectedUsers ?
                                                                !selectedUsers.find(selected => selected.id === filter?.id) :
                                                                true)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            allStoryCharacters ?
                                                                !allStoryCharacters.find(selected => selected.id === filter?.id) :
                                                                true)
                                                        .filter((filter: IAllCharactersInfo) =>
                                                            allCharacters ?
                                                                Object.values(allCharacters).some((find: IAllCharactersInfo) => find.id !== filter.id) :
                                                                true)
                                                        .map((user: IAllCharactersInfo, index) =>
                                                            <div className={'story_accept_user_prop'} key={index}>
                                                                <div>
                                                                    <div className={'story_accept_user_avatar'}>
                                                                        <img src={`${user?.cover}`}
                                                                             alt={'user_avatar'}/>
                                                                    </div>
                                                                    <div className={'story_accept_user_nickname'}>
                                                                        <span><strong>{user?.name_rus}</strong></span>
                                                                        <span>{user?.author}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Button onClick={() => addAcceptCharacter(user?.id, 'main')}>MC</Button>
                                                                    <Button onClick={() => addAcceptCharacter(user?.id, 'second')}>S</Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className={'story_accept_close_button'}>
                                                <Button onClick={() => setOpenCharacterList(false)}>Закрыть</Button>
                                            </div>
                                        </div>
                                        : openCharacterList &&
                                        <div className={'no_characters'}>
                                            <span>Нет ни одного персонажа...</span>
                                            <div className={'story_accept_close_button'}>
                                                <Button onClick={() => setOpenCharacterList(false)}>Закрыть</Button>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {(fileCoverUrl || filePosterUrl) &&
                                    <div className={'add_library_story_main_cover'}>
                                        {fileCoverUrl &&
                                            <div>
                                                <h4>Обложка</h4>
                                                <img
                                                    src={`${fileCoverUrl}`}
                                                    alt={'story_cover'}/>
                                            </div>
                                        }
                                        {filePosterUrl &&
                                            <div>
                                                <h4>Постер</h4>
                                                <img
                                                    src={`${filePosterUrl}`}
                                                    alt={'story_cover'}/>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <div className={'add_save_button'}>
                                <div>
                                    <Button onClick={uploadStory}
                                            disabled={inputsErrorNew || posting || coverNewError || posterNewError ||
                                                fileCoverError?.length > 0 || filePosterError?.length > 0}>Создать историю</Button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
            <NotificationComponent/>
        </div>
    )
}
export default AddLibraryStory