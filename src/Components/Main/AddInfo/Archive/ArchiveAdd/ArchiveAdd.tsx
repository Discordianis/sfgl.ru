import React, {useEffect, useRef, useState} from "react";
import useInput from "../../../../../hooks/useInput.tsx";
import {useParams} from "react-router-dom";
import './ArchiveAdd.css'
import Loading from "../../../../Loading/Loading.tsx";
import UTabs from "../../../../UTabs/UTabs.tsx";
import AccessDenied from "../../../../AccessDenied/AccessDenied.tsx";
import AddRelationArchive from "./AddRelationArchive/AddRelationArchive.tsx";
import AddReport from "./AddReports/AddReport.tsx";
import defaultAvatar from "../../../../../../public/system/users/avatars/default.jpg";
import Cropper, {ReactCropperElement} from "react-cropper";
import {useSelector} from "react-redux";
import {useNotification} from "../../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../../redux";
import moment from "moment";
import {Button, MenuItem, Select} from "@mui/material";

interface IArchive {
    status: boolean,
    info: {
        about: string,
        additional: string,
        age: string,
        avatar: string,
        background: string,
        birthday: string,
        custom_nickname: string,
        date_modified: string,
        experience: string,
        fails: string,
        id: string,
        last_online_date: string,
        music: string,
        nickname: string,
        online: string,
        orientation: string,
        partner_avatar: string,
        partner_name: string,
        partner_custom_nickname: string,
        partner_type: string,
        start_date: string,
        start_description: string,
        status: string,
        tries: string,
        user_custom_nickname: string,
        user_id: string,
        user_nickname: string,
    }
}
interface IAllUsers {
    status: boolean,
    info: {
        [key: number]: {
            about: string,
            age: string,
            avatar: string,
            birthday: string,
            custom_nickname: string,
            last_online_date: string,
            nickname: string,
            online: string,
            orientation: string,
        }
    }
}

