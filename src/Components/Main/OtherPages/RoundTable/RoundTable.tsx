import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import Loading from "../../../Loading/Loading.tsx";
import './RoundTable.css'
import {RootState} from "../../../../redux";
import {NavLink} from "react-router-dom";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

interface IInfo {
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
    user_modified: string,
}

interface ITable {
    status: boolean,
    info: Record<number, IInfo>
}

const RoundTable:React.FC = () => {

    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData.data?.info)
    const [jsonData, setJsonData] = useState<ITable | null>(null);
    const [loading, setLoading] = useState(true)
    const [selectedTable, setSelectedTable] = useState('')
    const [selectedData, setSelectedData] = useState(null)

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllRoundTables'})
            })
            const data = await response.json()
            if (!data?.status) {
                console.log(data?.info)
                setLoading(false)
            }
            else {
                setJsonData(data)
                setLoading(false)
            }
        };
        fetchData();
    }, [server, token]);

    const reformDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        if (!year || !month || !day) return null;
        return `${day}.${month}.${year}`;
    };

    function formatLongDate(dateString: Date) {
        const date = new Date(dateString);

        const day = date.getDate();
        const months = {
            'январь': 'января',
            'февраль': 'февраля',
            'март': 'марта',
            'апрель': 'апреля',
            'май': 'мая',
            'июнь': 'июня',
            'июль': 'июля',
            'август': 'августа',
            'сентябрь': 'сентября',
            'октябрь': 'октября',
            'ноябрь': 'ноября',
            'декабрь': 'декабря'
        };
        const month = months[date.toLocaleString('ru-RU', { month: 'long' })];
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day} ${month} ${year}г., ${hours}:${minutes}:${seconds}`;
    }

    function formatDateRange(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const durationMs = end.getTime() - start.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        const startDateStr = start.toLocaleDateString('ru-RU');
        const endDateStr = end.toLocaleDateString('ru-RU');

        const startTimeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        function getWordForHours(hours: number) {
            if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
            if (hours % 10 >= 2 && hours % 10 <= 4 && (hours % 100 < 10 || hours % 100 >= 20)) return 'часа';
            return 'часов';
        }

        function getWordForMinutes(minutes: number) {
            if (minutes % 10 === 1 && minutes % 100 !== 11) return 'минута';
            if (minutes % 10 >= 2 && minutes % 10 <= 4 && (minutes % 100 < 10 || minutes % 100 >= 20)) return 'минуты';
            return 'минут';
        }

        if (durationHours >= 24) {
            return `${startDateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr} [~${durationHours} ${getWordForHours(durationHours)}]`;
        }
        if (durationHours <= 0) {
            return `${startTimeStr} – ${endTimeStr} [~${durationMinutes} ${getWordForMinutes(durationMinutes)}]`;
        }
        if (selectedData?.date_start === null || selectedData?.date_start === '') {
            return `${endDateStr}, ${endTimeStr}`;
        }
        if (selectedData?.date_end === null || selectedData?.date_end === '') {
            return `${startTimeStr}`;
        }
        else {
            return `${startTimeStr} – ${endTimeStr} [~${durationHours} ${getWordForHours(durationHours)}]`;
        }
    }

    useEffect(() => {
        if (jsonData) {
            const mapping = Object.values(jsonData?.info).map((map: IInfo) => map.number)
            const maxLength = Math.max(...mapping)
            setSelectedData(Object.values(jsonData?.info).find((find: IInfo) => find.number.toString() === maxLength.toString()))
            setSelectedTable(maxLength.toString())
        }
    }, [jsonData]);

    useEffect(() => {
        if (selectedTable.length !== 0) {
            const find = Object.values(jsonData.info).find((data: IInfo) => data.number.toString() === selectedTable)
            if (find) {
                setSelectedData(find)
            }
        }
    }, [selectedTable]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'rt_root'}>
            {jsonData && jsonData.info && Object.keys(jsonData.info).length > 0 ?
                <div className={'filter_but_head'}>
                    <div className={'filter_buttons'}>
                        <div className={'filter_buttons_fill'}>
                            <FormControl variant="outlined">
                                <InputLabel id="outlined-label">Номер Круглого Стола</InputLabel>
                                <Select
                                    labelId="outlined-label"
                                    variant={'outlined'}
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    label={"Номер Круглого Стола"}
                                >
                                    {Object.values(jsonData.info).sort((a: IInfo, b: IInfo) => b.number - a.number).map(num =>
                                        <MenuItem value={num.number} key={num.id}>Круглый Стол #{num.number}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className={'create_report_href'}>
                        <NavLink to={`/users/${myData?.nickname}/createInfo/roundTable`}>
                            Написать итоги
                        </NavLink>
                    </div>
                </div>
                :
                <div className={'no_roundtables'}>
                    <span>Нет ни единого Круглого Стола...</span>
                </div>
            }
            {selectedData &&
                <div className={'rt_window'}>
                    <div className={'rt_window_title'}>
                        <span>Итоги Круглого стола #{selectedData?.number} ({reformDate(selectedData?.date)})</span>
                    </div>
                    <div className={'rt_window_time'}>
                        {selectedData?.date_start && selectedData?.date_end ?
                            <span>Продолжительность: {formatDateRange(selectedData?.date_start, selectedData?.date_end)}</span>
                            : selectedData?.date_start ?
                                <span>Начало: {formatDateRange(selectedData?.date_start, selectedData?.date_end)}</span>
                                : selectedData?.date_end ?
                                    <span>Конец: {formatDateRange(selectedData?.date_start, selectedData?.date_end)}</span>
                        :
                        <span>Время проведения неизвестно</span>
                        }
                    </div>
                    <div className={'rt_window_text'}>
                        <span>{selectedData?.text}</span>
                        {selectedData?.image &&
                            <div className={'rt_image'}>
                                <img src={`${selectedData?.image}`} alt={'rt_image'}/>
                            </div>
                        }
                    </div>
                    <div className={'rt_window_author'}>
                        <span>Автор: {selectedData?.custom_nickname} ({selectedData?.author})</span>
                    </div>
                    {selectedData?.date_modified &&
                        <div className={'rt_window_edit'}>
                            <span>(Изменено: {formatLongDate(selectedData?.date_modified)}, {selectedData?.user_modified})</span>
                        </div>
                    }
                </div>
            }
        </div>
    )
}
export default RoundTable