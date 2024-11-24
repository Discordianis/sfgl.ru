import './AdminPage.css'
import React, {useEffect, useRef, useState} from "react";
import AccessDenied from "../../AccessDenied/AccessDenied.tsx";
import Loading from "../../Loading/Loading.tsx";
import Cropper, {ReactCropperElement} from "react-cropper";
import Button from "../../Button/Button.tsx";
import defaultAvatar from "../../../../public/system/users/avatars/default.jpg";
import useInput from "../../../hooks/useInput.tsx";
import UTabs from "../../UTabs/UTabs.tsx";
import {useSelector} from "react-redux";
import {useNotification} from "../../../hooks/useSuccess.tsx";
import {RootState} from "../../../redux";
import moment from "moment";

interface IArchiveInfo {
    cover: string,
    date: string,
    date_modified: string,
    description: string,
    id: number,
    name: string,
    user_id: string | number,
    user_nickname: string,
}
interface IUsersInfo {
    about: string,
    age: string,
    avatar: string,
    birthday: string,
    custom_nickname: string,
    last_online_date: string,
    nickname: string,
    id: string | number,
    online: string | number,
    orientation: string,
}

interface IArchive {
    status: boolean,
    info: {
        [key: string]: {
            length: number;
            [key: number]: IArchiveInfo
        }
    }
}
interface IUser {
    status: boolean,
    info: {
        [key: number]: IUsersInfo
    }
}

