import React, {useEffect, useRef, useState} from "react";
import './AddRoundTable.css'
import useInput from "../../../../hooks/useInput.tsx";
import Loading from "../../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {useNotification} from "../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../redux";
import moment from "moment";
import {Button, TextField} from "@mui/material";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import {DatePicker, DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {tablePlaceholders} from "../../../../placeholders/tablePlaceholders.tsx";

interface ITableInfo {
    author: string,
    custom_nickname: string,
    date: string,
    date_created: string,
    date_end: string,
    date_modified: string,
    date_start: string,
    id: number,
    number: number,
    text: string,
    image: string
}

interface ITable {
    status: boolean,
    info: {
        length: number,
        [key: number]: {
            author: string,
            custom_nickname: string,
            date: string,
            date_created: string,
            date_end: string,
            date_modified: string,
            date_start: string,
            id: number,
            number: number,
            text: string,
            image: string
        }
    }
}

const AddRoundTable:React.FC = () => {

    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [openTextArea, setOpenTextArea] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [disabledDelete, setDisabledDelete] = useState(true);
    const [dateInputError, setDateInputError] = useState(false);
    const [dateNewInputError, setNewDateInputError] = useState(false);
    const [disabledCreateReport, setDisabledCreateReport] = useState(true)
    const [createdNew, setCreatedNew] = useState(false)

    const reportInput = useInput('', {})
    const dateInput = useInput('', {})
    const dateStartInput = useInput('', {})
    const dateEndInput = useInput('', {})
    const numberInput = useInput('', {})
    const [hideReport, setHideReport] = useState('0')

    const newReportInput = useInput('', {})
    const newDateInput = useInput('', {})
    const newDateStartInput = useInput('', {})
    const newDateEndInput = useInput('', {})
    const newNumberInput = useInput('', {})
    const [newHideReport, setNewHideReport] = useState('0')

    const token = localStorage.getItem('token')

    const [archiveData, setArchiveData] = useState<ITable | null>(null);
    const [currentArchiveData, setCurrentArchiveData] = useState(null);

    const userData = useSelector((state: RootState) => state.myData)
    const server = useSelector((state: RootState) => state.server.server)
    const {showNotification, NotificationComponent} = useNotification()

    const imageRef = useRef<HTMLInputElement | null>(null)
    const [fileError, setFileError] = useState('')
    const [fileUrl, setFileUrl] = useState('')

    const [isActive, setIsActive] = useState('')

    const [placeholder, setPlaceholder] = useState("");

    useEffect(() => {
        const keys = Object.keys(tablePlaceholders);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setPlaceholder(tablePlaceholders[randomKey]);
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
                body: JSON.stringify({token: token, action: 'getAllRoundTables'})
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

    const createNewReport = async (e: React.FormEvent) => {
        e.preventDefault();

        const numberError =
            (+numberInput.value > 0) || (+newNumberInput.value > 0)

        const updForm = new FormData()
        const newForm = new FormData()

        const updateReportJson = {
            token: token,
            action: 'updateRoundTable',
            data: {
                date: dateInput.value,
                date_created: currentArchiveData?.date_created,
                number: numberInput.value,
                date_start: dateStartInput.value,
                date_end: dateEndInput.value,
                author: userData?.data.info.nickname,
                custom_nickname: userData?.data.info.custom_nickname,
                text: reportInput.value,
                image: null
            },
            conditions: {id: currentArchiveData?.id}
        };

        const newReportJson = {
            token: token,
            action: 'insertRoundTable',
            data: {
                date: newDateInput.value,
                number: newNumberInput.value,
                date_created: new Date().toLocaleDateString(),
                date_start: newDateStartInput.value,
                date_end: newDateEndInput.value,
                author: userData?.data.info.nickname,
                custom_nickname: userData?.data.info.custom_nickname,
                text: newReportInput.value,
                image: null
            }
        }

        if (imageRef && imageRef.current?.files[0]) {
            updForm.append('image', imageRef.current?.files[0])
            newForm.append('image', imageRef.current?.files[0])
        }
        if (!imageRef.current?.files[0]) {
            updateReportJson.data.image = currentArchiveData?.image;
            updForm.append('post', JSON.stringify(updateReportJson));
        }

        updForm.append('post', JSON.stringify(updateReportJson))
        newForm.append('post', JSON.stringify(newReportJson))

        setPosting(true);
        if (numberError) {
            if (createdNew) {
                const res = await fetch(server, {
                    method: 'POST',
                    body: newForm
                } as RequestInit)
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    setPosting(false)
                    showNotification('Что-то пошло не так...', 'error')
                }
                else {
                    showNotification('Данные обновлены', 'success')
                    setPosting(false);
                    newReportInput.setValue('')
                    newDateInput.setValue('')
                    newNumberInput.setValue('')
                    newDateStartInput.setValue('')
                    newDateEndInput.setValue('')
                    setNewHideReport('0')
                }
            }
            else {
                const res = await fetch(server, {
                    method: 'POST',
                    body: updForm
                })
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    showNotification('Что-то пошло не так...', 'error')
                    setPosting(false)
                }
                else {
                    showNotification('Данные обновлены', 'success')
                    setPosting(false)
                }
            }
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllRoundTables'})
                });
                const data = await res.json();
                if (!data.status) {
                    console.log(data.info);
                } else {
                    setArchiveData(data);
                }
            };
            await fetching()
        }
        else {
            showNotification('Такой номер круглого стола уже существует!', "error");
            setPosting(false);
        }
    };

    const deleteReport = async (id: number) => {
        setPosting(true);
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteRoundTable', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data.status) {
            console.log(data.info)
            showNotification('Что-то пошло не так...', 'error')
        }
        else {
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllRoundTables'})
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
                    showNotification('Удаление успешно', 'success')
                }
            };
            await fetching()
        }
        setPosting(false);
        if (!currentArchiveData){
            setOpenTextArea(false);
        }
        else {
            setOpenTextArea(true)
        }
        setConfirmDelete(false);
    };

    const getReportById = (id: number, isActive: string) => {
        if (archiveData?.info) {
            const data = Object.values(archiveData.info).find((item: ITableInfo) => item.id === id);
            if (data) {
                setCurrentArchiveData(data);
                setOpenTextArea(true)
                setCreatedNew(false)
                setIsActive(isActive)
                if (imageRef.current) {
                    imageRef.current.value = '';
                }
                if (fileUrl) {
                    setFileUrl('')
                }
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
            if (imageRef.current) {
                imageRef.current.value = '';
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
    }, [dateInput.value]);

    useEffect(() => {
        if (currentArchiveData && !createdNew) {
            reportInput.setValue(currentArchiveData?.text || '')
            dateInput.setValue(currentArchiveData?.date || '')
            dateStartInput.setValue(currentArchiveData?.date_start || '')
            dateEndInput.setValue(currentArchiveData?.date_end || '')
            numberInput.setValue(currentArchiveData?.number || '')
            setHideReport(currentArchiveData?.hidden || '0')
        }
    }, [currentArchiveData, createdNew]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/webp') {
                setFileError('Неверный формат файла. Пожалуйста, загрузите файл в формате .png, .jpeg, ,jpg или .gif');
                return;
            } else {
                setFileError('')
                const render = new FileReader()
                render.onloadend = () => {
                    setFileUrl(render.result as string)
                }
                render.readAsDataURL(file)
            }
        }
    }

    const deleteImage = async (e: React.FormEvent) => {
        e.preventDefault()
        const updateReportJson = {
            token: token,
            action: 'updateRoundTable',
            data: {
                date: currentArchiveData.date,
                date_created: currentArchiveData?.date_created,
                number: currentArchiveData.number,
                date_start: currentArchiveData.date_start,
                date_end: currentArchiveData.date_end,
                author: currentArchiveData?.author,
                custom_nickname: currentArchiveData?.custom_nickname,
                text: currentArchiveData.text,
                image: null
            },
            conditions: {id: currentArchiveData.id}
        };
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify(updateReportJson)
        } as RequestInit)
        const data = await res.json()
        if (!data.status) {
            console.log(data.info)
            setPosting(false)
            showNotification('Что-то пошло не так...', 'error')
        } else {
            showNotification('Данные обновлены', 'success')
            setPosting(false);
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllRoundTables'})
                })
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                } else {
                    setArchiveData(data)
                    setLoading(false)
                }
            }
            await fetching()
            setFileUrl('')
            if (imageRef.current) {
                imageRef.current.value = ''
            }
            if (currentArchiveData) {
                currentArchiveData.image = ''
            }
        }
    }

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
                                <h3>Список итогов Круглых Столов</h3>
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
                                                <span>Круглый Стол #{report?.number}</span>
                                            </Button>
                                        ))}
                                        {(createdNew) ?
                                            <Button variant={'outlined'} sx={{margin: '0 3px', padding: '5px'}} className={'reports_list active'} onClick={getNewReport}>
                                                <span>Круглый Стол</span>
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
                                    <form>
                                        <div className={'rt_form_notext'}>
                                            <div>
                                                <div>
                                                    <label>Номер Круглого Стола:
                                                        <input type={'number'} min={0}
                                                               value={numberInput.value}
                                                               onChange={(e) => numberInput.onChange(e)}/>
                                                    </label>
                                                </div>
                                                <div className={dateInputError ? 'report_date_input error' : 'report_date_input'}>
                                                    <label>Дата Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DatePicker
                                                                value={moment(dateInput.value)}
                                                                onChange={(e) => dateInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                                                maxDate={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label>Начало Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DateTimePicker
                                                                viewRenderers={{
                                                                    hours: null,
                                                                    minutes: null,
                                                                    seconds: null,
                                                                }}
                                                                value={moment(dateStartInput.value)}
                                                                onChange={(e) => dateStartInput.setValue(moment(e).format('YYYY-MM-DD HH:mm'))}
                                                                maxDateTime={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                    <label>Конец Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DateTimePicker
                                                                viewRenderers={{
                                                                    hours: null,
                                                                    minutes: null,
                                                                    seconds: null,
                                                                }}
                                                                value={moment(dateEndInput.value)}
                                                                onChange={(e) => dateEndInput.setValue(moment(e).format('YYYY-MM-DD HH:mm'))}
                                                                maxDateTime={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label>Изображение с Круглого Стола (опционально):
                                                        <input type={'file'} onChange={handleFileChange}
                                                               accept={'.png, .jpg, .jpeg, .gif, .webp'} ref={imageRef}/>
                                                    </label>
                                                    {fileError && <span>{fileError}</span>}
                                                </div>
                                                {(currentArchiveData?.image || fileUrl) &&
                                                    <div>
                                                        <Button variant={'outlined'} onClick={deleteImage}>Удалить изображение</Button>
                                                    </div>
                                                }
                                            </div>
                                            {(fileUrl || currentArchiveData?.image) &&
                                                <div className={'image_rt_preview'}>
                                                    {fileUrl ?
                                                        <img src={`${fileUrl}`} alt={'image'}/>
                                                        :
                                                        <img src={`${currentArchiveData.image}`} alt={'image'}/>
                                                    }
                                                </div>
                                            }
                                        </div>
                                        <div className={'reports_textarea'}>
                                            <TextField
                                                multiline
                                                variant={'outlined'}
                                                label={'Итоги Круглого Стола'}
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
                                                value={reportInput.value}
                                                onChange={(e) => reportInput.onChange(e)}
                                            />
                                            <div className={'hints_html'}>
                                                <div className={'hints_html_first'}>
                                                    <span>Подсказки:</span>
                                                </div>
                                                <div className={'hints_html_second'}>
                                                    <span>Кастомизация не поддерживается.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className={'reports_save_delete_buttons'}>
                                        {confirmDelete ?
                                            <>
                                                <p>Вы уверены, что хотите удалить этот Круглый Стол?</p>
                                                <Button variant={'outlined'} onClick={() => setConfirmDelete(false)}>Нет</Button>
                                                <Button variant={'outlined'} onClick={() => deleteReport(currentArchiveData.id)}
                                                        disabled={disabledDelete}>Да</Button>
                                            </>
                                            :
                                            <>
                                                <Button variant={'outlined'} disabled={posting || (!currentArchiveData?.text)}
                                                        onClick={() => setConfirmDelete(true)}>Удалить</Button>
                                                <Button variant={'outlined'}
                                                    disabled={posting || dateInputError || (reportInput.value === '' || dateInput.value === '' || hideReport === '') || (reportInput.value === currentArchiveData?.text && dateInput.value === currentArchiveData?.report_date)}
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
                                    <form>
                                        <div className={'rt_form_notext'}>
                                            <div>
                                                <div>
                                                    <label>Номер Круглого Стола:
                                                        <input type={'number'} min={0}
                                                               value={newNumberInput.value}
                                                               onChange={(e) => newNumberInput.onChange(e)}/>
                                                    </label>
                                                </div>
                                                <div
                                                    className={dateNewInputError ? 'report_date_input error' : 'report_date_input'}>
                                                    <label>Дата Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DatePicker
                                                                value={moment(newDateInput.value)}
                                                                onChange={(e) => newDateInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                                                maxDate={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label>Начало Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DateTimePicker
                                                                viewRenderers={{
                                                                    hours: null,
                                                                    minutes: null,
                                                                    seconds: null,
                                                                }}
                                                                value={moment(newDateStartInput.value)}
                                                                onChange={(e) => newDateStartInput.setValue(moment(e).format('YYYY-MM-DD HH:mm'))}
                                                                maxDateTime={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                    <label>Конец Круглого Стола:
                                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                                            <DateTimePicker
                                                                viewRenderers={{
                                                                    hours: null,
                                                                    minutes: null,
                                                                    seconds: null,
                                                                }}
                                                                value={moment(newDateEndInput.value)}
                                                                onChange={(e) => newDateEndInput.setValue(moment(e).format('YYYY-MM-DD HH:mm'))}
                                                                maxDateTime={moment()}
                                                            />
                                                        </LocalizationProvider>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label>Изображение с Круглого Стола (опционально):
                                                        <input type={'file'} onChange={handleFileChange}
                                                               accept={'.png, .jpg, .jpeg, .gif, .webp'} ref={imageRef}/>
                                                    </label>
                                                    {fileError && <span>{fileError}</span>}
                                                </div>
                                            </div>
                                            {fileUrl &&
                                                <div className={'image_rt_preview'}>
                                                    <img src={`${fileUrl}`} alt={'image'}/>
                                                </div>
                                            }
                                        </div>
                                        <div className={'reports_textarea'}>
                                            <TextField
                                                multiline
                                                variant={'outlined'}
                                                label={'Итоги Круглого Стола'}
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
                                                value={newReportInput.value}
                                                onChange={(e) => newReportInput.onChange(e)}
                                            />
                                            <div className={'hints_html'}>
                                                <div className={'hints_html_first'}>
                                                    <span>Подсказки:</span>
                                                </div>
                                                <div className={'hints_html_second'}>
                                                    <span>Кастомизация не поддерживается.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className={'reports_save_delete_buttons'}>
                                        <Button variant={'outlined'}
                                            disabled={posting || dateNewInputError || (newReportInput.value === '' || newDateInput.value === '' || newHideReport === '')}
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
export default AddRoundTable