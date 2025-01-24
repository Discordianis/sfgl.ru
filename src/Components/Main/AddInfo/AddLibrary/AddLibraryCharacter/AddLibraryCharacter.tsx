import './AddLibraryCharacter.css'
import React, {useEffect, useRef, useState} from "react";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../redux";
import imageNF from '../../../../../../public/icons/imageNotFound.jpeg'
import Button from "../../../../Button/Button.tsx";
import HoldButton from "../../../../Button/HoldButton.tsx";
import useInput from "../../../../../hooks/useInput.tsx";
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

interface IAllData {
    status: boolean,
    info: {
        characters_edit: {
            [key: number]: IAllCharactersInfo
        }
    }
}

interface ICallback {
    token: string,
    server: string
}

const AddLibraryCharacter: React.FC<ICallback> = ({server, token}) => {

    const [allCharactersData, setAllCharactersData] = useState<IAllData | null>(null)
    const [currentCharacter, setCurrentCharacter] = useState<IAllCharactersInfo | null>(null)
    const myData = useSelector((state: RootState) => state.myData)

    const [activeCharacter, setActiveCharacter] = useState('')
    const [createNewCharacter, setCreateNewCharacter] = useState(false)
    const [nihility, setNihility] = useState(false)
    const [posting, setPosting] = useState(false)
    const [loading, setLoading] = useState(true)

    const rusNameEdit = useInput('', {})
    const engNameEdit = useInput('', {})
    const [statusEdit, setStatusEdit] = useState<'lively' | 'dead' | 'unknown' | string>('lively')
    const birthdayEdit = useInput('', {})
    const ageEdit = useInput('', {})
    const heigthEdit = useInput('', {})
    const characterCoverEdit = useRef<HTMLInputElement | null>(null)
    const seyuNameEdit = useInput('', {})
    const seyuCoverEdit = useRef<HTMLInputElement | null>(null)
    const characterVoiceNameEdit = useInput('', {})
    const characterVoiceCoverEdit = useRef<HTMLInputElement | null>(null)
    const descriptionEdit = useInput('', {})

    const rusNameNew = useInput('', {})
    const engNameNew = useInput('', {})
    const [statusNew, setStatusNew] = useState<'lively' | 'dead' | 'unknown' | string>('lively')
    const birthdayNew = useInput('', {})
    const ageNew = useInput('', {})
    const heigthNew = useInput('', {})
    const characterCoverNew = useRef<HTMLInputElement | null>(null)
    const seyuNameNew = useInput('', {})
    const seyuCoverNew = useRef<HTMLInputElement | null>(null)
    const characterVoiceNameNew = useInput('', {})
    const characterVoiceCoverNew = useRef<HTMLInputElement | null>(null)
    const descriptionNew = useInput('', {})

    const [fileCharacterCoverError ,setFileCharacterCoverError] = useState('')
    const [fileVoiceCharacterCoverError ,setFileVoiceCharacterCoverError] = useState('')
    const [fileVoiceActorCoverError ,setFileVoiceActorCoverError] = useState('')

    const [fileCharacterCoverUrl ,setFileCharacterCoverUrl] = useState<string | null>(null)
    const [fileVoiceCharacterCoverUrl ,setFileVoiceCharacterCoverUrl] = useState('')
    const [fileVoiceActorCoverUrl ,setFileVoiceActorCoverUrl] = useState('')

    const {showNotification, NotificationComponent} = useNotification()

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
                setAllCharactersData(dataAll)
                setLoading(false)
            }
        }
        fetching().then()
    }, [server, token]);

    useEffect(() => {
        if (createNewCharacter) {
            setActiveCharacter(null)
            setCurrentCharacter(null)
            setFileCharacterCoverError('')
            setFileVoiceActorCoverError('')
            setFileVoiceCharacterCoverError('')
        }
    }, [createNewCharacter]);

    useEffect(() => {
        if (currentCharacter) {
            rusNameEdit.setValue(currentCharacter?.name_rus || '')
            engNameEdit.setValue(currentCharacter?.name_eng || '')
            setStatusEdit(currentCharacter?.life_status || 'lively')
            birthdayEdit.setValue(currentCharacter?.birthday || '')
            ageEdit.setValue(currentCharacter?.age || '')
            heigthEdit.setValue(currentCharacter?.height || '')
            seyuNameEdit.setValue(currentCharacter?.va_name || '')
            characterVoiceNameEdit.setValue(currentCharacter?.va_char_name || '')
            descriptionEdit.setValue(currentCharacter?.description || '')
        }
    }, [currentCharacter]);

    const voidingInputs = () => {
        rusNameNew.setValue('')
        engNameNew.setValue('')
        setStatusNew('lively')
        birthdayNew.setValue('')
        ageNew.setValue('')
        heigthNew.setValue('')
        seyuNameNew.setValue('')
        characterVoiceNameNew.setValue('')
        descriptionNew.setValue('')
        if (characterCoverNew?.current) {
            characterCoverNew.current.value = ''
        }
        if (characterVoiceCoverNew?.current) {
            characterVoiceCoverNew.current.value = ''
        }
        if (seyuCoverNew?.current) {
            seyuCoverNew.current.value = ''
        }
    }

    const getCharacterById = (id: string) => {
        const currentChar = Object.values(allCharactersData?.info?.characters_edit).find(find => find?.id === id) as IAllCharactersInfo
        if (currentChar) {
            setCurrentCharacter(currentChar)
            setActiveCharacter(currentChar?.id)
            setCreateNewCharacter(false)
        }
    }

    useEffect(() => {
        setFileCharacterCoverError('')
        setFileVoiceActorCoverError('')
        setFileVoiceCharacterCoverError('')
        setFileCharacterCoverUrl('')
        setFileVoiceActorCoverUrl('')
        setFileVoiceCharacterCoverUrl('')
        if (characterCoverEdit?.current) {
            characterCoverEdit.current.value = ''
        }
        if (characterVoiceCoverEdit?.current) {
            characterVoiceCoverEdit.current.value = ''
        }
        if (seyuCoverEdit?.current) {
            seyuCoverEdit.current.value = ''
        }
    }, [currentCharacter]);

    const handleCharacterCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileCharacterCoverError('');

        if (!file) {
            console.log('Файл не выбран');
            return;
        }

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setFileCharacterCoverError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, .jpg.');
            return;
        }

        if (file.size > 1024 * 1024) {
            setFileCharacterCoverError('Выбранный файл превышает максимально допустимый размер (1 МБ).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            console.log('Файл успешно прочитан');
            setFileCharacterCoverUrl(reader.result as string);
        };

        reader.onerror = () => {
            console.error('Ошибка при чтении файла');
            setFileCharacterCoverError('Ошибка при загрузке файла. Попробуйте снова.');
        };

        reader.readAsDataURL(file);
        console.log('Загруженный файл:', file);
    }
    const handleVoiceCharacterCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFileVoiceCharacterCoverError('')

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setFileVoiceCharacterCoverError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, .jpg');
            return;
        }
        if (file.size > 1024 * 1024) {
            setFileVoiceCharacterCoverError('Выбранный файл превышает максимально допустимый размер (1 МБ).');
            return;
        }
        const render = new FileReader()
        render.onloadend = () => {
            setFileVoiceCharacterCoverUrl(render.result as string)
        }
        render.readAsDataURL(file)
        console.log('Загруженный файл:', file);
    }
    const handleVoiceActorCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFileVoiceActorCoverError('')

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setFileVoiceActorCoverError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, .jpg');
            return;
        }
        if (file.size > 1024 * 1024) {
            setFileVoiceActorCoverError('Выбранный файл превышает максимально допустимый размер (1 МБ).');
            return;
        }
        const render = new FileReader()
        render.onloadend = () => {
            setFileVoiceActorCoverUrl(render.result as string)
        }
        render.readAsDataURL(file)
        console.log('Загруженный файл:', file);
    }

    const uploadCharacter = async (e: React.FormEvent) => {
        e.preventDefault()

        setPosting(true)

        if (!createNewCharacter && (!rusNameEdit.value && !engNameEdit.value)) {
            showNotification('У персонажа должно быть имя!', 'error')
            setPosting(false)
            return;
        }
        if (createNewCharacter && (!rusNameNew.value && !rusNameNew.value)) {
            showNotification('У персонажа должно быть имя!', 'error')
            setPosting(false)
            return;
        }

        if (fileCharacterCoverError.length > 0) {
            showNotification(`${fileCharacterCoverError}`, 'error')
            setPosting(false)
            return;
        }
        if (fileVoiceActorCoverError.length > 0) {
            showNotification(`${fileVoiceActorCoverError}`, 'error')
            setPosting(false)
            return;
        }
        if (fileVoiceCharacterCoverError.length > 0) {
            showNotification(`${fileVoiceCharacterCoverError}`, 'error')
            setPosting(false)
            return;
        }

        if (Number(heigthEdit.value) < 0 || Number(heigthNew.value) < 0) {
            showNotification('Рост персонажа не может быть отрицательным!', 'error')
            setPosting(false)
            return;
        }
        if (Number(ageEdit.value) < 0 || Number(ageEdit.value) < 0) {
            showNotification('Возраст персонажа не может быть отрицательным!', 'error')
            setPosting(false)
            return;
        }

        const updForm = new FormData()
        const newForm = new FormData()

        if (characterCoverEdit?.current?.files[0] && !createNewCharacter) {
            updForm.append('cover', characterCoverEdit?.current?.files[0])
        }
        if (seyuCoverEdit?.current?.files[0] && !createNewCharacter) {
            updForm.append('va_avatar', seyuCoverEdit?.current?.files[0])
        }
        if (characterVoiceCoverEdit?.current?.files[0] && !createNewCharacter) {
            updForm.append('va_char_avatar', characterVoiceCoverEdit?.current?.files[0])
        }

        if (characterCoverNew?.current?.files[0] && createNewCharacter) {
            newForm.append('cover', characterCoverNew?.current?.files[0])
        }
        if (seyuCoverNew?.current?.files[0] && createNewCharacter) {
            newForm.append('va_avatar', seyuCoverNew?.current?.files[0])
        }
        if (characterVoiceCoverNew?.current?.files[0] && createNewCharacter) {
            newForm.append('va_char_avatar', characterVoiceCoverNew?.current?.files[0])
        }

        const updBody = {
            token: token,
            action: 'updateCharacter',
            data: {
                age: ageEdit.value,
                author: currentCharacter?.author,
                birthday: birthdayEdit.value,
                description: descriptionEdit.value,
                height: heigthEdit.value,
                life_status: statusEdit,
                name_eng: engNameEdit.value,
                name_rus: rusNameEdit.value,
                va_char_name: characterVoiceNameEdit.value,
                va_name: seyuNameEdit.value
            },
            conditions: {id: currentCharacter?.id}
        }

        const newBody = {
            token: token,
            action: 'insertCharacter',
            data: {
                age: ageNew.value,
                author: currentCharacter?.author,
                birthday: birthdayNew.value,
                description: descriptionNew.value,
                height: heigthNew.value,
                life_status: statusNew,
                name_eng: engNameNew.value,
                name_rus: rusNameNew.value,
                va_char_name: characterVoiceNameNew.value,
                va_name: seyuNameNew.value
            },
            conditions: {id: currentCharacter?.id}
        }

        updForm.append('post', JSON.stringify(updBody))
        newForm.append('post', JSON.stringify(newBody))

        if (!createNewCharacter) {
            const res = await fetch(server, {
                method: 'POST',
                body: updForm
            })
            const data = await res.json()
            if (!data?.status) {
                setPosting(false)
                showNotification('Упс, что-то пошло не так...', 'error')
                console.log(data?.info)
            }
            else {
                setPosting(false)
                showNotification('Данные обновлены', 'success')
            }
        }
        if (createNewCharacter) {
            const res = await fetch(server, {
                method: 'POST',
                body: newForm
            })
            const data = await res.json()
            if (!data?.status) {
                setPosting(false)
                showNotification('Упс, что-то пошло не так...', 'error')
                console.log(data?.info)
            }
            else {
                setPosting(false)
                voidingInputs()
                showNotification('Персонаж успешно создан', 'success')
            }
        }
        const resAll = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'getAllForEditLibrary'})
        })
        const dataAll = await resAll.json()
        if (!dataAll?.status) {
            setPosting(false)
            showNotification('Упс, при получении данных что-то пошло не так...', 'error')
            console.log(dataAll?.info)
        }
        else {
            setAllCharactersData(dataAll)
            setPosting(false)
        }
        setPosting(false)
    }

    const deleteCharacter = async (id: string) => {
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteCharacter', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data?.status) {
            setPosting(false)
            showNotification('Упс, что-то пошло не так...', 'error')
            console.log(data?.info)
        }
        else {
            setPosting(false)
            setCurrentCharacter(null)
            setActiveCharacter(null)
            setNihility(false)
            showNotification('Персонаж был отправлен в Небытие', 'success')
        }
        const resAll = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'getAllForEditLibrary'})
        })
        const dataAll = await resAll.json()
        if (!dataAll?.status) {
            setPosting(false)
            showNotification('Упс, при получении данных что-то пошло не так...', 'error')
            console.log(dataAll?.info)
        }
        else {
            setAllCharactersData(dataAll)
            setPosting(false)
        }
    }

    const filteredCharacters = allCharactersData?.info?.characters_edit
        ? Object.values(allCharactersData.info.characters_edit)
            .filter(filter => filter.author === myData?.data?.info?.nickname)
            .sort((a,b) => a.name_rus.localeCompare(b.name_rus, 'ru'))
        : [];

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'add_library_character_root'}>
            {allCharactersData?.info ?
                <div>
                    <div className={'add_character_top'}>
                        <div className={'add_character_top_title'}>
                            <h3>Список персонажей</h3>
                        </div>
                        {(allCharactersData?.info?.characters_edit) &&
                            <div className={'add_character_top_list'}>
                                {filteredCharacters.length === 0 ? (
                                    <div>
                                        <span>Сейчас нет ни одного персонажа...</span>
                                    </div>
                                ) : (
                                    filteredCharacters.map((character: IAllCharactersInfo, index) => (
                                        <div
                                            className={`add_character_top_list_prop ${activeCharacter === character?.id ? 'active' : ''}`}
                                            key={index}
                                            onClick={() => getCharacterById(character?.id)}
                                        >
                                            <div>
                                                <img src={`${character?.cover ? character?.cover : imageNF}`} alt={'character_cover'} />
                                            </div>
                                            <div>
                                                <span>{character?.name_rus || character?.name_eng || 'Безымянный'}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        }
                        {!createNewCharacter &&
                            <Button onClick={() => setCreateNewCharacter(true)}>Создать персонажа</Button>
                        }
                    </div>
                    {(currentCharacter && !createNewCharacter) &&
                        <div className={'add_character_bottom'}>
                            <div className={'add_character_bottom_title'}>
                                <h3>Изменение персонажа</h3>
                            </div>
                            <div className={'add_character_bottom_commonva'}>
                                <div className={'add_character_bottom_common'}>
                                    <div className={'add_character_bottom_inputs'}>
                                        <div>
                                            <label>Имя персонажа(рус.):
                                                <input type={'text'} value={rusNameEdit.value} onChange={(e) => rusNameEdit.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Имя персонажа(англ.):
                                                <input type={'text'} value={engNameEdit.value} onChange={(e) => engNameEdit.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div className={'filter_buttons'}>
                                            <span>Статус:</span>
                                            <select value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)}>
                                                <option value={'lively'}>Жив(-а)</option>
                                                <option value={'dead'}>Мертв(-а)</option>
                                                <option value={'unknown'}>Неизвестно</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Дата рождения:
                                                <input type={"date"} value={birthdayEdit.value} onChange={(e) => birthdayEdit.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Возраст в годах:
                                                <input type={"number"} min={0} value={ageEdit.value} onChange={(e) => ageEdit.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Рост в см:
                                                <input type={"number"} min={0} value={heigthEdit.value} onChange={(e) => heigthEdit.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Обложка (4:3):
                                                <input type={"file"} accept={'.jpg, .jpeg, .png'}
                                                onChange={handleCharacterCoverChange} ref={characterCoverEdit}/>
                                            </label>
                                            {fileCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileCharacterCoverError}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={'add_character_bottom_va'}>
                                    <div>
                                        <label>Имя сэйю:
                                            <input type={'text'} value={seyuNameEdit.value} onChange={(e) => seyuNameEdit.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка сэйю (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                            onChange={handleVoiceActorCoverChange} ref={seyuCoverEdit}/>
                                        </label>
                                        {fileVoiceActorCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceActorCoverError}</span>}
                                    </div>
                                    <div>
                                        <label>Имя персонажа озвучки:
                                            <input type={'text'} value={characterVoiceNameEdit.value} onChange={(e) => characterVoiceNameEdit.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка персонажа озвучки (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                            onChange={handleVoiceCharacterCoverChange} ref={characterVoiceCoverEdit}/>
                                        </label>
                                        {fileVoiceCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceCharacterCoverError}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={'textarea_span'}>
                                <label>Описание персонажа:
                                    <textarea rows={10} value={descriptionEdit.value}
                                              onChange={(e) => descriptionEdit.onChange(e)}/>
                                </label>
                                <div className={'hints_html'}>
                                    <div className={'hints_html_first'}>
                                        <span>Подсказки:</span>
                                    </div>
                                    <div className={'hints_html_second'}>
                                        <span>Спойлер - [spoiler]текст[/spoiler]</span>
                                        <span>Блок - [div style="..."]элемент[/div]</span>
                                        <span>Жирность - &lt;b&gt;текст&lt;/b&gt;</span>
                                        <span>Курсив - &lt;i&gt;текст&lt;/i&gt;</span>
                                        <span>Ссылка - &lt;a href="ссылка"&gt;текст&lt;/a&gt;</span>
                                        <span>Нижнее подчёркивание - &lt;u&gt;текст&lt;/u&gt;</span>
                                        <span>Зачёркивание - &lt;s&gt;текст&lt;/s&gt;</span>
                                        <span>Цвет текста - &lt;font color="red или #00FF00 или rgb(0,0,255)"&gt;текст&lt;/font&gt;</span>
                                        <span>Изображение - &lt;img src="ссылка.jpg" /&gt;</span>
                                    </div>
                                </div>
                            </div>
                            <div className={'add_character_bottom_va_covers'}>
                                {(fileCharacterCoverUrl || currentCharacter?.cover) &&
                                    <div>
                                        <span>Обложка персонажа</span>
                                        <img
                                            src={`${fileCharacterCoverUrl ? fileCharacterCoverUrl : currentCharacter?.cover ? currentCharacter?.cover : imageNF}`}
                                            alt={'character_cover'}
                                        />
                                    </div>
                                }
                                {(currentCharacter?.va_avatar || fileVoiceActorCoverUrl) &&
                                    <div>
                                        <span>Обложка сэйю</span>
                                        <img
                                            src={`${fileVoiceActorCoverUrl ? fileVoiceActorCoverUrl : currentCharacter?.va_avatar ? currentCharacter?.va_avatar : imageNF}`}
                                            alt={'seyu_cover'}
                                        />
                                    </div>
                                }
                                {(currentCharacter?.va_char_avatar || fileVoiceCharacterCoverUrl) &&
                                    <div>
                                        <span>Обложка персонажа озвучки</span>
                                        <img
                                            src={`${fileVoiceCharacterCoverUrl ? fileVoiceCharacterCoverUrl : currentCharacter?.va_char_avatar ? currentCharacter?.va_char_avatar : imageNF}`}
                                            alt={'voice_character_cover'}
                                        />
                                    </div>
                                }
                            </div>
                            <div className={'add_characters_buttons'}>
                                <div className={'delete_buttons_root'}>
                                    {!nihility ?
                                        <Button style={{color: '#b34949'}} onClick={() => setNihility(true)}>Функция Небытия...</Button>
                                        :
                                        <>
                                            <Button onClick={() => setNihility(false)}>Отмена</Button>
                                            <HoldButton onClick={() => deleteCharacter(currentCharacter?.id)}>Удалить персонажа</HoldButton>
                                        </>
                                    }
                                </div>
                                <div className={'add_save_button'}>
                                    <Button
                                        disabled={posting || fileCharacterCoverError.length > 0 || fileVoiceActorCoverError.length > 0 ||
                                            fileVoiceCharacterCoverError.length > 0 || (!rusNameEdit.value && !engNameEdit.value) || Number(ageEdit.value) < 0 ||
                                            Number(heigthEdit.value) < 0} onClick={uploadCharacter}>
                                        Сохранить изменения
                                    </Button>
                                </div>
                            </div>
                        </div>
                    }
                    {createNewCharacter &&
                        <div className={'add_character_bottom'}>
                            <div className={'add_character_bottom_title'}>
                                <h3>Создание персонажа</h3>
                            </div>
                            <div className={'add_character_bottom_commonva'}>
                                <div className={'add_character_bottom_common'}>
                                    <div className={'add_character_bottom_inputs'}>
                                        <div>
                                            <label>Имя персонажа(рус.):
                                                <input type={'text'} value={rusNameNew.value} onChange={(e) => rusNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Имя персонажа(англ.):
                                                <input type={'text'} value={engNameNew.value} onChange={(e) => engNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div className={'filter_buttons'}>
                                            <span>Статус:</span>
                                            <select value={statusNew} onChange={(e) => setStatusNew(e.target.value)}>
                                                <option value={'lively'}>Жив(-а)</option>
                                                <option value={'dead'}>Мертв(-а)</option>
                                                <option value={'unknown'}>Неизвестно</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Дата рождения:
                                                <input type={"date"} value={birthdayNew.value} onChange={(e) => birthdayNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Возраст в годах:
                                                <input type={"number"} min={0} value={ageNew.value} onChange={(e) => ageNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Рост в см:
                                                <input type={"number"} min={0} value={heigthNew.value} onChange={(e) => heigthNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Обложка (4:3):
                                                <input type={"file"} accept={'.jpg, .jpeg, .png'}
                                                       onChange={handleCharacterCoverChange} ref={characterCoverNew}/>
                                            </label>
                                            {fileCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileCharacterCoverError}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={'add_character_bottom_va'}>
                                    <div>
                                        <label>Имя сэйю:
                                            <input type={'text'} value={seyuNameNew.value} onChange={(e) => seyuNameNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка сэйю (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                                   onChange={handleVoiceActorCoverChange} ref={seyuCoverNew}/>
                                        </label>
                                        {fileVoiceActorCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceActorCoverError}</span>}
                                    </div>
                                    <div>
                                        <label>Имя персонажа озвучки:
                                            <input type={'text'} value={characterVoiceNameNew.value} onChange={(e) => characterVoiceNameNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка персонажа озвучки (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                                   onChange={handleVoiceCharacterCoverChange} ref={characterVoiceCoverNew}/>
                                        </label>
                                        {fileVoiceCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceCharacterCoverError}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={'textarea_span'}>
                                <label>Описание персонажа:
                                    <textarea rows={10} value={descriptionNew.value}
                                              onChange={(e) => descriptionNew.onChange(e)}/>
                                </label>
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
                            <div className={'add_character_bottom_va_covers'}>
                                {(fileCharacterCoverUrl) &&
                                    <div>
                                        <span>Обложка персонажа</span>
                                        <img
                                            src={`${fileCharacterCoverUrl}`}
                                            alt={'character_cover'}
                                        />
                                    </div>
                                }
                                {(fileVoiceActorCoverUrl) &&
                                    <div>
                                        <span>Обложка сэйю</span>
                                        <img
                                            src={`${fileVoiceActorCoverUrl}`}
                                            alt={'seyu_cover'}
                                        />
                                    </div>
                                }
                                {(fileVoiceCharacterCoverUrl) &&
                                    <div>
                                    <span>Обложка персонажа озвучки</span>
                                        <img
                                            src={`${fileVoiceCharacterCoverUrl}`}
                                            alt={'voice_character_cover'}
                                        />
                                    </div>
                                }
                            </div>
                            <div className={'add_save_button'}>
                                <div>
                                    <Button
                                        disabled={posting || fileCharacterCoverError.length > 0 || fileVoiceActorCoverError.length > 0 ||
                                            fileVoiceCharacterCoverError.length > 0 || (!rusNameNew.value && !engNameNew.value) || Number(ageNew.value) < 0 ||
                                            Number(heigthNew.value) < 0} onClick={uploadCharacter}>
                                        Создать персонажа
                                    </Button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                :
                <div>
                    {!createNewCharacter ?
                        <div className={'add_first_character'}>
                            <span>Нет ни одного персонажа...</span>
                            <Button onClick={() => setCreateNewCharacter(true)}>Создать первого персонажа</Button>
                        </div>
                        :
                        <div className={'add_character_bottom'}>
                            <div className={'add_character_bottom_title'}>
                                <h3>Создание персонажа</h3>
                            </div>
                            <div className={'add_character_bottom_commonva'}>
                                <div className={'add_character_bottom_common'}>
                                    <div className={'add_character_bottom_inputs'}>
                                        <div>
                                            <label>Имя персонажа(рус.):
                                                <input type={'text'} value={rusNameNew.value}
                                                       onChange={(e) => rusNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Имя персонажа(англ.):
                                                <input type={'text'} value={engNameNew.value}
                                                       onChange={(e) => engNameNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div className={'filter_buttons'}>
                                            <span>Статус:</span>
                                            <select value={statusNew} onChange={(e) => setStatusNew(e.target.value)}>
                                                <option value={'lively'}>Жив(-а)</option>
                                                <option value={'dead'}>Мертв(-а)</option>
                                                <option value={'unknown'}>Неизвестно</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Дата рождения:
                                                <input type={"date"} value={birthdayNew.value}
                                                       onChange={(e) => birthdayNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Возраст в годах:
                                                <input type={"number"} min={0} value={ageNew.value}
                                                       onChange={(e) => ageNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Рост в см:
                                                <input type={"number"} min={0} value={heigthNew.value}
                                                       onChange={(e) => heigthNew.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Обложка (4:3):
                                                <input type={"file"} accept={'.jpg, .jpeg, .png'}
                                                       onChange={handleCharacterCoverChange} ref={characterCoverNew}/>
                                            </label>
                                            {fileCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileCharacterCoverError}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={'add_character_bottom_va'}>
                                    <div>
                                        <label>Имя сэйю:
                                            <input type={'text'} value={seyuNameNew.value}
                                                   onChange={(e) => seyuNameNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка сэйю (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                                   onChange={handleVoiceActorCoverChange} ref={seyuCoverNew}/>
                                        </label>
                                        {fileVoiceActorCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceActorCoverError}</span>}
                                    </div>
                                    <div>
                                        <label>Имя персонажа озвучки:
                                            <input type={'text'} value={characterVoiceNameNew.value}
                                                   onChange={(e) => characterVoiceNameNew.onChange(e)}/>
                                        </label>
                                    </div>
                                    <div>
                                        <label>Обложка персонажа озвучки (4:3):
                                            <input type={'file'} accept={'.jpg, .jpeg, .png'}
                                                   onChange={handleVoiceCharacterCoverChange}
                                                   ref={characterVoiceCoverNew}/>
                                        </label>
                                        {fileVoiceCharacterCoverError && <span style={{color:'#f75151', fontSize: '13px'}}>{fileVoiceCharacterCoverError}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={'textarea_span'}>
                                <label>Описание персонажа:
                                    <textarea rows={10} value={descriptionNew.value}
                                              onChange={(e) => descriptionNew.onChange(e)}/>
                                </label>
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
                            <div className={'add_character_bottom_va_covers'}>
                                {(fileCharacterCoverUrl) &&
                                    <div>
                                        <span>Обложка персонажа</span>
                                        <img
                                            src={`${fileCharacterCoverUrl}`}
                                            alt={'character_cover'}
                                        />
                                    </div>
                                }
                                {(fileVoiceActorCoverUrl) &&
                                    <div>
                                        <span>Обложка сэйю</span>
                                        <img
                                            src={`${fileVoiceActorCoverUrl}`}
                                            alt={'seyu_cover'}
                                        />
                                    </div>
                                }
                                {(fileVoiceCharacterCoverUrl) &&
                                    <div>
                                    <span>Обложка персонажа озвучки</span>
                                        <img
                                            src={`${fileVoiceCharacterCoverUrl}`}
                                            alt={'voice_character_cover'}
                                        />
                                    </div>
                                }
                            </div>
                            <div className={'add_save_button'}>
                                <div>
                                    <Button
                                        disabled={posting || fileCharacterCoverError.length > 0 || fileVoiceActorCoverError.length > 0 ||
                                            fileVoiceCharacterCoverError.length > 0 || (!rusNameNew.value && !engNameNew.value) || Number(ageNew.value) < 0 ||
                                            Number(heigthNew.value) < 0} onClick={uploadCharacter}>
                                        Создать персонажа
                                    </Button>
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
export default AddLibraryCharacter