const AdminPage: React.FC = () => {

    const token = localStorage.getItem('token')

    const [allUsersSelect, setUsersSelect] = useState('')

    const [archiveUsersData, setArchiveUsersData] = useState<IArchive | null>(null)
    const [usersData, setUsersData] = useState<IUser | null>(null)
    const [editingData, setEditingData] = useState(null)

    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [inputError, setInputError] = useState(false);
    const [inputEditError, setInputEditError] = useState(false);

    const cropperRef = useRef<ReactCropperElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const achieveNameInput = useInput('', {})
    const achieveDescriptionInput = useInput('', {})
    const achieveDateInput = useInput('', {})

    const editAchieveNameInput = useInput('', {})
    const editAchieveDescriptionInput = useInput('', {})
    const editAchieveDateInput = useInput('', {})
    const [editCroppedImage, setEditCroppedImage] = useState<string | null>(null);
    const cropperEditRef = useRef<ReactCropperElement | null>(null);
    const fileEditInputRef = useRef<HTMLInputElement | null>(null);
    const [imageEditPreview, setImageEditPreview] = useState<string | null>(null);
    const [isEditEditing, setIsEditEditing] = useState(false);

    const [tab, setTab] = useState('')

    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData)
    const {showNotification, NotificationComponent} = useNotification()

    const handleCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 160,
                height: 160,
            });
            setCroppedImage(canvas.toDataURL());
            setIsEditing(false);
        }
    };

    const handleEditCrop = () => {
        const cropper = cropperEditRef.current?.cropper;
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 160,
                height: 160,
            });
            setEditCroppedImage(canvas.toDataURL());
            setIsEditEditing(false);
        }
    };

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

    const handleEditInputFileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageEditPreview(reader.result as string);
                setIsEditEditing(true);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current = null;
        }
    };

    useEffect(() => {
        const fetching = async () => {
            setLoading(true)
            const resUsers = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const resAch = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllAchievements'})
            })
            const dataUser = await resUsers.json()
            const dataAch = await resAch.json()
            setUsersData(dataUser)
            setArchiveUsersData(dataAch);
            setLoading(false)
        }
        fetching()
    }, [server, token]);

    const postAchieve = async () => {
        const achieveData = {
            name: achieveNameInput.value,
            date: achieveDateInput.value,
            description: achieveDescriptionInput.value,
            cover: croppedImage,
            nickname: allUsersSelect
        }

        try {
            if (inputError) {
                setPosting(false)
                console.log('пустые инпуты!')
            }
            else {
                setPosting(true)
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'insertUserAchievement', data: achieveData})
                })
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    showNotification('Что-то пошло не так...', 'error')
                }
                else {
                    showNotification('Данные обновлены', 'success')
                }
                setCroppedImage(null)
                if (fileInputRef.current && "value" in fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                achieveNameInput.setValue('')
                achieveDescriptionInput.setValue('')
                achieveDateInput.setValue('')
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            const fetching = async () => {
                setLoading(true)
                const resUsers = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllUsers'})
                })
                const resAch = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllAchievements'})
                })
                const dataUser = await resUsers.json()
                const dataAch = await resAch.json()
                setUsersData(dataUser)
                setArchiveUsersData(dataAch);
                setLoading(false)
            }
            await fetching()
            setPosting(false)
        }
    }

    const editAchieve = async (id: number) => {

        const formatDate = (date: Date) => {
            const pad = (num: number) => num.toString().padStart(2, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const date = new Date()

        const achieveData = {
            name: editAchieveNameInput.value,
            date: editAchieveDateInput.value,
            description: editAchieveDescriptionInput.value,
            cover: editCroppedImage ? editCroppedImage : editingData.cover,
            date_modified: formatDate(date)
        }

        try {
            if (inputEditError) {
                setPosting(false)
                console.log('пустые инпуты!')
            }
            else {
                setPosting(true)
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'updateUserAchievement', data: achieveData, conditions: {user_nickname: allUsersSelect, id: id}})
                })
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    showNotification('Что-то пошло не так...', 'error')
                }
                else {
                    showNotification('Данные обновлены', 'success')

                    if (fileEditInputRef.current && "value" in fileEditInputRef.current) {
                        fileEditInputRef.current.value = ''
                    }
                }
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            const fetching = async () => {
                setLoading(true)
                const resUsers = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllUsers'})
                })
                const resAch = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllAchievements'})
                })
                const dataUser = await resUsers.json()
                const dataAch = await resAch.json()
                setUsersData(dataUser)
                setArchiveUsersData(dataAch);
                setLoading(false)
            }
            await fetching()
            setPosting(false)
        }
    }

    const deleteAchieve = async (id: number) => {
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteUserAchievement', conditions: {user_nickname: allUsersSelect, id: id}})
        })
        const data = await res.json()
        if (!data?.status) {
            showNotification('Что-то пошло не так...', 'error')
        }
        else {
            const elem = document.getElementById(`achievement_${id}`)
            if (elem) {
                elem.remove()
            }
            showNotification('Удаление успешно', 'success')
        }

        const fetching = async () => {
            setLoading(true)
            const resUsers = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const resAch = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllAchievements'})
            })
            const dataUser = await resUsers.json()
            const dataAch = await resAch.json()
            setUsersData(dataUser)
            setArchiveUsersData(dataAch);
            setLoading(false)
        }
        await fetching()
    };

    useEffect(() => {
        if (editingData) {
            editAchieveNameInput.setValue(editingData?.name)
            editAchieveDateInput.setValue(editingData?.date)
            editAchieveDescriptionInput.setValue(editingData?.description)
            setCroppedImage('')
        }
    }, [editingData]);

    useEffect(() => {
        if (achieveDateInput.value > moment().format('YYYY-MM-DD')
            || achieveNameInput.value.length === 0
            || achieveDescriptionInput.value.length === 0
            || achieveDateInput.value.length === 0
            || !croppedImage) {
            setInputError(true)
        }
        else setInputError(false)
    }, [achieveDateInput.value, achieveDescriptionInput.value.length, achieveNameInput.value.length, croppedImage]);

    useEffect(() => {
        if (editAchieveDateInput.value > moment().format('YYYY-MM-DD')
            && editAchieveNameInput.value.length === 0
            && editAchieveDescriptionInput.value.length === 0
            && editAchieveDateInput.value.length === 0
            && !editCroppedImage) {
            setInputEditError(true)
        }
        else setInputEditError(false)
    }, [editAchieveDateInput.value, editAchieveDescriptionInput.value.length, editAchieveNameInput.value.length, editCroppedImage]);

    const reformDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        if (!year || !month || !day) return null;
        return `${day}.${month}.${year}`;
    };

    const getAchieveById = (id: number) => {
        if (archiveUsersData?.info) {
            const data = Object.values(archiveUsersData.info[allUsersSelect]).find((item: IArchiveInfo) => item.id === id);
            if (data) {
                setEditingData(data);
            }
        }
    }

    if (myData.data?.info.nickname !== 'MrZaxter' && !loading) return <AccessDenied />
    if (loading) return <Loading />

    return (
        <div className={'admin_page_root'}>
            <div>
                <div>
                    {usersData?.info && Object.values(usersData?.info).length > 0 &&
                        <>
                            <h4>Список пользователей:</h4>
                            <div className={'filter_buttons'}>
                                <select value={allUsersSelect} onChange={(e) => setUsersSelect(e.target.value)}>
                                    <option value={''} hidden>Выберите пользователя...</option>
                                    {Object.values(usersData?.info).map((users: IUsersInfo) =>
                                        <option value={users.nickname}
                                                key={users.id}>{users.custom_nickname} ({users.nickname})</option>
                                    )}
                                </select>
                            </div>
                        </>
                    }
                    {allUsersSelect !== '' &&
                        <div className={'admin_page_action'}>
                            <h4>Доступные действия:</h4>
                            <div className={'admin_page_utabs'}>
                                <UTabs isActive={tab === 'achieveView'} onClick={() => setTab('achieveView')}>Просмотр
                                    имеющихся Историй</UTabs>
                                <UTabs isActive={tab === 'achieve'} onClick={() => setTab('achieve')}>Выдача
                                    Историй</UTabs>
                                <UTabs isActive={tab === 'edit'} onClick={() => setTab('edit')}>Перепись
                                    Историй</UTabs>
                            </div>
                            {tab === 'achieveView' &&
                                <div className={'profile_ach_root'}>
                                    {(archiveUsersData?.info?.[allUsersSelect] && archiveUsersData?.info[allUsersSelect].length !== 0 && archiveUsersData?.info[allUsersSelect]) ?
                                        Object.values(archiveUsersData?.info[allUsersSelect])
                                            .sort((a: IArchiveInfo, b: IArchiveInfo) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((achieve: IArchiveInfo) =>
                                                <div className={'profile_ach'} id={`achievement_${achieve.id}`} key={achieve.id}>
                                                    <div>
                                                        {achieve?.cover &&
                                                            <img src={`${achieve.cover}`} alt={'achieve_img'}/>}
                                                    </div>
                                                    <div>
                                                        {achieve?.name && <span><strong>{achieve.name}</strong></span>}
                                                        {achieve?.description && <span>{achieve.description}</span>}
                                                        {achieve?.date && <span>Дата получения: {reformDate(achieve.date)}</span>}
                                                    </div>
                                                    <div className={'achieve_delete_button'}>
                                                        <Button onClick={() => deleteAchieve(achieve.id)}>X</Button>
                                                    </div>
                                                </div>
                                            )
                                        :
                                        <span>У этого человека нет выдающихся Историй...</span>
                                    }
                                </div>
                            }
                            {tab === 'achieve' &&
                                <div className={'add_get_achieve_root'}>
                                    <div className={'add_get_achieve'}>
                                        <form>
                                            <div className={'admin_achieve_cover'}>
                                                <div>
                                                    {croppedImage ?
                                                        <img src={croppedImage} alt="cropped_cover"/>
                                                        :
                                                        <img src={`${defaultAvatar}`} alt={'achieve_cover'}/>
                                                    }
                                                </div>
                                                <div className={'admin_achieve_file'}>
                                                    <div>
                                                        <span>Размер изображения - 160х160</span>
                                                        <input type="file" ref={fileInputRef}
                                                               onChange={handleInputFileOnChange}/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={'admin_achieve_input'}>
                                                <label>Название Истории:
                                                    <input type={"text"} value={achieveNameInput.value}
                                                           onChange={(e) => achieveNameInput.onChange(e)}/>
                                                </label>
                                                <label>Описание Истории:
                                                    <input type={"text"} value={achieveDescriptionInput.value}
                                                           onChange={(e) => achieveDescriptionInput.onChange(e)}/>
                                                </label>
                                                <label>Дата получения Истории:
                                                    <input type={"date"} value={achieveDateInput.value}
                                                           style={{outline: achieveDateInput.value > moment().format('YYYY-MM-DD') ? '2px red solid' : ''}}
                                                           max={moment().format('YYYY-MM-DD')}
                                                           onChange={(e) => achieveDateInput.onChange(e)}/>
                                                </label>
                                            </div>
                                        </form>
                                        <div>
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
                                                        <Button onClick={handleCrop}>Сохранить</Button>
                                                        <Button onClick={handleCancel}>Отмена</Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className={'admin_achieve_save'}>
                                            <Button disabled={posting || croppedImage === null} onClick={() => {setCroppedImage(null); setIsEditing(false);
                                                if (fileInputRef.current && "value" in fileInputRef.current) {
                                                    fileInputRef.current.value = ''
                                                }
                                            }}>Удалить иконку</Button>
                                            <Button disabled={inputError || posting || isEditing} onClick={postAchieve}>Выдать Историю</Button>
                                        </div>

                                    </div>
                                </div>
                            }
                            {tab === 'edit' &&
                                <div className={'edit_achieve_root'}>
                                    <div className={'edit_achieve_filter'}>
                                        {(archiveUsersData?.info[allUsersSelect] && archiveUsersData?.info[allUsersSelect].length !== 0 && archiveUsersData?.info[allUsersSelect]) ?
                                            Object.values(archiveUsersData?.info[allUsersSelect])
                                                .sort((a: IArchiveInfo, b: IArchiveInfo) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((achieve: IArchiveInfo) =>
                                                    <div className={'edit_profile_ach'} id={`achievement_${achieve.id}`} key={achieve.id} onClick={() => getAchieveById(achieve.id)}>
                                                        <div>
                                                            {achieve?.cover &&
                                                                <img src={`${achieve.cover}`} alt={'achieve_img'}/>}
                                                        </div>
                                                        <div>
                                                            {achieve?.name && <span>{achieve.name}</span>}
                                                        </div>
                                                    </div>
                                                )
                                            :
                                            <span>У этого человека нет выдающихся Историй...</span>
                                        }
                                    </div>
                                    {editingData &&
                                        <div className={'edit_achieve_info'}>
                                            <form>
                                                <div className={'admin_achieve_cover'}>
                                                    <div>
                                                        {editCroppedImage ?
                                                            <img src={editCroppedImage} alt="cropped_cover"/>
                                                            :
                                                            <img src={`${editingData?.cover}`} alt={'achieve_cover'}/>
                                                        }
                                                    </div>
                                                    <div className={'admin_achieve_file'}>
                                                        <div>
                                                            <span>Размер изображения - 160х160</span>
                                                            <input type="file" ref={fileInputRef}
                                                                   onChange={handleEditInputFileOnChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={'admin_achieve_input'}>
                                                    <label>Название Истории:
                                                        <input type={"text"} value={editAchieveNameInput.value}
                                                               onChange={(e) => editAchieveNameInput.onChange(e)}/>
                                                    </label>
                                                    <label>Описание Истории:
                                                        <input type={"text"} value={editAchieveDescriptionInput.value}
                                                               onChange={(e) => editAchieveDescriptionInput.onChange(e)}/>
                                                    </label>
                                                    <label>Дата получения Истории:
                                                        <input type={"date"} value={editAchieveDateInput.value}
                                                               style={{outline: editAchieveDateInput.value > moment().format('YYYY-MM-DD') ? '2px red solid' : ''}}
                                                               max={moment().format('YYYY-MM-DD')}
                                                               onChange={(e) => editAchieveDateInput.onChange(e)}/>
                                                    </label>
                                                </div>
                                            </form>
                                            <div>
                                                {isEditEditing && (
                                                    <>
                                                        <div className="cropper-container">
                                                            <Cropper
                                                                src={imageEditPreview || ""}
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
                                                                ref={cropperEditRef}
                                                            />
                                                        </div>
                                                        <div className="cropper-buttons">
                                                            <Button onClick={handleEditCrop}>Сохранить</Button>
                                                            <Button onClick={handleCancel}>Отмена</Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className={'admin_achieve_save'}>
                                                <Button disabled={posting || editCroppedImage === null} onClick={() => {
                                                    setCroppedImage(null);
                                                    setIsEditing(false);
                                                    if (fileEditInputRef.current && "value" in fileEditInputRef.current) {
                                                        fileEditInputRef.current.value = ''
                                                    }
                                                }}>Удалить иконку</Button>
                                                <Button disabled={inputEditError || posting || isEditEditing} onClick={() =>
                                                    editAchieve(editingData?.id)}>Переписать Историю</Button>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    }
                    <NotificationComponent />
                </div>
            </div>
        </div>
    )
}
export default AdminPage