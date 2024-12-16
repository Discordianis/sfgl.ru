import './AddLibraryChapter.css'
import React, {useEffect, useRef, useState} from "react";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import Loading from "../../../../Loading/Loading.tsx";
import imageNF from "../../../../../../public/icons/imageNotFound.jpeg"
import Button from "../../../../Button/Button.tsx";
import useInput from "../../../../../hooks/useInput.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import HoldButton from "../../../../Button/HoldButton.tsx";

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

interface IAllStoryInfo {
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

interface IAllData {
    status: boolean,
    info: {
        chapters_edit: {
            [key: number]: IAllStoryInfo
        }
    }
}

interface ICallback {
    token: string,
    server: string
}

const AddLibraryChapter: React.FC<ICallback> = ({server, token}) => {

    const [allLibraryData, setAllLibraryData] = useState<IAllData | null>(null)
    const [currentStory, setCurrentStory] = useState<IAllStoryInfo | null>(null)
    const [currentChapter, setCurrentChapter] = useState<IAllChaptersInfo | null>(null)
    const myData = useSelector((state: RootState) => state.myData.data.info)

    const [activeStory, setActiveStory] = useState('')
    const [activeChapter, setActiveChapter] = useState('')

    const {showNotification, NotificationComponent} = useNotification()

    const [nihility, setNihility] = useState(false)
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [createNewChapter, setCreateNewChapter] = useState(false)

    const [coverError, setCoverError] = useState('')
    const [coverUrl, setCoverUrl] = useState('')

    const nameEdit = useInput('', {})
    const numberEdit = useInput('', {})
    const coverEdit = useRef<HTMLInputElement | null>(null)
    const textEdit = useInput('', {})

    const nameNew = useInput('', {})
    const numberNew = useInput('', {})
    const coverNew = useRef<HTMLInputElement | null>(null)
    const textNew = useInput('', {})

    const [editInputErrors, setEditInputErrors] = useState(false)
    const [newInputErrors, setNewInputErrors] = useState(false)

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
            }
            else {
                setAllLibraryData(dataAll)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    const getCurrentStory = (id: string) => {
        if (allLibraryData) {
            const currentStory = Object.values(allLibraryData?.info?.chapters_edit).find((find: IAllStoryInfo) => find.id === id) as IAllStoryInfo
            if (currentStory && activeStory !== currentStory?.id) {
                setCurrentStory(currentStory)
                setActiveStory(currentStory?.id)
                setCurrentChapter(null)
            }
        }
    }

    const getCurrentChapter = (id: string) => {
        if (currentStory) {
            const currentChapter = Object.values(currentStory?.chapters).find((find: IAllChaptersInfo) => find.id === id) as IAllChaptersInfo
            if (currentChapter) {
                setCurrentChapter(currentChapter)
                setActiveChapter(currentChapter?.id)
                setCreateNewChapter(false)
            }
        }
    }

    useEffect(() => {
        setCoverError('')
        setCoverUrl('')
        if (coverEdit?.current) {
            coverEdit.current.value = ''
        }
    }, [currentChapter, currentStory]);

    useEffect(() => {
        if (allLibraryData?.info?.chapters_edit && activeStory) {
            const updatedStory = Object.values(allLibraryData?.info?.chapters_edit).find(
                (find: IAllStoryInfo) => find.id === activeStory
            ) as IAllStoryInfo;

            if (updatedStory) {
                setCurrentStory(updatedStory);
            }
        }
    }, [allLibraryData, activeStory]);

    useEffect(() => {
        if (currentStory?.chapters && activeChapter) {
            const updatedChapter = Object.values(currentStory?.chapters).find(
                (find: IAllChaptersInfo) => find.id === activeChapter
            ) as IAllChaptersInfo;

            if (updatedChapter) {
                setCurrentChapter(updatedChapter);
            }
        }
    }, [currentStory, activeChapter]);

    const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files[0]

        setCoverError('')

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setCoverError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, .jpg')
            return;
        }
        if (file.size > 1024 * 1024) {
            setCoverError('Выбранный файл превышает максимально допустимый размер (1 МБ).')
            return;
        }
        const render = new FileReader()
        render.onloadend = () => {
            setCoverUrl(render.result as string)
        }
        render.readAsDataURL(file)
        console.log('Загруженный файл: ', file)
    }

    useEffect(() => {
        if (createNewChapter) {
            setCurrentChapter(null)
            setActiveChapter('')
            voidingInputs()
        }
    }, [createNewChapter]);

    useEffect(() => {
        if (currentChapter) {
            nameEdit.setValue(currentChapter?.name || '')
            numberEdit.setValue(currentChapter?.number || '')
            textEdit.setValue(currentChapter?.text || '')
        }
    }, [currentChapter]);

    const voidingInputs = () => {
        nameNew.setValue('')
        numberNew.setValue('')
        textNew.setValue('')
        if (coverNew?.current) {
            coverNew.current.value = ''
        }
        setCoverUrl('')
    }

    useEffect(() => {
        if (!nameEdit.value || !numberEdit.value || !textEdit.value) {
            setEditInputErrors(true)
        }
        else {
            setEditInputErrors(false)
        }
        if (!nameNew.value || !numberNew.value || !textNew.value) {
            setNewInputErrors(true)
        }
        else {
            setNewInputErrors(false)
        }
    }, [nameEdit.value, numberEdit.value, textEdit.value, nameNew.value, numberNew.value, textNew.value]);

    const uploadChapter = async () => {

        setPosting(true)

        if (coverError.length > 0) {
            showNotification(`${coverError}`, 'error')
            setPosting(false)
            return;
        }
        if (Number(numberEdit.value) < 0 || Number(numberNew.value) < 0) {
            showNotification('Номер главы не может быть отрицательным!', 'error')
            setPosting(false)
            return;
        }
        if (!createNewChapter && editInputErrors) {
            showNotification('Ни одно поле, кроме опционального, не может быть пустым!', 'error')
            setPosting(false)
            return;
        }
        if (createNewChapter && newInputErrors) {
            showNotification('Ни одно поле, кроме опционального, не может быть пустым!', 'error')
            setPosting(false)
            return;
        }
        if (!createNewChapter && currentChapter?.forbidden) {
            showNotification('Вы не можете изменять чужую главу!', 'error')
            setPosting(false)
            return;
        }

        const updForm = new FormData()
        const newForm = new FormData()

        const updBody = {
            token: token,
            action: 'updateChapter',
            data: {
                author: currentChapter?.author,
                name: nameEdit.value,
                number: numberEdit.value,
                text: textEdit.value
            },
            conditions: {
                id: currentChapter?.id
            }
        }
        const newBody = {
            token: token,
            action: 'insertChapter',
            data: {
                author: myData.nickname,
                name: nameNew.value,
                number: numberNew.value,
                text: textNew.value,
                story_id: currentStory?.id
            }
        }

        updForm.append('post', JSON.stringify(updBody))
        newForm.append('post', JSON.stringify(newBody))

        if (coverEdit.current && !createNewChapter) {
            updForm.append('image', coverEdit.current.files[0])
        }
        if (coverNew.current && createNewChapter) {
            newForm.append('image', coverNew.current.files[0])
        }

        const handleUpdateData = async () => {
            const resAll = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({ token: token, action: 'getAllForEditLibrary' })
            });
            const dataAll = await resAll.json();

            if (!dataAll?.status) {
                console.log(dataAll?.info);
                showNotification('Упс, что-то пошло не так...', 'error');
                setPosting(false);
            } else {
                setAllLibraryData(dataAll);

                if (activeStory) {
                    setActiveStory(null); // Сбрасываем
                    setTimeout(() => setActiveStory(dataAll.info?.chapters_edit?.[0]?.id || activeStory), 0);
                }

                showNotification('Данные обновлены', 'success');
                setPosting(false);
            }
        };

        if (!createNewChapter) {
            const res = await fetch(server, {
                method: 'POST',
                body: updForm
            })
            const data = await res.json()
            if (!data?.status) {
                if (data?.info.startsWith('Data too long')) {
                    showNotification('Слишком длинный текст. Пожалуйста, сократите его или разбейте на дополнительные главы', 'error');
                }
                else {
                    showNotification('Упс, что-то пошло не так...', 'error');
                }
                setPosting(false)
                console.log(data?.info)
            }
            else {
                await handleUpdateData()
                showNotification('Данные обновлены', "success")
                setPosting(false)
            }
        }
        if (createNewChapter) {
            const res = await fetch(server, {
                method: 'POST',
                body: newForm
            })
            const data = await res.json()
            if (!data?.status) {
                if (data?.info.startsWith('Data too long')) {
                    showNotification('Слишком длинный текст. Пожалуйста, сократите его или разбейте на дополнительные главы', 'error');
                }
                else {
                    showNotification('Упс, что-то пошло не так...', 'error');
                }
                setPosting(false)
                console.log(data?.info)
            }
            else {
                await handleUpdateData()
                voidingInputs()
                showNotification('Данные обновлены', "success")
                setPosting(false)
            }
        }
    }

    const deleteChapter = async (id: string) => {
        setPosting(true)
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteChapter', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data?.status) {
            showNotification('Упс, что-то пошло не так...', 'error')
            setPosting(false)
            console.log(data?.info)
        }
        else {
            const resAll = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllForEditLibrary'})
            })
            const dataAll = await resAll.json()

            if (!dataAll?.status) {
                console.log(dataAll?.info)
                showNotification('Упс, что-то пошло не так...', "error")
                setPosting(false)
            }
            else {
                setAllLibraryData(dataAll)
                setCurrentChapter(null)
                setNihility(false)
                showNotification('Глава отправлена в Небытие', "success")
                setPosting(false)
            }
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'add_library_chapter_root'}>
            {(allLibraryData?.info && allLibraryData?.info?.chapters_edit) ?
                <div>
                    <div>
                        <div className={'add_library_chapter_header'}>
                            <div className={'decorated_title'}>
                                <h3>Список историй</h3>
                            </div>
                            <div className={'add_library_story_list'}>
                                {Object.values(allLibraryData?.info?.chapters_edit).map((story: IAllStoryInfo, index) =>
                                    <div key={index}
                                         className={`add_library_story_prop ${activeStory === story.id ? 'active' : ''}`}
                                         onClick={() => getCurrentStory(story?.id)}>
                                        <div>
                                            <img src={`${story?.cover ? story?.cover : imageNF}`} alt={'story_img'}/>
                                        </div>
                                        <div className={'add_library_story_prop_title'}>
                                            {story?.name_rus &&
                                                <span style={{lineHeight: '1.2'}}><strong>{story?.name_rus}</strong></span>
                                            }
                                            {story?.name_eng &&
                                                <span style={{lineHeight: '1.2'}}>{story?.name_eng}</span>
                                            }
                                            {story?.author &&
                                                <span style={{fontSize: '14px', color: '#bea57e'}}><i><strong>Автор: {story?.author}</strong></i></span>
                                            }
                                            {!story?.name_rus && !story?.name_eng &&
                                                <span><strong>Безымянная история</strong></span>
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {(currentStory?.chapters) ?
                            <div className={'add_library_chapter_subheader'}>
                                <div className={'decorated_title'}>
                                    <h3>Список глав</h3>
                                </div>
                                <div className={'add_library_chapters_list'}>
                                    <div>
                                        <div>
                                            {Object.values(currentStory.chapters).map((chapter: IAllChaptersInfo, index) =>
                                                <div key={index}
                                                     className={`add_library_chapter_prop ${activeChapter === chapter.id ? 'active' : ''}`}
                                                     onClick={() => getCurrentChapter(chapter?.id)}>
                                                    <div className={'add_library_chapter_prop_title'}>
                                                        {(chapter?.number) ?
                                                            <Button onClick={() => getCurrentChapter(chapter?.id)}
                                                                    style={{color: chapter?.forbidden ? '#656565' : ''}}>
                                                                <strong>Глава {chapter?.number}</strong>
                                                            </Button>
                                                            :
                                                            <Button onClick={() => getCurrentChapter(chapter?.id)}
                                                                    style={{color: chapter?.forbidden ? '#656565' : ''}}>
                                                                Глава ???
                                                            </Button>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span>Главы, которые вы можете только просматривать, помечены серым цветом.</span>
                                    </div>
                                    <div>
                                        {(!createNewChapter && currentStory?.chapters) &&
                                            <Button onClick={() => setCreateNewChapter(true)}>Создать главу</Button>}
                                    </div>
                                </div>
                            </div>
                            : currentStory &&
                            <div className={'add_first_chapter'}>
                                <span>Нет ни одной главы для этой истории...</span>
                                <Button onClick={() => setCreateNewChapter(true)}>Создать первую главу</Button>
                            </div>
                        }
                        {(!createNewChapter && currentChapter) &&
                            <div className={'add_library_chapter_main'}>
                                <div className={'decorated_title'}>
                                    <h3>Изменение главы</h3>
                                </div>
                                <div className={'add_library_chapter_inputs'}>
                                    <div>
                                        <label>Название главы:
                                            <input type={'text'} value={nameEdit.value}
                                                   onChange={(e) => nameEdit.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Номер главы:
                                            <input type={'number'} value={numberEdit.value} min={0}
                                                   onChange={(e) => numberEdit.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Изображение для главы (опционально):
                                            <input type={'file'} onChange={handleCover} ref={coverEdit}/>
                                        </label>
                                        {coverError && <span style={{color:'#f75151', fontSize: '13px'}}>{coverError}</span>}
                                    </div>
                                    <div className={'textarea_span'}>
                                        <span>Текст главы:</span>
                                        <textarea rows={30} value={textEdit.value}
                                                  onChange={(e) => textEdit.onChange(e)}
                                        />
                                        <div className={'hints_html'}>
                                            <div className={'hints_html_first'}>
                                                <span>Подсказки:</span>
                                            </div>
                                            <div className={'hints_html_second'}>
                                                <span>Спойлер - [spoiler]текст[/spoiler]</span>
                                                <span>Блок - [div style="..."]элемент[/div]</span>
                                                <span>Жирность - &lt;b&gt;текст&lt;/b&gt;</span>
                                                <span>Курсив - &lt;i&gt;текст&lt;/i&gt;</span>
                                                <span>Нижнее подчёркивание - &lt;u&gt;текст&lt;/u&gt;</span>
                                                <span>Зачёркивание - &lt;s&gt;текст&lt;/s&gt;</span>
                                                <span>Цвет текста - &lt;font color="red или #00FF00 или rgb(0,0,255)"&gt;текст&lt;/font&gt;</span>
                                                <span>Изображение - &lt;img src="ссылка.jpg" /&gt;</span>
                                            </div>
                                        </div>
                                    </div>
                                    {(currentChapter?.image || coverUrl) &&
                                        <div className={'add_library_chapter_image'}>
                                            <div>
                                            <h4>Изображение для главы</h4>
                                                <img
                                                    src={coverUrl ? coverUrl : currentChapter?.image ? currentChapter?.image : imageNF}
                                                    alt={'chapter_image'}
                                                />
                                                <span>Изображение будет отображаться в конце главы.</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {!currentChapter?.forbidden &&
                                    <div className={'add_library_chapter_buttons'}>
                                        <div className={'delete_buttons_root'}>
                                            {!nihility ?
                                                <Button style={{color: '#b34949'}} onClick={() => setNihility(true)}>Функция Небытия...</Button>
                                                :
                                                <>
                                                    <Button onClick={() => setNihility(false)}>Отмена</Button>
                                                    <HoldButton onClick={() => deleteChapter(currentChapter?.id)}>Удалить главу</HoldButton>
                                                </>
                                            }
                                        </div>
                                        <div className={'add_save_button'}>
                                            <Button onClick={uploadChapter}
                                                    disabled={coverError.length > 0 || editInputErrors || posting || Number(numberEdit.value) < 0}>
                                                Сохранить изменения
                                            </Button>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                        {(createNewChapter) &&
                            <div className={'add_library_chapter_main'}>
                                <div className={'decorated_title'}>
                                    <h3>Создание главы</h3>
                                </div>
                                <div className={'add_library_chapter_inputs'}>
                                    <div>
                                        <label>Название главы:
                                            <input type={'text'} value={nameNew.value}
                                                   onChange={(e) => nameNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Номер главы:
                                            <input type={'number'} value={numberNew.value} min={0}
                                                   onChange={(e) => numberNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Изображение для главы (опционально):
                                            <input type={'file'} onChange={handleCover} ref={coverNew}/>
                                        </label>
                                        {coverError && <span style={{color:'#f75151', fontSize: '13px'}}>{coverError}</span>}
                                    </div>
                                    <div className={'textarea_span'}>
                                        <span>Текст главы:</span>
                                        <textarea rows={30} value={textNew.value}
                                                  onChange={(e) => textNew.onChange(e)}
                                        />
                                        <div className={'hints_html'}>
                                            <div className={'hints_html_first'}>
                                                <span>Подсказки:</span>
                                            </div>
                                            <div className={'hints_html_second'}>
                                                <span>Жирность - &lt;b&gt;текст&lt;/b&gt;</span>
                                                <span>Курсив - &lt;i&gt;текст&lt;/i&gt;</span>
                                                <span>Нижнее подчёркивание - &lt;u&gt;текст&lt;/u&gt;</span>
                                                <span>Зачёркивание - &lt;s&gt;текст&lt;/s&gt;</span>
                                                <span>Цвет текста - &lt;font color="red или #00FF00 или rgb(0,0,255)"&gt;текст&lt;/font&gt;</span>
                                                <span>Изображение - &lt;img src="ссылка.jpg" /&gt;</span>
                                            </div>
                                        </div>
                                    </div>
                                    {(coverUrl) &&
                                        <div className={'add_library_chapter_image'}>
                                            <div>
                                                <h4>Изображение для главы</h4>
                                                <img
                                                    src={coverUrl}
                                                    alt={'chapter_image'}
                                                />
                                                <span>Изображение будет отображаться в конце главы.</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className={'add_save_button'}>
                                    <Button onClick={uploadChapter}
                                            disabled={coverError.length > 0 || newInputErrors || posting || Number(numberNew.value) < 0}>
                                        Создать главу
                                    </Button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                :
                <div>
                    {!createNewChapter ?
                        <div className={'add_first_chapter'}>
                            <span>Нет ни одной главы...</span>
                            <Button onClick={() => setCreateNewChapter(true)}>Создать первую главу</Button>
                        </div>
                        : allLibraryData?.info?.chapters_edit ?
                        <div className={'add_library_chapter_main'}>
                            <div className={'decorated_title'}>
                                <h3>Создание главы</h3>
                            </div>
                            <div className={'add_library_chapter_inputs'}>
                                <div>
                                    <label>Название главы:
                                        <input type={'text'} value={nameNew.value}
                                               onChange={(e) => nameNew.onChange(e)}/>
                                    </label>
                                </div>
                                <div>
                                    <label>Номер главы:
                                        <input type={'number'} value={numberNew.value} min={0}
                                               onChange={(e) => numberNew.onChange(e)}/>
                                    </label>
                                </div>
                                <div>
                                    <label>Изображение для главы (опционально):
                                        <input type={'file'} onChange={handleCover} ref={coverNew}/>
                                    </label>
                                    {coverError && <span style={{color:'#f75151', fontSize: '13px'}}>{coverError}</span>}
                                </div>
                                <div className={'textarea_span'}>
                                    <span>Текст главы:</span>
                                    <textarea rows={30} value={textNew.value}
                                              onChange={(e) => textNew.onChange(e)}/>
                                </div>
                                <div className={'hints_html'}>
                                    <div className={'hints_html_first'}>
                                        <span>Подсказки:</span>
                                    </div>
                                    <div className={'hints_html_second'}>
                                        <span>Жирность - &lt;b&gt;текст&lt;/b&gt;</span>
                                        <span>Курсив - &lt;i&gt;текст&lt;/i&gt;</span>
                                        <span>Нижнее подчёркивание - &lt;u&gt;текст&lt;/u&gt;</span>
                                        <span>Зачёркивание - &lt;s&gt;текст&lt;/s&gt;</span>
                                        <span>Цвет текста - &lt;font color="red или #00FF00 или rgb(0,0,255)"&gt;текст&lt;/font&gt;</span>
                                        <span>Изображение - &lt;img src="ссылка.jpg" /&gt;</span>
                                    </div>
                                </div>
                                {(coverUrl) &&
                                    <div className={'add_library_chapter_image'}>
                                        <div>
                                            <h4>Изображение для главы</h4>
                                            <img
                                                src={coverUrl}
                                                alt={'chapter_image'}
                                            />
                                            <span>Изображение будет отображаться в конце главы.</span>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className={'add_save_button'}>
                                <Button onClick={uploadChapter}
                                        disabled={coverError.length > 0 || newInputErrors || posting || Number(numberNew.value) < 0}>
                                    Создать главу
                                </Button>
                            </div>
                        </div>
                            :
                            <div style={{textAlign: 'center'}} className={'add_first_chapter_no_story'}>
                                <span>Нет ни одной истории, в которой вы бы смогли написать главу...</span>
                                <Button onClick={() => setCreateNewChapter(false)}>Закрыть</Button>
                            </div>
                    }
                </div>
            }
            <NotificationComponent/>
        </div>
    )
}
export default AddLibraryChapter