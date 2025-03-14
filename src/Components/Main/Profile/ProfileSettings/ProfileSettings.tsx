import './ProfileSettings.css'
import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import useInput from "../../../../hooks/useInput.tsx";
import CryptoJS from "crypto-js";
import success from "../../../../../public/icons/checkMarkSuccess.png";
import AccessDenied from "../../../AccessDenied/AccessDenied.tsx";
import Loading from "../../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import Cropper, {ReactCropperElement} from "react-cropper";
import "cropperjs/dist/cropper.css";
import {useNotification} from "../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../redux";
import ReactCodeMirror from "@uiw/react-codemirror";
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import UTabs from "../../../UTabs/UTabs.tsx";
import moment from "moment";
import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";

const ProfileSettings: React.FC = () => {

    const token = localStorage.getItem('token')
    const nicknameInput = useInput('', {maxLengthError: 24, emptyInput: true, customNicknameError: true})
    const currentPasswordInput = useInput('', {emptyInput: true})
    const newPasswordInput = useInput('', {minLengthError: 8, emptyInput: true, passwordNumberError: true, passwordSymbolError: true, passwordUpperCaseError: true, passwordLowerCaseError: true})
    const repeatNewPasswordInput = useInput('', {emptyInput: true, repeatPasswordError: newPasswordInput.value})
    const birthdayInput = useInput('', {})
    const backgroundInput = useInput('', {})
    const [links, setLinks] = useState<{ [key: number]: { name: string; link: string; img: string } }>({});
    const [linksPrev, setLinksPrev] = useState<{ [key: number]: { name: string; link: string; img: string } }>({});
    const [orient, setOrient] = useState('')
    const [tokenExist, setTokenExist] = useState(false)
    const [extend, setExtend] = useState(false);
    const [uploadingData, setUploadingData] = useState(false);
    const [jsonData, setJsonData] = useState(null)
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData)
    const [passwordCurrNewError, setPasswordCurrNewError] = useState('')
    const [cssInput, setCssInput] = useState('')
    const [old, setOld] = useState('')
    const [dateInputError, setDateInputError] = useState(false)
    const [existArchiveError, setExistArchiveError] = useState(false)
    const [checkingToken, setCheckingToken] = useState(true)
    const [access, setAccess] = useState(false)
    const navigate = useNavigate()
    const params = useParams()

    const [currentPasswordError, setCurrentPasswordError] = useState(true)
    const [newPasswordError, setNewPasswordError] = useState(true)

    const [musicInput, setMusicInput] = useState<File | null>(null)
    const musicInputRef = useRef<HTMLInputElement | null>(null)
    const [musicError, setMusicError] = useState<string | null>(null);
    const maxFileSize = 15 * 1024 * 1024; // 15 MB

    const alterAvatar = useInput('', {})
    const [disabledAlter, setDisabledAlter] = useState(false)

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [cssError, setCssError] = useState(false);

    const cropperRef = useRef<ReactCropperElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { showNotification, NotificationComponent } = useNotification();

    const [tab, setTab] = useState('standard')

    const addLink = () => {
        const newKey = Object.keys(links).length + 1;
        setLinks(prev => ({
            ...prev,
            [newKey]: { name: "", link: "", img: "" }
        }));
    };
    const updateField = (key: number, field: "name" | "link" | "img", value: string) => {
        setLinks(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    useEffect(() => {
        const fetching = async () => {
            const userRes = await fetch(`${server}`, {
                method: 'POST',
                body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
            })
            const data = await userRes.json();
            if (!data?.status){
                console.log(data?.info)
            }
            else {
                setJsonData(data)
                const parsedData = JSON.parse(data?.info?.links);
                if (typeof parsedData === "object" && parsedData !== null) {
                    setLinks(parsedData);
                    setLinksPrev(parsedData)
                }
            }
        }
        fetching().then()
    }, [params.nickname, server, token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.type !== 'audio/mpeg') {
                setMusicError('Неверный формат файла. Пожалуйста, загрузите файл в формате .mp3');
                setMusicInput(null)
                return;
            }

            if (file.size > maxFileSize) {
                setMusicError('Размер файла превышает 15 MB. Пожалуйста, загрузите файл меньшего размера.');
                setMusicInput(null)
                return;
            }

            setMusicError(null);
            setMusicInput(file)
            console.log('Загруженный файл:', file);
        }
    };

    useEffect(() => {
        if (jsonData && jsonData?.info.custom_nickname) {
            nicknameInput.setValue(jsonData?.info.custom_nickname)
        }
    }, [jsonData]);

    const postNickname = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploadingData(true)
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'updateMyself',
                data: {
                custom_nickname: nicknameInput.value,
                },
                conditions: {nickname: params.nickname}})
        })
        const data = await res.json()
        if (!data?.status) {
            console.log(data?.info)
            showNotification('Что-то пошло не так...', 'error')
        }
        else {
            const fetching = async () => {
                const userRes = await fetch(`${server}`, {
                    method: 'POST',
                    body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
                })
                const data = await userRes.json();
                if (!data?.status){
                    console.log(data?.info)
                }
                else {
                    setJsonData(data)
                    showNotification('Данные обновлены', 'success')
                }
            }
            fetching()
        }
        setUploadingData(false)
    }

    const postPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPasswordError) {
            setUploadingData(true)
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({
                    token: token,
                    action: 'updateMyself',
                    data:
                        {password: CryptoJS.SHA256(newPasswordInput.value).toString(CryptoJS.enc.Hex)},
                    conditions: {nickname: params.nickname}
                })
            })
            const data = await res.json()
            if (!data?.status) {
                console.log(data?.info)
                setUploadingData(false)
            } else {
                const fetching = async () => {
                    const userRes = await fetch(`${server}`, {
                        method: 'POST',
                        body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
                    })
                    const data = await userRes.json();
                    if (!data?.status) {
                        console.log(data?.info)
                        showNotification('Что-то пошло не так...', 'error')
                    } else {
                        setJsonData(data)
                        showNotification('Данные обновлены', 'success')
                    }
                }
                fetching()
                localStorage.removeItem('token')
                setPasswordCurrNewError('')
                navigate('/login')
            }
            setUploadingData(false)
        } else {
            setPasswordCurrNewError('Неверный пароль.')
        }
    }

    const postOptional = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadingData(true);

        const form = new FormData();

        if (musicInput && musicInputRef.current?.files && musicInputRef.current?.files[0]) {
            form.append('music', musicInputRef.current?.files[0]);
        }
        const lnk = JSON.stringify(links)
        const post = {
            token: token,
            action: 'updateMyself',
            data: {
                birthday: birthdayInput.value,
                orientation: orient,
                age: old,
                background: backgroundInput.value ? backgroundInput.value : '',
                avatar: croppedImage ? croppedImage : alterAvatar.value ? alterAvatar.value : jsonData.info.avatar,
                styles: cssInput !== jsonData?.info?.styles ? cssInput : jsonData?.info?.styles,
                links: lnk
            },
            conditions: { nickname: params.nickname }
        };

        form.append('post', JSON.stringify(post));

        const res = await fetch(server, {
            method: 'POST',
            body: form
        } as RequestInit);
        const data = await res.json()
        if (!data?.status) {
            console.log(data?.info)
            showNotification('Что-то пошло не так...', 'error')
            setUploadingData(false)
        }
        else {
            const fetching = async () => {
                const userRes = await fetch(`${server}`, {
                    method: 'POST',
                    body: JSON.stringify({action: 'getUser', token: token, conditions: {nickname: params.nickname}})
                })
                const data = await userRes.json();
                if (!data?.status){
                    console.log(data?.info)
                    showNotification('Что-то пошло не так...', 'error')
                    setUploadingData(false)
                }
                else {
                    setJsonData(data)
                    showNotification('Данные обновлены', 'success')
                    setUploadingData(false);
                    if (croppedImage || alterAvatar.value) {
                        window.location.reload()
                    }
                }
                setUploadingData(false)
            }
            await fetching()
        }
    };

    useEffect(() => {
        if (myData) {
            if (myData?.data?.info?.styles) {
                setCssInput(myData?.data?.info?.styles)
            }
        }
    }, [myData]);

    useEffect(() => {
        if (myData) {
            if (myData?.data?.info?.styles === cssInput) {
                setCssError(true)
            }
            if (!myData?.data?.info?.styles && cssInput === '') {
                setCssError(true)
            } else {
                setCssError(false)
            }
        }
    }, [myData, cssInput]);

    useEffect(() => {
        const hashCurrentPassword = CryptoJS.SHA256(currentPasswordInput.value).toString(CryptoJS.enc.Hex)

        const isPasswordValid = hashCurrentPassword === jsonData?.info.password

        setCurrentPasswordError(!isPasswordValid)

    }, [currentPasswordInput.value, jsonData?.info.password]);

    useEffect(() => {
        const hashNewPassword = CryptoJS.SHA256(newPasswordInput.value).toString(CryptoJS.enc.Hex)
        const isPasswordValid = hashNewPassword !== jsonData?.info.password
        setNewPasswordError(!isPasswordValid)
    }, [newPasswordInput.value, jsonData?.info.password]);

    useEffect(() => {
        if (jsonData?.info){
            birthdayInput.setValue(jsonData?.info.birthday)
            setOrient(jsonData?.info.orientation)
        }
    }, [jsonData?.info]);

    useEffect(() => {
        if (jsonData?.info && jsonData?.info.background){
            backgroundInput.setValue(jsonData?.info.background)
        }
    }, [jsonData?.info]);

    useEffect(() => {
        if (birthdayInput.value) {
            const timeDiff = Math.abs(Date.now() - new Date(birthdayInput.value).getTime());
            const dateDiff = Math.ceil(timeDiff / (24 * 1000 * 3600));
            setOld(`${dateDiff}`);
        }
    }, [birthdayInput.value]);

    useEffect(() => {
        if (birthdayInput.value === jsonData?.info.birthday && orient === jsonData?.info.orientation &&
            backgroundInput.value === jsonData?.info.background && !musicInput && !croppedImage){
            setExistArchiveError(true)
        }
        else setExistArchiveError(false)
    }, [birthdayInput.value, orient, jsonData?.info, backgroundInput.value, musicInput, croppedImage]);

    useEffect(() => {
        if (birthdayInput.value > moment().format('YYYY-MM-DD')) {
            setDateInputError(true)
        }
        else setDateInputError(false)

    }, [birthdayInput.value]);

    useEffect(() => {
        if (jsonData?.status && myData?.data && myData?.data?.status){
            if (jsonData?.info?.nickname !== myData?.data?.info?.nickname) {
                setTokenExist(false)
                setCheckingToken(false)
                setAccess(false)
            }
            else {
                setAccess(true)
            }
        }
    }, [jsonData, myData]);

    useEffect(() => {
        if (fileInputRef.current && fileInputRef.current.files[0] && alterAvatar.value) {
            alterAvatar.setValue('')
            setDisabledAlter(true)
        }

        else {
            if (alterAvatar.value) {
                if (fileInputRef?.current) {
                    fileInputRef.current.value = ''
                    setCroppedImage('')
                    setIsEditing(false)
                }
            }
        }
    }, [croppedImage, alterAvatar.value, fileInputRef.current]);


    const handleInputFileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setIsEditing(true);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200,
            });
            setCroppedImage(canvas.toDataURL());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setImagePreview(null);
        setDisabledAlter(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAllCancel = () => {
        setOrient(`${jsonData?.info.orientation}`);
        birthdayInput.setValue(`${jsonData?.info.birthday}`)
        setCroppedImage(null)
        setDisabledAlter(false)
        setCssInput(`${myData?.data?.info?.styles}`)
        setLinks(linksPrev)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const myTheme = createTheme({
        theme: 'dark',
        settings: {
            background: '#252525',
            backgroundImage: '',
            foreground: '#e361ab',
            caret: '#bda47d',
            selection: '#4b416e',
            selectionMatch: '#D6D6D6',
            gutterBackground: '#1c1c1c',
            gutterForeground: '#9a9a9a',
            gutterBorder: '#dddddd',
            gutterActiveForeground: '',
            lineHighlight: '#575757',
        },
        styles: [
            { tag: t.comment, color: '#787b80' },
            { tag: t.definition(t.typeName), color: '#194a7b' },
            { tag: t.typeName, color: '#194a7b' },
            { tag: t.tagName, color: '#008a02' },
            { tag: t.variableName, color: '#5fc0cd' },
        ],
    });

    if (!jsonData?.info) {
        return <Loading />;
    }

    if (!tokenExist && !checkingToken) {
        return <AccessDenied />;
    }

    return (
        <div className={'profile_settings_root'}>
            {access &&
                <>
                    <div>
                        <h2>Настройки и персонализация</h2>
                        <div className={'profile_settings_utabs'}>
                            <UTabs isActive={tab === 'standard'} onClick={() => setTab('standard')}>Основные настройки</UTabs>
                            <UTabs isActive={tab === 'css'} onClick={() => setTab('css')}>Кастомизация</UTabs>
                        </div>
                        {tab === 'standard' &&
                            <div>
                                <div className={'profile_settings_left'}>
                                    <h3>Настройки учётной записи</h3>
                                    <div>
                                        <form onSubmit={postNickname}>
                                            <div className={'ps_current_nickname'}>
                                                <label>
                                                    <TextField
                                                        variant={'outlined'}
                                                        label={'Имя учётной записи'}
                                                        type={'text'}
                                                        value={jsonData?.info.nickname || ''}
                                                        disabled
                                                        style={{cursor: 'not-allowed'}}
                                                    />
                                                </label>
                                                <span>(У вас нет прав изменять имя учётной записи)</span>
                                            </div>
                                            <div className={'ps_custom_nickname'}>
                                                <label>
                                                    <TextField
                                                        variant={'outlined'}
                                                        label={'Отображаемый никнейм'}
                                                        type={'text'}
                                                        value={nicknameInput.value || ''}
                                                        onChange={(e) => nicknameInput.onChange(e)}
                                                    />
                                                </label>
                                            </div>
                                            {(nicknameInput.value.length !== 0 && nicknameInput.value !== jsonData?.info.custom_nickname) &&
                                                <Button variant={'outlined'} disabled={(uploadingData || nicknameInput.anyError)}>Сохранить</Button>
                                            }
                                        </form>
                                        <form onSubmit={postPassword}>
                                            <div className={'ps_password'}>
                                                {!extend ?
                                                    <div>
                                                        <Button variant={'outlined'} disabled={uploadingData} onClick={() => setExtend(true)}>Сменить пароль</Button>
                                                    </div>
                                                    :
                                                    <>
                                                        <div>
                                                            <label>
                                                                <TextField
                                                                    variant={'outlined'}
                                                                    label={'Ваш текущий пароль'}
                                                                    type={'password'}
                                                                    value={currentPasswordInput.value || ''}
                                                                    onChange={(e) => currentPasswordInput.onChange(e)}
                                                                    autoComplete={''}
                                                                />
                                                            </label>
                                                            <label>
                                                                <TextField
                                                                    variant={'outlined'}
                                                                    label={'Введите новый пароль'}
                                                                    type={'password'}
                                                                    value={newPasswordInput.value || ''}
                                                                    onChange={(e) => newPasswordInput.onChange(e)}
                                                                    autoComplete={'new-password'}
                                                                />
                                                            </label>
                                                            <label>
                                                                <TextField
                                                                    variant={'outlined'}
                                                                    label={'Повторите новый пароль'}
                                                                    type={'password'}
                                                                    value={repeatNewPasswordInput.value || ''}
                                                                    onChange={(e) => repeatNewPasswordInput.onChange(e)}
                                                                    autoComplete={''}
                                                                />
                                                            </label>
                                                        </div>
                                                        {passwordCurrNewError &&
                                                            <div><span>{passwordCurrNewError}</span></div>}
                                                        <div className={'password_items'}>
                                                            <div
                                                                className={newPasswordInput.minLengthError ? 'password_error_div' : 'password_success_div'}>
                                                                <img src={`${success}`} alt={'pass_status'}/>
                                                                <span
                                                                    className={newPasswordInput.minLengthError ? 'password_error' : 'password_success'}>
                                                        Пароль должен иметь минимум 8 символов
                                                    </span>
                                                            </div>
                                                            <div
                                                                className={newPasswordInput.passwordNumberError ? 'password_error_div' : 'password_success_div'}>
                                                                <img src={`${success}`} alt={'pass_status'}/>
                                                                <span
                                                                    className={newPasswordInput.passwordNumberError ? 'password_error' : 'password_success'}>
                                                        Пароль должен иметь минимум 1 цифру
                                                    </span>
                                                            </div>
                                                            <div
                                                                className={newPasswordInput.passwordSymbolError ? 'password_error_div' : 'password_success_div'}>
                                                                <img src={`${success}`} alt={'pass_status'}/>
                                                                <span
                                                                    className={newPasswordInput.passwordSymbolError ? 'password_error' : 'password_success'}>
                                                        Пароль должен иметь минимум 1 специальный символ
                                                    </span>
                                                            </div>
                                                            <div
                                                                className={newPasswordInput.passwordUpperCaseError ? 'password_error_div' : 'password_success_div'}>
                                                                <img src={`${success}`} alt={'pass_status'}/>
                                                                <span
                                                                    className={newPasswordInput.passwordUpperCaseError ? 'password_error' : 'password_success'}>
                                                        Пароль должен иметь минимум 1 заглавную букву
                                                    </span>
                                                            </div>
                                                            <div
                                                                className={newPasswordError ? 'password_error_div' : 'password_success_div'}>
                                                                <img src={`${success}`} alt={'pass_status'}/>
                                                                <span
                                                                    className={newPasswordError ? 'password_error' : 'password_success'}>
                                                        Пароль не должен повторять старый
                                                    </span>
                                                            </div>
                                                        </div>
                                                        <Button variant={'outlined'}
                                                            disabled={uploadingData || newPasswordInput.anyError || repeatNewPasswordInput.anyError}>Сохранить</Button>
                                                        <Button variant={'outlined'} disabled={uploadingData}
                                                                onClick={() => setExtend(false)}>Закрыть</Button>
                                                    </>
                                                }
                                            </div>
                                        </form>
                                    </div>
                                    <div className={'profile_settings_optional'}>
                                        <h3>Необязательные настройки профиля</h3>
                                        <form>
                                            <div className={'filter_buttons'}>
                                                <div className={'filter_buttons_fill'}>
                                                    <FormControl variant="outlined">
                                                        <InputLabel id="outlined-label">Ваш биологический пол</InputLabel>
                                                        <Select
                                                            labelId="outlined-label"
                                                            variant={'outlined'}
                                                            value={orient}
                                                            onChange={(e) => setOrient(e.target.value)}
                                                            label={"Ваш биологический пол"}
                                                        >
                                                            <MenuItem value={''} hidden>Ваш пол...</MenuItem>
                                                            <MenuItem value={'man'}>Мужчина</MenuItem>
                                                            <MenuItem value={'woman'}>Женщина</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            </div>
                                            <div>
                                                <label>
                                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                                        <DatePicker
                                                            label={'Ваша дата рождения'}
                                                            value={moment(birthdayInput.value)}
                                                            onChange={(e) => birthdayInput.setValue(moment(e).format('YYYY-MM-DD HH:mm'))}
                                                            maxDate={moment()}
                                                            className={dateInputError ? 'input error' : ''}
                                                        />
                                                    </LocalizationProvider>
                                                </label>
                                            </div>
                                        </form>
                                        <div>
                                            <h3>Ссылки</h3>
                                            {Object.entries(links).map(([key, linkData]) => (
                                                <div key={key} className="mb-2 flex flex-col gap-1">
                                                    <label>
                                                        <TextField
                                                            variant={'outlined'}
                                                            label={'Название'}
                                                            type={'text'}
                                                            value={linkData.name}
                                                            onChange={e => updateField(Number(key), "name", e.target.value)}
                                                        />
                                                    </label>
                                                    <label>
                                                        <TextField
                                                            variant={'outlined'}
                                                            label={'Ссылка'}
                                                            type={'text'}
                                                            value={linkData.link}
                                                            onChange={e => updateField(Number(key), "link", e.target.value)}
                                                        />
                                                    </label>
                                                    <label>
                                                        <TextField
                                                            variant={'outlined'}
                                                            label={'Ссылка на иконку'}
                                                            type={'text'}
                                                            value={linkData.img}
                                                            onChange={e => updateField(Number(key), "img", e.target.value)}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                            <Button variant={'outlined'} onClick={addLink}>
                                                {Object.keys(links).length > 0 ? "Добавить дополнительные ссылки" : "Добавить ссылки"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className={'profile_settings_background'}>
                                        <h3>Стилизация профиля</h3>
                                        <form>
                                        <div>
                                                <label>
                                                    <TextField
                                                        variant={'outlined'}
                                                        label={'Задний фон профиля'}
                                                        placeholder={'.gif, .png, .jpg, .jpeg'}
                                                        type={'text'}
                                                        value={backgroundInput.value}
                                                        error={backgroundInput.emptyInput}
                                                        onChange={(e) => backgroundInput.onChange(e)}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label>Музыкальная тема профиля<br/>
                                                    (выберите файл в формате .mp3):
                                                    <input type="file" accept=".mp3" onChange={handleFileChange}
                                                           ref={musicInputRef}/>
                                                </label>
                                                {musicError && <p style={{color: 'red'}}>{musicError}</p>}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className={'profile_settings_right'}>
                                    <div>
                                        <div className={'profile_settings_right_avatar'}>
                                            {croppedImage ?
                                                <img src={croppedImage} alt="Cropped avatar"/>
                                                :
                                                <img src={`${jsonData?.info.avatar}`} alt={'user-avatar'}/>
                                            }
                                            <span>Размер изображения - 200x200</span>
                                        </div>
                                        <div className={'profile_settings_right_file'}>
                                            <input type="file" ref={fileInputRef} onChange={handleInputFileOnChange}/>
                                            <h4>Или...</h4>
                                            <label>
                                                <TextField
                                                    variant={'outlined'}
                                                    label={'Загрузить из стороннего источника'}
                                                    type={'text'}
                                                    value={alterAvatar.value}
                                                    error={alterAvatar.emptyInput}
                                                    onChange={(e) => alterAvatar.onChange(e)}
                                                    style={{cursor: disabledAlter ? 'not-allowed' : 'text'}}
                                                />
                                            </label>
                                        </div>
                                        {isEditing && (
                                            <>
                                                <div className="cropper-container">
                                                    <Cropper
                                                        src={imagePreview || ""}
                                                        style={{width: "100%", height: "300px"}}
                                                        initialAspectRatio={1}
                                                        aspectRatio={1}
                                                        guides={true}
                                                        viewMode={1}
                                                        dragMode="move"
                                                        scalable={true}
                                                        cropBoxMovable={true}
                                                        cropBoxResizable={true}
                                                        minCropBoxWidth={80}
                                                        minCropBoxHeight={80}
                                                        ref={cropperRef}
                                                    />
                                                </div>
                                                <div className="cropper-buttons">
                                                    <Button variant={'outlined'} onClick={handleCrop}>Сохранить обрезку</Button>
                                                    <Button variant={'outlined'} onClick={handleCancel}>Отмена</Button>
                                                </div>
                                            </>
                                        )}
                                        {croppedImage && <span>Не забудьте сохранить изменения!</span>}
                                    </div>
                                </div>
                            </div>
                        }
                        {tab === 'css' &&
                            <div className={'profile_settings_css'}>
                                <ReactCodeMirror
                                    theme={myTheme}
                                    height={'600px'}
                                    width={'100%'}
                                    extensions={[javascript({jsx: true})]}
                                    value={cssInput}
                                    onChange={(value: string) => setCssInput(value)}
                                />
                            </div>
                        }
                    </div>
                    {((birthdayInput.value || orient || backgroundInput.value !== jsonData?.customBackground
                            || !musicError || croppedImage) || (!cssError) && (!existArchiveError)) &&
                        <div className={'ps_save_button_optional'}>
                            <Button variant={'outlined'} onClick={handleAllCancel}>Отменить</Button>
                            <Button variant={'outlined'} onClick={postOptional} disabled={dateInputError || uploadingData}>Сохранить изменения</Button>
                        </div>
                    }
                </>
            }
            <NotificationComponent/>
        </div>
    )
}
export default ProfileSettings