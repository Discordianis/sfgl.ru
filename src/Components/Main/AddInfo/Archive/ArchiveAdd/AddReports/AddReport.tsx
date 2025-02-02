import React, {useEffect, useRef, useState} from "react";
import './AddReport.css'
import Button from "../../../../../Button/Button.tsx";
import useInput from "../../../../../../hooks/useInput.tsx";
import Loading from "../../../../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {useNotification} from "../../../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../../../redux";
import moment from "moment";

interface IReportInfo {
    created_date: string,
    date_modified: string,
    hidden: string,
    id: number,
    report_date: string,
    text: string,
    user_id: string,
    user_nickname: string,
    no_format: string
}

interface IReport {
    status: boolean,
    info: {
        length: number,
        [key: number]: {
            created_date: string,
            date_modified: string,
            hidden: string,
            id: number,
            report_date: string,
            text: string,
            user_id: string,
            user_nickname: string,
            no_format: string
        }
    }
}

const AddReport: React.FC = () => {

    const [warningMessageOpened, setWarningMessageOpened] = useState(true)
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [openTextArea, setOpenTextArea] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [disabledDelete, setDisabledDelete] = useState(true);
    const [dateInputError, setDateInputError] = useState(false);
    const [dateNewInputError, setNewDateInputError] = useState(false);
    const [disabledCreateReport, setDisabledCreateReport] = useState(true)
    const [createdNew, setCreatedNew] = useState(false)

    const [noFormatEdit, setNoFormatEdit] = useState<'0' | '1' | string>('0')
    const [noFormatNew, setNoFormatNew] = useState<'0' | '1' | string>('0')

    const reportInput = useInput('', {})
    const dateInput = useInput('', {})
    const [hideReport, setHideReport] = useState('0')

    const newReportInput = useInput('', {})
    const newDateInput = useInput('', {})
    const [newHideReport, setNewHideReport] = useState('0')

    const acknowledged = localStorage.getItem('report_acknowledged')
    const token = localStorage.getItem('token')

    const [archiveData, setArchiveData] = useState<IReport | null>(null);
    const [currentArchiveData, setCurrentArchiveData] = useState(null);

    const userData = useSelector((state: RootState) => state.myData)
    const server = useSelector((state: RootState) => state.server.server)
    const {showNotification, NotificationComponent} = useNotification()

    const [isActivs, setIsActive] = useState('')
    const imageRef = useRef<HTMLInputElement | null>(null)
    const [fileUrl, setFileUrl] = useState('')
    const [fileError, setFileError] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
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

    useEffect(() => {
        if (!warningMessageOpened) {
            localStorage.setItem('report_acknowledged', 'true')
        }
    }, [warningMessageOpened]);

    useEffect(() => {
        if (acknowledged) {
            setWarningMessageOpened(false)
        }
    }, [acknowledged]);

    useEffect(() => {
        if (createdNew) {
            setDisabledCreateReport(true)
        } else {
            setDisabledCreateReport(false)
        }
    }, [createdNew]);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getMyReports'})
            })
            const data = await res.json()
            if (!data.status) {
                console.log(data.info)
            } else {
                setArchiveData(data)
                setLoading(false)
            }
        }
        fetching()
    }, [server, token]);

    const createNewReport = async (e: React.FormEvent) => {
        e.preventDefault();

        const updForm = new FormData()
        const newForm = new FormData()

        const updateReportJson = {
            token: token,
            action: 'updateMyReport',
            data: {
                report_date: dateInput.value,
                created_date: currentArchiveData?.created_date,
                date_modified: new Date().toLocaleDateString(),
                hidden: hideReport,
                user_nickname: userData?.data.info.custom_nickname,
                text: reportInput.value,
                no_format: noFormatEdit,
            },
            conditions: {id: currentArchiveData?.id}
        };

        const newReportJson = {
            token: token,
            action: 'insertMyReport',
            data: {
                report_date: newDateInput.value,
                created_date: new Date().toLocaleDateString(),
                hidden: newHideReport,
                user_nickname: userData?.data.info.custom_nickname,
                text: newReportInput.value,
                no_format: noFormatNew,
                image: null
            }
        };

        if (imageRef.current) {
            updForm.append('image', imageRef.current.files[0])
        }

        newForm.append('post', JSON.stringify(newReportJson))
        updForm.append('post', JSON.stringify(updateReportJson))

        setPosting(true);
        try {
            if (createdNew) {
                const res = await fetch(server, {
                    method: 'POST',
                    body: newForm
                } as RequestInit)
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    showNotification('Что-то пошло не так...', 'error')
                } else {
                    showNotification('Данные обновлены', 'success')
                }
            } else {
                const res = await fetch(server, {
                    method: 'POST',
                    body: updForm
                } as RequestInit)
                const data = await res.json()
                if (!data.status) {
                    console.log(data.info)
                    showNotification('Что-то пошло не так...', 'error')
                } else {
                    showNotification('Данные обновлены', 'success')
                }
            }
            newReportInput.setValue('')
            newDateInput.setValue('')
            setNewHideReport('0')
        } finally {
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getMyReports'})
                });
                const data = await res.json();
                if (!data.status) {
                    console.log(data.info);
                } else {
                    setArchiveData(data);
                }
            };
            await fetching()
            setPosting(false);
        }
    };

    const deleteReport = async (id: number) => {
        setPosting(true);
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({token: token, action: 'deleteMyReport', conditions: {id: id}})
        })
        const data = await res.json()
        if (!data.status) {
            console.log(data.info)
            showNotification('Что-то пошло не так...', 'error')
        } else {
            const fetching = async () => {
                const res = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getMyReports'})
                });
                const data = await res.json();
                if (!data.status) {
                    console.log(data.info);
                    showNotification('Что-то пошло не так...', 'error')
                } else {
                    setArchiveData(data);
                    const idsArray = Object.values(data?.info).map((ids: IReportInfo) => ids.id);
                    const maxId = Math.max(...idsArray);
                    const newData = data.info.find((item: IReportInfo) => item.id.toString() === maxId.toString());
                    setCurrentArchiveData(newData);
                    showNotification('Удаление успешно', 'success')
                }
            };
            await fetching()
        }
        setPosting(false);
        if (!currentArchiveData.info) {
            setOpenTextArea(false);
        } else {
            setOpenTextArea(true)
        }
        setConfirmDelete(false);
    };

    const getReportById = (id: number, active: string) => {
        if (archiveData?.info) {
            const data = Object.values(archiveData.info).find((item: IReportInfo) => item.id === id);
            if (data) {
                setCurrentArchiveData(data);
                setOpenTextArea(true)
                setCreatedNew(false)
                setIsActive(active)
                if (imageRef.current) {
                    imageRef.current.value = '';
                }
                if (fileUrl) {
                    setFileUrl('')
                }
            }
        }
    };

    const deleteImage = async (e: React.FormEvent) => {
        e.preventDefault()
        const deleteReportJson = {
            token: token,
            action: 'updateMyReport',
            data: {
                report_date: currentArchiveData.report_date,
                created_date: currentArchiveData?.created_date,
                date_modified: currentArchiveData.date_modified,
                hidden: currentArchiveData.hidden,
                user_nickname: currentArchiveData?.user_nickname,
                text: currentArchiveData.text,
                image: null
            },
            conditions: {id: currentArchiveData.id}
        };
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify(deleteReportJson)
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
                    body: JSON.stringify({token: token, action: 'getMyReports'})
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

    useEffect(() => {
        if (!createdNew && currentArchiveData) {
            getReportById(currentArchiveData?.id, currentArchiveData?.id.toString())
        }
    }, [archiveData, createdNew]);

    const reformDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        if (!year || !month || !day) return null;
        return `${day}.${month}.${year}`;
    };

    const getNewReport = () => {
        setCreatedNew(true)
        setOpenTextArea(true)
    }

    useEffect(() => {
        if (createdNew) {
            setOpenTextArea(true)
            setIsActive('')
        }
    }, [createdNew]);

    useEffect(() => {
        if (confirmDelete) {
            setTimeout(() => setDisabledDelete(false), 1500)
        }
    }, [confirmDelete]);

    useEffect(() => {
        if (dateInput.value > moment().format('YYYY-MM-DD[T]HH:mm')) {
            setDateInputError(true)
            console.log(dateInput.value)
        } else setDateInputError(false)

        if (newDateInput.value > moment().format('YYYY-MM-DD[T]HH:mm')) {
            setNewDateInputError(true)
            console.log(newDateInput.value)
        } else setNewDateInputError(false)
    }, [dateInput.value, newDateInput.value]);

    useEffect(() => {
        if (currentArchiveData && !createdNew) {
            reportInput.setValue(currentArchiveData?.text || '')
            dateInput.setValue(currentArchiveData?.report_date || '')
            setHideReport(currentArchiveData?.hidden || '0')
            setNoFormatEdit(currentArchiveData?.no_format || '0')
        }
    }, [currentArchiveData, createdNew]);

    if (loading) {
        return <Loading/>
    }

    return (
        <div className={'add_reports_root'}>
            {warningMessageOpened &&
                <div className={'reports_rules'}>
                    <div>
                        <div>
                            <h3>Перед написанием отчёта, пожалуйста, ознакомьтесь с описанием, правилами, условиями и
                                рекомендациями!</h3>
                            <span>Отчёты показывают, как люди реагируют на появление отношений или их разрушение. Также отчёты показывают изменение мнений людей насчёт отношений и любви в целом.</span>
                            <span>Количество отчетов и количество символов в них не ограничено.</span>
                            <span>Запрещена ненормативная лексика.</span>
                            <span>Рекомендации, учёт которых необязателен, но будет плюсом в карму: литературный стиль отчётов.</span>
                        </div>
                    </div>
                </div>
            }
            {warningMessageOpened && <Button onClick={() => setWarningMessageOpened(false)}>Подтвердить</Button>}
            {!warningMessageOpened &&
                <div>
                    <div className={'reports_filters'}>
                        <h3>Список отчётов</h3>
                        {(!loading && !currentArchiveData && archiveData?.info.length === 0 && !createdNew) &&
                            <div className={'create_first_report'}>
                                <span>Вы не написали ни одного отчёта. Желаете создать своё первое творение?</span>
                                <Button onClick={() => setCreatedNew(true)}>Создать</Button>
                            </div>
                        }
                        {(!loading && archiveData?.info) &&
                            <div className={'reports_add_list'}>
                                {Object.values(archiveData.info).map((report: IReportInfo, index: number) => (
                                    <div
                                        className={isActivs === `${report.id}` ? 'reports_list active' : 'reports_list'}
                                        key={report.id || index}
                                        onClick={() => getReportById(report.id, report.id.toString())}>
                                        <span>Отчёт от {reformDate(report?.report_date)}</span>
                                    </div>
                                ))}
                                {(createdNew) ?
                                    <div className={'reports_list active'} onClick={getNewReport}>
                                        <span>Новый отчёт</span>
                                    </div>
                                    : (currentArchiveData || archiveData.info.length !== 0) &&
                                    <Button onClick={() => setCreatedNew(true)} disabled={disabledCreateReport}>
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
                                        <div
                                            className={dateInputError ? 'report_date_input error' : 'report_date_input'}>
                                            <label>Дата отчёта:
                                                <input type={'datetime-local'} max={moment().format('YYYY-MM-DD HH:mm')}
                                                       value={dateInput.value} onChange={(e) => dateInput.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Изображение для отчёта (опционально):
                                                <input type={'file'} onChange={handleFileChange}
                                                       accept={'.png, .jpg, .jpeg, .gif'} ref={imageRef}/>
                                            </label>
                                            {fileError && <span>{fileError}</span>}
                                        </div>
                                        {(currentArchiveData?.image || fileUrl) &&
                                            <div>
                                                <Button onClick={deleteImage}>Удалить изображение</Button>
                                            </div>
                                        }
                                        <span>Конфиденциальность:</span>
                                        <div className={'filter_buttons'}>
                                            <select value={hideReport} onChange={(e) => setHideReport(e.target.value)}>
                                                <option value={'0'}>Не скрывать отчёт</option>
                                                <option value={'1'}>Скрыть отчёт</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span>Включить форматирование?</span>
                                            <label className="switch">
                                                <input type="checkbox" value={noFormatEdit}
                                                       checked={noFormatEdit === '0'}
                                                       onChange={() => setNoFormatEdit(noFormatEdit === '1' ? '0' : '1')}/>
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
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
                                    <textarea rows={30} value={reportInput.value}
                                              onChange={(e) => reportInput.onChange(e)}
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
                            </form>
                            <div className={'reports_save_delete_buttons'}>
                                {confirmDelete ?
                                    <>
                                        <p>Вы уверены, что хотите удалить этот отчёт?</p>
                                        <Button onClick={() => setConfirmDelete(false)}>Нет</Button>
                                        <Button onClick={() => deleteReport(currentArchiveData.id)}
                                                disabled={disabledDelete}>Да</Button>
                                    </>
                                    :
                                    <>
                                        <Button disabled={posting || (!currentArchiveData?.text)}
                                                onClick={() => setConfirmDelete(true)}>Удалить</Button>
                                        <Button
                                            disabled={posting}
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
                                        <div
                                            className={dateNewInputError ? 'report_date_input error' : 'report_date_input'}>
                                            <label>Дата отчёта:
                                                <input type={'datetime-local'} max={moment().format('YYYY-MM-DD HH:mm')}
                                                       value={newDateInput.value}
                                                       onChange={(e) => newDateInput.onChange(e)}/>
                                            </label>
                                        </div>
                                        <div>
                                            <label>Изображение для отчёта (опционально):
                                                <input type={'file'} onChange={handleFileChange}
                                                       accept={'.png, .jpg, .jpeg, .gif'} ref={imageRef}/>
                                            </label>
                                            {fileError && <span>{fileError}</span>}
                                        </div>
                                        <span>Конфиденциальность:</span>
                                        <div className={'filter_buttons'}>
                                            <select value={newHideReport}
                                                    onChange={(e) => setNewHideReport(e.target.value)}>
                                                <option value={'0'}>Не скрывать отчёт</option>
                                                <option value={'1'}>Скрыть отчёт</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span>Включить форматирование?</span>
                                            <label className="switch">
                                                <input type="checkbox" value={noFormatNew}
                                                       checked={noFormatNew === '0'}
                                                       onChange={() => setNoFormatNew(noFormatNew === '1' ? '0' : '1')}/>
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                    {fileUrl &&
                                        <div className={'image_rt_preview'}>
                                            <img src={`${fileUrl}`} alt={'image'}/>
                                        </div>
                                    }
                                </div>
                                <div className={'reports_textarea'}>
                                    <textarea rows={30} value={newReportInput.value}
                                              onChange={(e) => newReportInput.onChange(e)}
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
                            </form>
                            <div className={'reports_save_delete_buttons'}>
                                <Button
                                    disabled={!fileUrl && (posting || dateNewInputError || (newReportInput.value === '' || newDateInput.value === '' || newHideReport === ''))}
                                    onClick={createNewReport}>
                                    Создать
                                </Button>
                            </div>
                        </div>
                    }
                    <NotificationComponent/>
                </div>
            }
        </div>
    )
}
export default AddReport