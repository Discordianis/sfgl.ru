import React, {useEffect, useRef, useState} from "react";
import './AddFridays.css'
import useInput from "../../../../hooks/useInput.tsx";
import Loading from "../../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {useNotification} from "../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../redux";
import Modal from "../../../Modal/Modal.tsx";
import moment from "moment";
import {Button, MenuItem, Select, TextField} from "@mui/material";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {fridayPlaceholders} from "../../../../placeholders/fridayPlaceholders.tsx";

interface ITableInfo {
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

interface ITable {
    status: boolean,
    info: {
        length: number,
        [key: number]: ITableInfo
    }
}

const AddFridays:React.FC = () => {

    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [openTextArea, setOpenTextArea] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [disabledDelete, setDisabledDelete] = useState(true);
    const [dateInputError, setDateInputError] = useState(false);
    const [dateNewInputError, setNewDateInputError] = useState(false);
    const [disabledCreateReport, setDisabledCreateReport] = useState(true)
    const [createdNew, setCreatedNew] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const dateInput = useInput('', {})
    const numberInput = useInput('', {})
    const textInput = useInput('', {})

    const newDateInput = useInput('', {})
    const newNumberInput = useInput('', {})
    const newTextInput = useInput('', {})

    const token = localStorage.getItem('token')

    const [archiveData, setArchiveData] = useState<ITable | null>(null);
    const [currentArchiveData, setCurrentArchiveData] = useState(null);

    const userData = useSelector((state: RootState) => state.myData)
    const server = useSelector((state: RootState) => state.server.server)
    const {showNotification, NotificationComponent} = useNotification()

    const fileImageRef = useRef<HTMLInputElement | null>(null)
    const fileAudioRef = useRef<HTMLInputElement | null>(null)
    const fileVideoRef = useRef<HTMLInputElement | null>(null)

    const [fileUrl, setFileUrl] = useState<string | null>(null)

    const [isActive, setIsActive] = useState('')
    const [typeContent, setTypeContent] = useState('');
    const [fileError, setFileError] = useState('');
    const maxAudioSize = 15 * 1024 * 1024; // 15 MB
    const maxVideoSize = 30 * 1024 * 1024; // 30 MB

    const [placeholder, setPlaceholder] = useState("");

    useEffect(() => {
        const keys = Object.keys(fridayPlaceholders);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setPlaceholder(fridayPlaceholders[randomKey]);
    }, [currentArchiveData, createdNew]);

    useEffect(() => {
        if (createdNew) {
            setDisabledCreateReport(true)
        }
        else {
            setDisabledCreateReport(false)
        }
    }, [createdNew]);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllFridays', conditions: {}})
            })
            const data = await res.json()
            if (!data.status) {
                console.log(data.info)
            }
            else {
                setArchiveData(data)
                setLoading(false)
            }
        }
        fetching()
    }, [server, token]);

    console.log(currentArchiveData)

    const createNewReport = async (e: React.FormEvent) => {
        e.preventDefault();

        const newForm = new FormData()
        const updForm = new FormData()

        const updateReportJson = {
            token: token,
            action: 'updateFriday',
            data: {
                date: dateInput.value,
                date_created: currentArchiveData?.date_created,
                number: numberInput.value,
                text: textInput.value,
                author: userData?.data.info.nickname,
                custom_nickname: userData?.data.info.custom_nickname,
                image: null,
                video: null,
                audio: null
            },
            conditions: {id: currentArchiveData?.id}
        };
        const newReportJson = {
            token: token,
            action: 'insertFriday',
            data: {
                date: newDateInput.value,
                number: newNumberInput.value,
                text: newTextInput.value,
                date_created: new Date().toLocaleDateString(),
                author: userData?.data.info.nickname,
                custom_nickname: userData?.data?.info.custom_nickname,
            }
        };

        if (typeContent === 'music' && fileAudioRef.current?.files[0]) {
            newForm.append('music', fileAudioRef.current?.files[0])
            updForm.append('music', fileAudioRef.current?.files[0])
        }
        if (!fileAudioRef.current?.files[0]) {
            updateReportJson.data.audio = currentArchiveData?.audio;
            updForm.append('post', JSON.stringify(updateReportJson));
        }

        if (typeContent === 'video' && fileVideoRef.current?.files[0]) {
            newForm.append('video', fileVideoRef.current?.files[0])
            updForm.append('video', fileVideoRef.current?.files[0])
        }
        if (!fileVideoRef.current?.files[0]) {
            updateReportJson.data.video = currentArchiveData?.video;
            updForm.append('post', JSON.stringify(updateReportJson));
        }

        if (typeContent === 'image' && fileImageRef.current?.files[0]) {
            newForm.append('image', fileImageRef.current?.files[0])
            updForm.append('image', fileImageRef.current?.files[0])
        }

        if (!fileImageRef.current?.files[0]) {
            updateReportJson.data.image = currentArchiveData?.image;
            updForm.append('post', JSON.stringify(updateReportJson));
        }

        newForm.append('post', JSON.stringify(newReportJson))
        updForm.append('post', JSON.stringify(updateReportJson));

        setPosting(true);
        if (!fileError && (!dateInputError || !dateNewInputError) && (+numberInput.value > 0 || +newNumberInput.value > 0)) {
            if (createdNew) {
                const res = await fetch(server, {
                    method: 'POST',
                    body: newForm
                } as RequestInit)
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    if (data.info.startsWith('Duplicate')) {
                        showNotification('Такой номер пятницы уже существует', 'error')
                        setPosting(false)
                    }
                    else {
                        showNotification('Что-то пошло не так...', 'error')
                        setPosting(false)
                    }
                }
                else {
                    showNotification('Данные обновлены', 'success')
                    setPosting(false)
                    setPosting(false);
                    newDateInput.setValue('')
                    newTextInput.setValue('')
                    newNumberInput.setValue('')
                    setTypeContent('')
                }
            }
            else {
                const res = await fetch(server, {
                    method: 'POST',
                    body: updForm
                } as RequestInit)

                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    if (data.info.startsWith('Duplicate')) {
                        showNotification('Такой номер пятницы уже существует', 'error')
                    }
                    if (data.info.startsWith('Пятница не найдена')) {
                        showNotification(data?.info, 'error')
                    }
                    else {
                        showNotification('Что-то пошло не так...', 'error')
                    }
                    setPosting(false);
                }
                else {
                    showNotification('Данные обновлены', 'success')
                    setCreatedNew(false)
                    setPosting(false);
                    setDisabledCreateReport(false);
                    newDateInput.setValue('')
                }
            }
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllFridays'})
                });
                const data = await res.json();
                if (!data.status) {
                    console.log(data.info);
                    showNotification(data.info, 'error')
                    setPosting(false);
                } else {
                    setArchiveData(data);
                    if (createdNew) {
                        const idsArray = Object.values(data?.info).map((ids: ITableInfo) => ids.id);
                        const maxId = Math.max(...idsArray);
                        const newData = data.info.find((item: ITableInfo) => item.id.toString() === maxId.toString());
                        setCurrentArchiveData(newData);
                        console.log(currentArchiveData)
                        if (newData) {
                            getReportById(Number(newData.id), newData.number.toString())
                        }
                    }
                }
            };
            await fetching()
        }
        else {
            if (fileError) {
                showNotification(`${fileError}`, "error");
                setPosting(false);
            }
            showNotification('Что-то пошло не так...', 'error')
            setPosting(false);
        }
        setPosting(false);
    };

    const deleteReport = async (id: number) => {
        setPosting(true);
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteFriday', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data.status) {
            console.log(data.info)
            showNotification('Что-то пошло не так...', 'error')
            setPosting(false);
        }
        else {
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllFridays'})
                });
                const data = await res.json();
                if (!data.status) {
                    console.log(data.info);
                    showNotification('Что-то пошло не так...', 'error')
                } else {
                    setArchiveData(data);
                    const idsArray = Object.values(data?.info).map((ids: ITableInfo) => ids.id);
                    const maxId = Math.max(...idsArray);
                    const newData = data.info.find((item: ITableInfo) => item.id.toString() === maxId.toString());
                    setCurrentArchiveData(newData);
                    getReportById(currentArchiveData.id, currentArchiveData.number)
                    showNotification('Удаление успешно', 'success')
                }
            };
            await fetching()
        }
        setPosting(false);
        if (!currentArchiveData.info){
            setOpenTextArea(false);
        }
        else {
            setOpenTextArea(true)
        }
        setConfirmDelete(false);
    };

    const handleOpenModal = () => {
        setModalIsOpen(true)
    }
    const handleCloseModal = () => {
        setModalIsOpen(false)
    }
    const handleCloseEscape = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape') {
            setModalIsOpen(false)
        }
    }

    const getReportById = (id: number, isActive: string) => {
        if (archiveData?.info) {
            const data = Object.values(archiveData.info).find((item: ITableInfo) => item.id === id) as ITableInfo;
            if (data) {
                setCurrentArchiveData(data);
                setOpenTextArea(true)
                setCreatedNew(false)
                setIsActive(isActive)
                setFileUrl('')

                if (fileAudioRef.current) {
                    fileAudioRef.current.value = '';
                }
                if (fileImageRef.current) {
                    fileImageRef.current.value = '';
                }
                if (fileVideoRef.current) {
                    fileVideoRef.current.value = '';
                }

                setTypeContent('')

                if (data.music) {
                    setTypeContent('music')
                }
                if (data.video) {
                    setTypeContent('video')
                }
                if (data.image) {
                    setTypeContent('image')
                }
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (typeContent === 'image') {
                if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/webp') {
                    setFileError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, ,jpg или .gif');
                    return;
                }
                else {
                    setFileError('')
                }

                setFileError(null);
                const render = new FileReader()
                render.onloadend = () => {
                    setFileUrl(render.result as string)
                }
                render.readAsDataURL(file)
                console.log('Загруженный файл:', file);
            }

            if (typeContent === 'music') {
                if (file.type !== 'audio/mpeg') {
                    setFileError('Неверный формат файла. Пожалуйста, загрузите файл в формате .mp3');
                    return;
                }
                else {
                    setFileError('')
                }

                if (file.size > maxAudioSize) {
                    setFileError('Размер файла превышает 15 MB. Пожалуйста, загрузите файл меньшего размера.');
                    return;
                }
                else {
                    setFileError('')
                }

                setFileError(null);
                const render = new FileReader()
                render.onloadend = () => {
                    setFileUrl(render.result as string)
                }
                render.readAsDataURL(file)
                console.log('Загруженный файл:', file);
            }

            if (typeContent === 'video') {
                if (file.type !== 'video/mp4') {
                    setFileError('Неверный формат файла. Пожалуйста, загрузите файл в формате .mp4');
                    return;
                }
                else {
                    setFileError('')
                }

                if (file.size > maxVideoSize) {
                    setFileError('Размер файла превышает 30 MB. Пожалуйста, загрузите файл меньшего размера.');
                    return;
                }
                else {
                    setFileError('')
                }

                setFileError(null);
                const render = new FileReader()
                render.onloadend = () => {
                    setFileUrl(render.result as string)
                }
                render.readAsDataURL(file)
                console.log('Загруженный файл:', file);
            }
        }
    };

    const getNewReport = () => {
        setCreatedNew(true)
        setOpenTextArea(true)
    }

    useEffect(() => {
        if (createdNew) {
            setOpenTextArea(true)
            setIsActive('')
            setTypeContent('')
            setFileUrl('')
            newNumberInput.setValue('')
            if (fileAudioRef.current) {
                fileAudioRef.current.value = '';
            }
            if (fileImageRef.current) {
                fileImageRef.current.value = '';
            }
            if (fileVideoRef.current) {
                fileVideoRef.current.value = '';
            }
        }
    }, [createdNew]);

    useEffect(() => {
        if (confirmDelete) {
            setTimeout(() => setDisabledDelete(false), 1500)
        }
    }, [confirmDelete]);

    useEffect(() => {
        if (dateInput.value > moment().format('YYYY-MM-DD')) {
            setDateInputError(true)
        }
        else setDateInputError(false)

        if (newDateInput.value > moment().format('YYYY-MM-DD')) {
            setNewDateInputError(true)
        }
        else setNewDateInputError(false)
    }, [dateInput.value, newDateInput.value]);

    useEffect(() => {
        if (currentArchiveData && !createdNew) {
            dateInput.setValue(currentArchiveData?.date || '')
            numberInput.setValue(currentArchiveData?.number || '')
            textInput.setValue(currentArchiveData?.text || '')
        }
    }, [currentArchiveData, createdNew]);

    useEffect(() => {
        if (typeContent !== '') {
            setFileUrl('')
        }
    }, [typeContent]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'archive_addInfo_root'}>
            <div>
                <div className={`archive_add_inputs archive_add_reports`}>
                    <div className={'add_reports_root'}>
                        <div>
                            <div className={'reports_filters'}>
                                <h3>Список Пятниц</h3>
                                {(!loading && !currentArchiveData && archiveData?.info.length === 0 && !createdNew) &&
                                    <div className={'create_first_report'}>
                                        <span>Не написано ни одного итога. Желаете создать своё первое творение?</span>
                                        <Button variant={'outlined'} onClick={() => setCreatedNew(true)}>Создать</Button>
                                    </div>
                                }
                                {(!loading && archiveData?.info) &&
                                    <div className={'reports_add_list'}>
                                        {Object.values(archiveData.info).sort((a: ITableInfo, b: ITableInfo) => a.number - b.number).map((report: ITableInfo, index: number) => (
                                            <Button variant={'outlined'} sx={{margin: '0 3px', padding: '5px', minWidth: '160px'}} className={isActive === `${report.number}` ? 'reports_list active' : 'reports_list'} key={report.number || index}
                                                 onClick={() => getReportById(report.id, report.number.toString())}>
                                                <span>Пятница #{report?.number}</span>
                                            </Button>
                                        ))}
                                        {(createdNew) ?
                                            <Button variant={'outlined'} sx={{margin: '0 3px', padding: '5px', minWidth: '160px'}} className={'reports_list active'} onClick={getNewReport}>
                                                <span>Новая Пятница</span>
                                            </Button>
                                            : (currentArchiveData || archiveData.info.length !== 0) &&
                                            <Button variant={'outlined'} onClick={() => setCreatedNew(true)}
                                                    disabled={disabledCreateReport}>
                                                <span>+</span>
                                            </Button>
                                        }
                                    </div>
                                }
                            </div>
                            {(openTextArea && !createdNew) &&
                                <div className={'reports_form'}>
                                    <div className={'form_block'} style={{alignItems: typeContent === 'music' && 'center'}}>
                                        <form>
                                            <div className={'filter_buttons_fill'}>
                                                <span>Тип пятницы:</span>
                                                <Select variant={'filled'} value={typeContent}
                                                        onChange={(e) => setTypeContent(e.target.value)}>
                                                    <MenuItem value={''} disabled hidden>Выберите тип пятницы...</MenuItem>
                                                    <MenuItem value={'image'}>Изображение</MenuItem>
                                                    <MenuItem value={'video'}>Видео</MenuItem>
                                                    <MenuItem value={'music'}>Аудио</MenuItem>
                                                </Select>
                                            </div>
                                            <div>
                                                <label>Номер пятницы:
                                                    <input type={'number'} min={0}
                                                           value={numberInput.value}
                                                           onChange={(e) => numberInput.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div>
                                                {typeContent === 'image' &&
                                                    <label>Выберите изображение:
                                                        <input type={'file'} accept={'.png, .jpg, .jpeg, .gif, .webp'}
                                                               onChange={handleFileChange} ref={fileImageRef}/>
                                                    </label>
                                                }
                                                {typeContent === 'video' &&
                                                    <label>Выберите видео:
                                                        <input type={'file'} accept={'.mp4'}
                                                               onChange={handleFileChange} ref={fileVideoRef}/>
                                                    </label>
                                                }
                                                {typeContent === 'music' &&
                                                    <label>Выберите аудио:
                                                        <input type={'file'} accept={'.mp3'}
                                                               onChange={handleFileChange} ref={fileAudioRef}/>
                                                    </label>
                                                }
                                                {fileError && <span color={'red'}>{fileError}</span>}
                                            </div>
                                            <div
                                                className={dateInputError ? 'report_date_input error' : 'report_date_input'}>
                                                <label>Дата Пятницы:
                                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                                        <DatePicker
                                                            value={moment(dateInput.value)}
                                                            onChange={(e) => dateInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                                            maxDate={moment()}
                                                        />
                                                    </LocalizationProvider>
                                                </label>
                                            </div>
                                            <div className={'textfield_multi'}>
                                                <TextField
                                                    multiline
                                                    variant={'outlined'}
                                                    label={'Текст Пятницы (при необходимости)'}
                                                    placeholder={placeholder}
                                                    minRows={2}
                                                    sx={{
                                                        '&::before': {
                                                            border: '1.5px solid var(--Textarea-focusedHighlight)',
                                                            transform: 'scaleX(0)',
                                                            left: '2.5px',
                                                            right: '2.5px',
                                                            bottom: 0,
                                                            top: 'unset',
                                                            transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
                                                            borderRadius: 0,
                                                            borderBottomLeftRadius: '64px 20px',
                                                            borderBottomRightRadius: '64px 20px',
                                                        },
                                                        '&:focus-within::before': {
                                                            transform: 'scaleX(1)',
                                                        },
                                                    }}
                                                    value={textInput.value}
                                                    onChange={(e) => textInput.onChange(e)}
                                                />
                                            </div>
                                        </form>
                                        <div className={'file_preview'}>
                                            {(currentArchiveData?.music && typeContent === 'music' && !fileUrl) &&
                                                <div>
                                                    <audio controls src={`${currentArchiveData?.music}`}
                                                           autoPlay={false}/>
                                                </div>
                                            }
                                            {(currentArchiveData?.image && typeContent === 'image' && !fileUrl) &&
                                                <div>
                                                    <img src={`${currentArchiveData?.image}`} alt={'friday_image'} onClick={handleOpenModal} style={{cursor: 'pointer'}}/>
                                                    <Modal open={modalIsOpen} onClose={handleCloseModal} onKeyDown={handleCloseEscape}>
                                                        <Button variant={'outlined'} onClick={handleCloseModal}>x</Button>
                                                        <img src={`${currentArchiveData?.image}`} alt={'friday_image'}/>
                                                    </Modal>
                                                </div>
                                            }
                                            {(currentArchiveData?.video && typeContent === 'video' && !fileUrl) &&
                                                <div>
                                                    <video controls src={`${currentArchiveData?.video}`} autoPlay={false}/>
                                                </div>
                                            }
                                            {(fileUrl && typeContent === 'music') &&
                                                <div className={'audio_review'}>
                                                    <audio controls src={`${fileUrl}`} autoPlay={false}/>
                                                </div>
                                            }
                                            {(fileUrl && typeContent === 'image') &&
                                                <div>
                                                    <img src={fileUrl} alt={'friday_image'} onClick={handleOpenModal} style={{cursor: 'pointer'}}/>
                                                    <Modal open={modalIsOpen} onClose={handleCloseModal} onKeyDown={handleCloseEscape}>
                                                        <Button variant={'outlined'} onClick={handleCloseModal}>x</Button>
                                                        <img src={fileUrl} alt={'friday_image'}/>
                                                    </Modal>
                                                </div>
                                            }
                                            {(fileUrl && typeContent === 'video') &&
                                                <div>
                                                    <video controls src={`${fileUrl}`} autoPlay={false}/>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className={'reports_save_delete_buttons'}>
                                        {confirmDelete ?
                                            <>
                                                <p>Вы уверены, что хотите удалить эту пятницу?</p>
                                                <Button variant={'outlined'} onClick={() => setConfirmDelete(false)}>Нет</Button>
                                                <Button variant={'outlined'} onClick={() => deleteReport(currentArchiveData.id)}
                                                        disabled={disabledDelete}>Да</Button>
                                            </>
                                            :
                                            <>
                                                <Button variant={'outlined'} disabled={posting}
                                                        onClick={() => setConfirmDelete(true)}>Удалить</Button>
                                                <Button variant={'outlined'}
                                                    disabled={posting || dateInputError || dateInput.value === '' || (dateInput.value === currentArchiveData?.report_date)}
                                                    onClick={createNewReport}>
                                                    Сохранить
                                                </Button>
                                            </>
                                        }
                                    </div>
                                </div>
                            }
                            {(openTextArea && createdNew) &&
                                <div className={'reports_form'}>
                                    <div className={'form_block'} style={{alignItems: typeContent === 'music' && 'center'}}>
                                        <form>
                                            <div className={'filter_buttons_fill'}>
                                                <span>Тип пятницы:</span>
                                                <Select variant={'filled'} value={typeContent} label={'Выберите тип пятницы'}
                                                        onChange={(e) => setTypeContent(e.target.value)}>
                                                    <MenuItem value={''} hidden disabled>Выберите тип пятницы...</MenuItem>
                                                    <MenuItem value={'image'}>Изображение</MenuItem>
                                                    <MenuItem value={'video'}>Видео</MenuItem>
                                                    <MenuItem value={'music'}>Аудио</MenuItem>
                                                </Select>
                                            </div>
                                            <div className={'add_fridays_input'}>
                                                <label>Номер пятницы:
                                                    <input type={'number'} min={0}
                                                           value={newNumberInput.value}
                                                           onChange={(e) => newNumberInput.onChange(e)}/>
                                                </label>
                                            </div>
                                            <div className={'add_fridays_input'}>
                                                {typeContent === 'image' &&
                                                    <label>Выберите изображение:
                                                        <input type={'file'} accept={'.png, .jpg, .jpeg, .gif, .webp'}
                                                               onChange={handleFileChange} ref={fileImageRef}/>
                                                    </label>
                                                }
                                                {typeContent === 'video' &&
                                                    <label>Выберите видео:
                                                        <input type={'file'} accept={'.mp4'}
                                                               onChange={handleFileChange} ref={fileVideoRef}/>
                                                    </label>
                                                }
                                                {typeContent === 'music' &&
                                                    <label>Выберите аудио:
                                                        <input type={'file'} accept={'.mp3'}
                                                               onChange={handleFileChange} ref={fileAudioRef}/>
                                                    </label>
                                                }
                                                {fileError && <span color={'red'}>{fileError}</span>}
                                            </div>
                                            <div
                                                className={dateNewInputError ? 'report_date_input error' : 'report_date_input'}>
                                                <label>Дата пятницы:
                                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                                        <DatePicker
                                                            value={moment(newDateInput.value)}
                                                            onChange={(e) => newDateInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                                            maxDate={moment()}
                                                        />
                                                    </LocalizationProvider>
                                                </label>
                                            </div>
                                            <div className={'textfield_multi'}>
                                                <TextField
                                                    multiline
                                                    variant={'outlined'}
                                                    label={'Текст Пятницы (при необходимости)'}
                                                    placeholder={placeholder}
                                                    minRows={2}
                                                    sx={{
                                                        '&::before': {
                                                            border: '1.5px solid var(--Textarea-focusedHighlight)',
                                                            transform: 'scaleX(0)',
                                                            left: '2.5px',
                                                            right: '2.5px',
                                                            bottom: 0,
                                                            top: 'unset',
                                                            transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
                                                            borderRadius: 0,
                                                            borderBottomLeftRadius: '64px 20px',
                                                            borderBottomRightRadius: '64px 20px',
                                                        },
                                                        '&:focus-within::before': {
                                                            transform: 'scaleX(1)',
                                                        },
                                                    }}
                                                    value={newTextInput.value}
                                                    onChange={(e) => newTextInput.onChange(e)}
                                                />
                                            </div>
                                        </form>
                                        <div className={'file_preview'}>
                                            {(fileUrl && typeContent === 'music') &&
                                                <div>
                                                    <audio controls src={`${fileUrl}`} autoPlay={false}/>
                                                </div>
                                            }
                                            {(fileUrl && typeContent === 'image') &&
                                                <div>
                                                    <img src={fileUrl} alt={'friday_image'} onClick={handleOpenModal}
                                                         style={{cursor: 'pointer'}}/>
                                                    <Modal open={modalIsOpen} onClose={handleCloseModal}
                                                           onKeyDown={handleCloseEscape}>
                                                        <Button variant={'outlined'}
                                                                onClick={handleCloseModal}>x</Button>
                                                        <img src={fileUrl} alt={'friday_image'}/>
                                                    </Modal>
                                                </div>
                                            }
                                            {(fileUrl && typeContent === 'video') &&
                                                <div className={'audio_review'}>
                                                    <video controls src={`${fileUrl}`} autoPlay={false}/>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className={'reports_save_delete_buttons'}>
                                        <Button variant={'outlined'}
                                                disabled={posting || dateNewInputError || newDateInput.value === ''}
                                                onClick={createNewReport}>
                                            Создать
                                        </Button>
                                    </div>
                                </div>
                            }
                            <NotificationComponent/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddFridays