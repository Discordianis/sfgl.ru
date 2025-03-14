import React, { useEffect, useState } from "react";
import Loading from "../../../../../Loading/Loading.tsx";
import addItem from '../../../../../../../public/icons/PlusAdd.png';

import { useSelector } from "react-redux";
import './AddRelationArchive.css';
import useInput from "../../../../../../hooks/useInput.tsx";
import {useNotification} from "../../../../../../hooks/useSuccess.tsx";
import {RootState} from "../../../../../../redux";
import moment from "moment";
import {Button, TextField} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";

const AddRelationArchive: React.FC = () => {
    const server = useSelector((state: RootState) => state.server.server);
    const token = localStorage.getItem('token');
    const [localArchiveData, setLocalArchiveData] = useState([]);
    const [archiveData, setArchiveData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newSummaryDate, setNewSummaryDate] = useState('');
    const [createNewData, setCreateNewData] = useState(false)
    const [inputAnyError, setInputAnyError] = useState(false)
    const [inputEmptyError, setInputEmptyError] = useState(false)
    const [updateAnyError, setUpdateAnyError] = useState(false)

    const nameInput = useInput('', {emptyInput: true})
    const startInput = useInput('', {emptyInput: true})
    const endInput = useInput('', {emptyInput: true})
    const optionalInput = useInput('', {})
    const {showNotification, NotificationComponent} = useNotification()

    useEffect(() => {
        const fetchArchiveData = async () => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({ token, action: 'getMyRelations' })
            });
            const data = await res.json();

            if (data?.status) {
                setLocalArchiveData(Object.values(data?.info));
                setArchiveData(data)
            } else {
                console.log(data?.info);
            }
        };

        fetchArchiveData().then();
    }, [server, token]);

    const updateArchiveData = (index, field, value) => {
        setLocalArchiveData(prevData => {
            const updatedData = [...prevData];
            updatedData[index] = { ...updatedData[index], [field]: value };
            return updatedData;
        });
    };

    const checkForErrors = (archiveItem) => {
        const startDateError = archiveItem.start_date > moment().format('YYYY-MM-DD') || archiveItem.start_date > archiveItem.end_date;
        const endDateError = archiveItem.end_date > moment().format('YYYY-MM-DD') || archiveItem.start_date > archiveItem.end_date;
        return { startDateError, endDateError };
    };

    const hasAnyErrors = localArchiveData.some(item => {
        const { startDateError, endDateError } = checkForErrors(item);
        return startDateError || endDateError;
    });

    useEffect(() => {
        const calculateDateDiff = () => {
            const startDate = new Date(startInput.value);
            const endDate = new Date(endInput.value);
            if (startDate > endDate && startInput.value.length !== 0 && endInput.value.length !== 0) {
                setInputAnyError(true)
            }
            else {
                setInputAnyError(false)
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
                    const dateDiff = Math.ceil(timeDiff / (24 * 1000 * 3600)).toString();
                    setNewSummaryDate(dateDiff);
                } else {
                    setNewSummaryDate('');
                }
            }
        };

        calculateDateDiff();
    }, [startInput.value, endInput.value]);

    const posting = async (id) => {
        setUploading(true);

        const current = Object.values(localArchiveData).find(curr => curr.id === id)

        if (current?.start_date > current?.end_date) {
            setUpdateAnyError(true)
        }
        else {
            const currTimeDiff = Math.abs(new Date(current?.end_date).getTime() - new Date(current?.start_date).getTime());
            const currDateDiff = {
                summary_date: Math.ceil(currTimeDiff / (24 * 1000 * 3600)).toString()
            }
            const allUpdate = {
                ...current,
                ...currDateDiff
            }

            const newArchiveItem = {
                name: nameInput.value,
                start_date: startInput.value,
                end_date: endInput.value,
                summary_date: newSummaryDate,
                optional: optionalInput.value
            };

            try {
                if (createNewData) {
                    const res = await fetch(server, {
                        method: 'POST',
                        body: JSON.stringify({ token, action: 'insertMyRelation', data: { ...newArchiveItem } })
                    });
                    const data = await res.json();
                    if (!data?.status) {
                        console.log(data?.info);
                        showNotification('Что-то пошло не так...', 'error')
                        setUploading(false)
                    }
                    else {
                        nameInput.setValue('')
                        startInput.setValue('')
                        endInput.setValue('')
                        optionalInput.setValue('')
                        setNewSummaryDate('')
                        setCreateNewData(false)
                        const fetchArchiveData = async () => {
                            const res = await fetch(server, {
                                method: 'POST',
                                body: JSON.stringify({ token, action: 'getMyRelations' })
                            });
                            const data = await res.json();

                            if (data?.status) {
                                setLocalArchiveData(Object.values(data?.info));
                            } else {
                                console.log(data?.info);
                            }
                        };
                        await fetchArchiveData();
                        setUploading(false);
                        showNotification('Данные обновлены', 'success')
                    }
                }
                else {
                    const res = await fetch(server, {
                        method: 'POST',
                        body: JSON.stringify({ token, action: 'updateMyRelation', data: { ...allUpdate }, conditions: {id: id}})
                    });
                    const data = await res.json();
                    if (!data?.status) {
                        console.log(data?.info);
                        showNotification('Что-то пошло не так...', 'error')
                        setUploading(false)
                    }
                    else {
                        showNotification('Данные обновлены', 'success')
                        const fetchArchiveData = async () => {
                            const res = await fetch(server, {
                                method: 'POST',
                                body: JSON.stringify({ token, action: 'getMyRelations' })
                            });
                            const data = await res.json();

                            if (data?.status) {
                                setLocalArchiveData(Object.values(data?.info));
                            } else {
                                console.log(data?.info);
                            }
                        };
                        await fetchArchiveData();
                        setUploading(false);
                        setCreateNewData(false)
                    }
                }
            }
            catch (err) {
                setUploading(false)
                console.error(err)
            }
        }
    };

    const deletePost = async (id: number) => {
        setUploading(true);
        const res = await fetch(server, {
            method: 'POST',
            body: JSON.stringify({ token, action: 'deleteMyRelation', conditions: { id: id } })
        });
        const data = await res.json();
        if (!data?.status) {
            console.log(data?.info);
            showNotification('Что-то пошло не так...', 'error')
        }
        else {
            showNotification('Удаление успешно', 'success')
        }

        setLocalArchiveData(prevData => prevData.filter(item => item.id !== id));
        setUploading(false);
    };

    useEffect(() => {
        if (nameInput.emptyInput || startInput.emptyInput || endInput.emptyInput) {
            setInputEmptyError(true)
        }
        else {
            setInputEmptyError(false)
        }
    }, [nameInput.emptyInput, startInput.emptyInput, endInput.emptyInput]);

    if (localArchiveData.length === 0 && !archiveData) {
        return <Loading />
    }

    return (
        <>
            <div className={'add_relation_archive'}>
                {localArchiveData.map((archiveItem, index) => {
                    const { startDateError, endDateError } = checkForErrors(archiveItem);
                    return (
                        <div key={archiveItem.id} className="archive_item">
                            {index === localArchiveData.length - 1 && (
                                !createNewData &&
                                <Button variant={'outlined'} onClick={() => deletePost(archiveItem.id)}>x</Button>
                            )}
                            <div className={'relation_archive_root'}>
                                <form>
                                    <div className={'relation_archive'}>
                                        <TextField
                                            variant={'outlined'}
                                            label={'Имя бывшего партнёра'}
                                            type={'text'}
                                            value={archiveItem.name}
                                            onChange={(e) => updateArchiveData(index, 'name', e.target.value)}
                                        />
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DatePicker
                                                maxDate={moment()}
                                                label="Начало отношений с бывшим партнёром"
                                                value={moment(archiveItem.start_date)}
                                                onChange={(e) => updateArchiveData(index, 'start_date', moment(e).format('YYYY-MM-DD'))}
                                            />
                                        </LocalizationProvider>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DatePicker
                                                maxDate={moment()}
                                                label="Конец отношений с бывшим партнёром"
                                                value={moment(archiveItem.end_date)}
                                                onChange={(e) => updateArchiveData(index, 'end_date', moment(e).format('YYYY-MM-DD'))}
                                            />
                                        </LocalizationProvider>
                                        <TextField
                                            variant={'outlined'}
                                            label={'Дополнительная информация (опционально)'}
                                            type={'text'}
                                            value={archiveItem.optional}
                                            onChange={(e) => updateArchiveData(index, 'optional', e.target.value)}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className={'button_update_rel'}>
                                <Button onClick={() => posting(archiveItem.id)}
                                        disabled={uploading || startDateError || endDateError || updateAnyError}>Обновить</Button>
                            </div>
                        </div>
                    );
                })}
                {!createNewData &&
                    <div className={'add_item_icon archive_item'} onClick={() => setCreateNewData(true)}>
                        <img src={`${addItem}`} alt={'addItem'}/>
                    </div>
                }
                {createNewData &&
                    <div className="archive_item">
                        <Button onClick={() => setCreateNewData(false)}>x</Button>
                        <div className={'relation_archive_root'}>
                            <form>
                                <div className={'relation_archive'}>
                                    <TextField
                                        variant={'outlined'}
                                        label={'Имя бывшего партнёра'}
                                        type={'text'}
                                        value={nameInput.value}
                                        onChange={(e) => nameInput.onChange(e)}
                                    />
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            maxDate={moment()}
                                            label="Начало отношений с бывшим партнёром"
                                            value={moment(startInput.value)}
                                            onChange={(e) => startInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                        />
                                    </LocalizationProvider>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            maxDate={moment()}
                                            label="Конец отношений с бывшим партнёром"
                                            value={moment(endInput.value)}
                                            onChange={(e) => endInput.setValue(moment(e).format('YYYY-MM-DD'))}
                                        />
                                    </LocalizationProvider>
                                    <TextField
                                        variant={'outlined'}
                                        label={'Дополнительная информация (опционально)'}
                                        type={'text'}
                                        value={optionalInput.value}
                                        onChange={(e) => optionalInput.onChange(e)}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className={'button_create_rel'}>
                            <Button onClick={posting} disabled={uploading || hasAnyErrors || inputAnyError || inputEmptyError}>Создать</Button>
                        </div>
                    </div>
                }
                <NotificationComponent />
            </div>
        </>
    );
};

export default AddRelationArchive;