const ArchiveAdd:React.FC = () => {

    const comStatExpInput = useInput('', {})
    const comStatFailsInput = useInput('', {})
    const comStatTryInput = useInput('', {})
    const comStatAdditInput = useInput('', {})
    const [allUsersSelect, setAllUsersSelect] = useState('')
    const ppStatusStartDateInput = useInput('', {})
    const ppStatusStartDescriptionInput = useInput('', {})
    const [nowRelation, setNowRelation] = useState('')

    const params = useParams()

    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)

    const [archiveData, setArchiveData] = useState<IArchive | null>(null)
    const [allUsersData, setAllUsersData] = useState<IAllUsers | null>(null)

    const [tab, setTab] = useState('common')
    const [dateInputError, setDateInputError] = useState(false);
    const [addImaginaryUser, setAddImaginaryUser] = useState(true);

    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData)

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [checkingToken, setCheckingToken] = useState(true)
    const [tokenError, setTokenError] = useState(true)
    const [inputError, setInputError] = useState('')
    const [access, setAccess] = useState(false)

    const customUserNameInput = useInput('', {maxLengthError: 24})

    const cropperRef = useRef<ReactCropperElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const {showNotification, NotificationComponent} = useNotification()

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
                width: 120,
                height: 120,
            });
            setCroppedImage(canvas.toDataURL());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        const fetching = async () => {
            setLoading(true)
            const loveRes = await fetch(`${server}`, {
                method: 'POST',
                body: JSON.stringify({action: 'getMyLoveStat', token: token, conditions: {user_nickname: params.nickname}})
            })
            const userRes = await fetch(`${server}`, {
                method: 'POST',
                body: JSON.stringify({action: 'getAllUsers', token: token})
            })
            const data = await loveRes.json();
            const userData = await userRes.json();
            setArchiveData(data)
            setAllUsersData(userData)
            setLoading(false)
        }
        fetching()
    }, [params.nickname, server, token]);

    useEffect(() => {
        if (archiveData?.info) {
            setNowRelation(archiveData.info?.status || '');

            comStatExpInput.setValue(archiveData.info?.experience !== null ? archiveData.info?.experience.toString() : '');
            comStatAdditInput.setValue(archiveData.info?.additional || '');
            comStatFailsInput.setValue(archiveData.info?.fails !== null ? archiveData.info?.fails.toString() : '');
            comStatTryInput.setValue(archiveData.info?.tries !== null ? archiveData.info?.tries.toString() : '');

            ppStatusStartDateInput.setValue(archiveData.info?.start_date ? (archiveData.info?.start_date) : '');
            ppStatusStartDescriptionInput.setValue(archiveData.info?.start_description ? archiveData.info?.start_description : '');
        }
    }, [archiveData]);

    useEffect(() => {
        if (ppStatusStartDateInput.value === '') {
            ppStatusStartDescriptionInput.setValue('')
        }
        else {
            ppStatusStartDescriptionInput.setValue(archiveData.info?.start_description ? archiveData.info?.start_description : '');
        }
    }, [ppStatusStartDateInput]);

    useEffect(() => {
        if (archiveData?.info?.partner_name) {
            if (archiveData.info?.partner_type === 'nolab') {
                setAllUsersSelect('')
                setAddImaginaryUser(true);
            }
            if (archiveData.info?.partner_type === 'lab') {
                setAllUsersSelect(`${archiveData.info?.partner_custom_nickname}`)
                setAddImaginaryUser(false)
            }
        }
    }, [archiveData?.info?.status]);

    useEffect(() => {
        if (customUserNameInput.value.trim().length !== 0) {
            setInputError('')
        }
    }, [customUserNameInput.value]);

    useEffect(() => {
        setInputError('')
    }, [nowRelation]);

    const postUpdatableData = async (e: React.FormEvent) => {
        e.preventDefault()

        const checkOrigCustomed = () => {
            if (customUserNameInput.value.trim().length !== 0 && addImaginaryUser) {
                setAllUsersSelect('')
                return customUserNameInput.value
            }
            if (allUsersSelect.length !== 0 && !addImaginaryUser) {
                if (archiveData?.info) {
                    const origName = Object.values(allUsersData?.info).find(orig => orig.custom_nickname === allUsersSelect)
                    customUserNameInput.setValue('')
                    setCroppedImage(null)
                    return `${origName?.nickname}`
                }
            }
            if (allUsersSelect.length === 0 && !addImaginaryUser) {
                if (archiveData?.info) {
                    customUserNameInput.setValue('')
                    setCroppedImage(null)
                    return ''
                }
            }
            if (customUserNameInput.value.trim().length === 0 && addImaginaryUser) {
                if (allUsersData) {
                    return ''
                }
            }
            if (customUserNameInput.value.trim().length !== 0 && addImaginaryUser) {
                if (allUsersData) {
                    return `${customUserNameInput.value}`
                }
            }
        }

        const checkAvatar = () => {
            if (!allUsersData?.info) {
                return '';
            }

            if (customUserNameInput.value.trim().length !== 0 && addImaginaryUser && croppedImage) {
                setAllUsersSelect('');
                return croppedImage;
            }

            if (addImaginaryUser && !croppedImage && customUserNameInput.value.trim().length !== 0 && archiveData?.info.partner_avatar) {
                return archiveData?.info.partner_avatar
            }

            if (allUsersSelect.length !== 0 && !addImaginaryUser) {
                customUserNameInput.setValue('');
                setCroppedImage(null);

                const userAvatar = Object.values(allUsersData?.info)
                    .filter(user => user?.custom_nickname === allUsersSelect)
                    .find(user => user?.avatar)?.avatar;

                return userAvatar || '';
            }

            if (customUserNameInput.value.trim().length === 0 && addImaginaryUser) {
                const array = Object.keys(allUsersData).map(key => allUsersData[key]);

                const userAvatar = array
                    .filter(user => user.custom_nickname === allUsersSelect)
                    .find(user => user.avatar)?.avatar;

                return userAvatar || '';
            }
        };

        const checkPP = () => {
            if (nowRelation === 'Не состою в отношениях' || nowRelation === '') {
                return {
                    user_nickname: null,
                    partner_name: null,
                    partner_avatar: null,
                    partner_type: null,
                    start_date: null,
                    start_description: null
                }
            }
            else {
                return {
                    user_nickname: myData.data?.info?.nickname,
                    partner_name: checkOrigCustomed(),
                    partner_avatar: checkAvatar(),
                    partner_type: addImaginaryUser ? 'nolab' : 'lab',
                    start_date: ppStatusStartDateInput.value,
                    start_description: ppStatusStartDescriptionInput.value
                }
            }
        }

        const archiveUpdatableData = {
            status: nowRelation,
            experience: comStatExpInput.value,
            additional: comStatAdditInput.value,
            fails: comStatFailsInput.value,
            tries: comStatTryInput.value,
            ...checkPP()
        }

        setPosting(true)
        if (archiveData?.info.partner_type === 'nolab' && customUserNameInput.value.trim().length === 0 && nowRelation !== 'Не состою в отношениях' && nowRelation !== '') {
            setInputError('Вы не заполнили данные о пользователе.')
            showNotification('Вы не заполнили данные о пользователе.', 'error')
            setPosting(false)
        }
        else {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'updateMyLoveStat', data: archiveUpdatableData})
            })
            const data = await res.json()
            if (!data.status){
                showNotification('Что-то пошло не так...', 'error')
                setPosting(false)
            }
            else {
                showNotification('Данные обновлены', 'success')
                const fetching = async () => {
                    setLoading(true)
                    const loveRes = await fetch(`${server}`, {
                        method: 'POST',
                        body: JSON.stringify({action: 'getMyLoveStat', token: token, conditions: {user_nickname: params.nickname}})
                    })
                    const userRes = await fetch(`${server}`, {
                        method: 'POST',
                        body: JSON.stringify({action: 'getAllUsers', token: token})
                    })
                    const data = await loveRes.json();
                    const userData = await userRes.json();
                    setArchiveData(data)
                    setAllUsersData(userData)
                    setLoading(false)
                }
                await fetching()
                setPosting(false)
            }
        }
    }

    useEffect(() => {
        if (ppStatusStartDateInput.value > moment().format('YYYY-MM-DD')) {
            setDateInputError(true)
        }
        else setDateInputError(false)

    }, [ ppStatusStartDateInput.value]);

    useEffect(() => {
        if (archiveData?.status && myData.data?.status){
            if (params.nickname !== myData.data?.info.nickname) {
                setTokenError(true)
                setCheckingToken(false)
                setAccess(false)
            }
            else {
                setAccess(true)
                setCheckingToken(false)
            }
        }
    }, [archiveData, myData, params.nickname]);

    useEffect(() => {
        if (archiveData?.info.partner_type && archiveData?.info.partner_type === 'nolab') {
            customUserNameInput.setValue(archiveData?.info.partner_name)
        }
    }, [archiveData?.info]);

    if (loading || checkingToken) {
        return <Loading />
    }

    if (tokenError && !access) {
        return <AccessDenied />
    }

    return(
        <div className={'archive_addInfo_root'}>
            {access &&
                <div>
                    <h2>Добавление информации в архив</h2>
                    <div className={'utabs_archive'}>
                        <div>
                            <UTabs isActive={tab === 'common'} onClick={() => setTab('common')}>Общая информация</UTabs>
                            <UTabs isActive={tab === 'relArchive'} onClick={() => setTab('relArchive')}>Список прошлых отношений</UTabs>
                            <UTabs isActive={tab === 'reports'} onClick={() => setTab('reports')}>Отчёты</UTabs>
                        </div>
                    </div>
                    <div className={`archive_add_inputs archive_add_${tab}`}>
                        {tab === 'common' &&
                            <form onSubmit={postUpdatableData}>
                                <h3>Ваш текущий статус</h3>
                                <div>
                                    <div className={'filter_buttons_fill'}>
                                        <Select variant={'filled'} value={nowRelation} onChange={(e) => setNowRelation(e.target.value)}>
                                            <MenuItem value={''} disabled hidden>Выберите статус...</MenuItem>
                                            <MenuItem value={'Состою в отношениях'}>Состою в отношениях</MenuItem>
                                            <MenuItem value={'Состою в браке'}>Состою в браке</MenuItem>
                                            <MenuItem value={'Не состою в отношениях'}>Не состою в отношениях</MenuItem>
                                        </Select>
                                    </div>
                                </div>
                                <div className={'common_statistic_input'}>
                                    <h3>Ваша общая статистика</h3>
                                    <label>Опыт отношений (в цифрах):
                                        <input type={'number'} value={comStatExpInput.value} min={0}
                                               onChange={(e) => comStatExpInput.onChange(e)}/>
                                    </label>
                                    <label>Опыт отказов (в цифрах):
                                        <input type={'number'} value={comStatFailsInput.value} min={0}
                                               onChange={(e) => comStatFailsInput.onChange(e)}/>
                                    </label>
                                    <label>Опыт попыток начать отношения (в цифрах):
                                        <input type={'number'} value={comStatTryInput.value} min={0}
                                               onChange={(e) => comStatTryInput.onChange(e)}/>
                                    </label>
                                    <label>Дополнительная информация (опционально):
                                        <input type={'text'} value={comStatAdditInput.value}
                                               onChange={(e) => comStatAdditInput.onChange(e)}/>
                                    </label>
                                </div>
                                {(nowRelation !== 'Не состою в отношениях' && nowRelation !== '') &&
                                    <div className={'pp_status_input'}>
                                        <h3>Человек, с которым вы сейчас в отношениях:</h3>
                                        {allUsersData &&
                                            <div className={'exist_users_select'}>
                                                {!addImaginaryUser && <span>Имя вашего партнёра:</span>}
                                                {addImaginaryUser ?
                                                    <div className={'add_custom_user_root'}>
                                                        <div>
                                                            <div className={'add_custom_user_avatar'}>
                                                                {croppedImage ?
                                                                    <img src={croppedImage} alt="Cropped avatar"/>
                                                                    : (archiveData?.info?.partner_avatar && archiveData?.info?.partner_type === 'nolab') ?
                                                                        <img
                                                                            src={`${archiveData?.info?.partner_avatar}`}
                                                                            alt={'user-avatar'}/>
                                                                        :
                                                                        <img src={`${defaultAvatar}`}
                                                                             alt={'user-avatar'}/>
                                                                }
                                                            </div>
                                                            <div className={'add_custom_user_div'}>
                                                                <div className={'add_custom_user_span'}>
                                                                    <span>Размер изображения - 120х120</span>
                                                                    <input type="file" ref={fileInputRef}
                                                                           onChange={handleInputFileOnChange}/>
                                                                </div>
                                                                <div className={'add_custom_user_input'}>
                                                                    <label>Введите имя человека:
                                                                        <input type={'text'}
                                                                               style={{outline: customUserNameInput.maxLengthError ? '2px red solid' : ''}}
                                                                               value={customUserNameInput.value}
                                                                               onChange={(e) => customUserNameInput.onChange(e)}/>
                                                                    </label>
                                                                    {inputError && <span
                                                                        style={{color: '#E13F3FFF'}}>{inputError}</span>}
                                                                </div>
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
                                                                        <Button variant={'outlined'} onClick={handleCrop}>Сохранить</Button>
                                                                        <Button variant={'outlined'} onClick={handleCancel}>Отмена</Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className={'filter_buttons_fill'}>
                                                        <select value={allUsersSelect}
                                                                onChange={(e) => setAllUsersSelect(e.target.value)}>
                                                            {allUsersSelect.length === 0 ?
                                                                <option value={''} hidden>Выберите человека...</option>
                                                                :
                                                                <option value={`${allUsersSelect}`}
                                                                        hidden>{allUsersSelect}</option>
                                                            }
                                                            {Object.values(allUsersData.info).filter(my => my.nickname !== myData.data?.info?.nickname).map((users, index) =>
                                                                <option value={`${users?.custom_nickname}`}
                                                                        key={index}>{users?.nickname} ({users?.custom_nickname})</option>)}
                                                        </select>
                                                    </div>
                                                }
                                                <Button variant={'outlined'} type={"button"}
                                                        onClick={() => setAddImaginaryUser(!addImaginaryUser)}>{addImaginaryUser ? '...Или добавить существующего пользователя' : '...Или добавить мнимого пользователя'}</Button>
                                            </div>
                                        }
                                        <label>Начало ваших текущих отношений:
                                            <input type={'date'} max={moment().format('YYYY-MM-DD')}
                                                   className={dateInputError ? 'input error' : ''}
                                                   value={ppStatusStartDateInput.value}
                                                   onChange={(e) => ppStatusStartDateInput.onChange(e)}/>
                                        </label>
                                        <label>Описание начала ваших текущих отношений:
                                            <input type={'text'} value={ppStatusStartDescriptionInput.value}
                                                   onChange={(e) => ppStatusStartDescriptionInput.onChange(e)}/>
                                        </label>
                                    </div>
                                }
                                <Button variant={'outlined'}
                                    disabled={posting || dateInputError || customUserNameInput.maxLengthError}>Сохранить</Button>

                            </form>
                        }
                        {tab === 'relArchive' &&
                            <AddRelationArchive/>
                        }
                        {tab === 'reports' &&
                            <AddReport/>
                        }
                    </div>
                </div>
            }
            <NotificationComponent />
        </div>
    )
}
export default ArchiveAdd