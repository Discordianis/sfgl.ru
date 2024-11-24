import './Wall.css'
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Loading from "../../Loading/Loading.tsx";
import {NavLink} from "react-router-dom";
import TextOverflow from "../../TextOverflow/TextOverflow.tsx";
import parse from "html-react-parser";
import moment from "moment";
import 'moment/dist/locale/ru.js';

interface IReportsInfo {
    created_date?: string
    date_modified?: string
    report_date: string
    hidden: string
    id: string
    image: string
    text: string
    user_id: string
    user_nickname: string
}

interface IArchiveData {
    info: {
        [key: number]: IReportsInfo
    }
}

interface IAllUsersInfo {
    custom_nickname: string;
    nickname: string;
    avatar: string;
    id: string;
    token: string;
    online: number;
    last_online_date: string | Date
}

interface User {
    status: boolean,
    info: {
        [key: number]: IAllUsersInfo
    }
}

const Wall:React.FC = () => {

    moment().locale('ru')

    const [noNewReports, setNoNewReports] = useState<boolean | null>(null)
    const [lastTime, setLastTime] = useState('');
    const [sortedReportsList, setSortedReportsList] = useState(null);
    const [reportsData, setReportsData] = useState<IArchiveData | null>(null);
    const [allUsers, setAllUsers] = useState<User | null>(null);
    const [filter, setFilter] = useState<'reportDate' | 'createdDate' | 'modifyDate'>('reportDate');
    const [loading, setLoading] = useState(true)

    const server = useSelector((state: RootState) => state.server.server)
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllReports'})
            })
            const dataReport = await res.json()
            if (!dataReport.status) {
                setLoading(false)
                console.log(dataReport?.info)
            }
            else {
                setReportsData(dataReport)
            }

            const response = await fetch(server, {
                method: 'POST',
                body: JSON.stringify({token: token, action: 'getAllUsers'})
            })
            const data = await response.json()
            if (!data.status) {
                setLoading(false)
                console.log(data?.info)
            }
            else {
                setAllUsers(data);
            }

            setLoading(false)
        };
        fetchData().then();
    }, [server, token]);

    useEffect(() => {
        if (reportsData?.info) {
            const sortedReports = Object.values(reportsData?.info || []).sort((a: IReportsInfo, b: IReportsInfo) => {
                const reportDateA = new Date(a.report_date).getTime();
                const reportDateB = new Date(b.report_date).getTime();

                const formattedDateA = a.created_date.includes('.')
                    ? a.created_date.split('.').reverse().join('-')
                    : a.created_date;
                const formattedDateB = b.created_date.includes('.')
                    ? b.created_date.split('.').reverse().join('-')
                    : b.created_date;
                const createdDateA = new Date(formattedDateA).getTime();
                const createdDateB = new Date(formattedDateB).getTime();

                const modifyDateA = new Date(a.date_modified).getTime();
                const modifyDateB = new Date(b.date_modified).getTime();

                return filter === 'reportDate' ?
                    reportDateB - reportDateA : filter === 'createdDate' ?
                        createdDateB - createdDateA :
                        modifyDateB - modifyDateA
            });
            setSortedReportsList(sortedReports);

            if (sortedReports) {
                const b: boolean = Object.values(sortedReports)
                    .filter((report: IReportsInfo) => moment(lastTime).isBefore(moment(report?.created_date))).length === 0
                if (b) {
                    setNoNewReports(b)
                }
            }

        }
    }, [filter, reportsData?.info]);

    useEffect(() => {
        return () => {
            const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
            localStorage.setItem('lastVisitTime', currentTime);
            setLastTime(currentTime);
        };
    }, []);

    useEffect(() => {
        if (reportsData && lastTime) {
            const hasNewReports = Object.values(reportsData?.info || []).some(
                (report: IReportsInfo) => moment(lastTime).isBefore(moment(report.created_date))
            );
            setNoNewReports(!hasNewReports);
        }
    }, [reportsData, lastTime]);

    useEffect(() => {
        const time = localStorage.getItem('lastVisitTime')
        setLastTime(time)
    }, []);

    const formatDate = (inputDate: string) => {
        moment.locale('ru');

        const formattedDate = inputDate.includes('.')
            ? inputDate.split('.').reverse().join('-')
            : inputDate;

        const date = moment(formattedDate);
        const now = moment();
        const diffDays = now.diff(date, 'days');

        const time = date.format('HH:mm');

        if (diffDays === 0) {
            return `сегодня в ${time}`;
        } else if (diffDays === 1 && filter === 'modifyDate') {
            return `вчера в ${time}`;
        } else if (diffDays === 2 && filter === 'modifyDate') {
            return `позавчера в ${time}`;
        } else {
            return date.format('D MMMM YYYY[г.], HH:mm');
        }
    };

    if (loading) {
        return <Loading />
    }

    return (
        <div className={'reports_news_root'}>
            <div>
                {(reportsData && sortedReportsList) && (
                    <div>
                        {Object.values(reportsData?.info).length > 1 &&
                            <div className="filter_buttons">
                                <select
                                    onChange={(e) => setFilter(e.target.value as 'reportDate' | 'createdDate' | 'modifyDate')}>
                                    <option value="reportDate">Сортировка по дате отчёта</option>
                                    <option value="createdDate">Сортировка по дате создания отчёта</option>
                                    <option value="modifyDate">Сортировка по дате редактирования отчёта</option>
                                </select>
                            </div>
                        }
                        {reportsData?.info && Object.values(sortedReportsList)
                            .filter((report: IReportsInfo) => moment(lastTime).isBefore(moment(report?.created_date)))
                            .map((report: IReportsInfo) => (
                                <div key={report.id} className={'report_news'}>
                                    <NavLink
                                        to={`/users/${Object.values(allUsers?.info).find((user: IAllUsersInfo) => user?.nickname === report.user_nickname).nickname}`}>
                                        <div className={'report_news_header'}>
                                            <img src={`${Object.values(allUsers?.info)
                                                .find((user: IAllUsersInfo) => user?.nickname === report.user_nickname).avatar}`}
                                                 alt={'user_avatar'}
                                            />
                                            <div>
                                                <span><strong>{Object.values(allUsers?.info).find((user: IAllUsersInfo) => user?.nickname === report.user_nickname)?.custom_nickname}</strong></span>
                                                <span>{formatDate(filter === 'reportDate' ? report?.report_date : filter === 'createdDate' ? report?.created_date : report?.date_modified)}</span>
                                            </div>
                                        </div>
                                    </NavLink>
                                    <span><TextOverflow maxHeight={1000} text={parse((report.text
                                        .split('\n')
                                        .map((line, index) =>
                                            `${index > 0 ? '\n' : ''}${line[0] !== '<' ? '&emsp;&emsp;' : ''}${line}`
                                        )).join(''))
                                    }/>
                                                    </span>
                                </div>
                            ))}
                        {!noNewReports && (
                            <div className={'end_new_reports'}>
                                <span>На сегодня всё!</span>
                            </div>
                        )}
                        {reportsData?.info && Object.values(sortedReportsList)
                            .filter((report: IReportsInfo) => moment(lastTime).isSameOrAfter(moment(report?.created_date)))
                            .map((report: IReportsInfo) => (
                                <div key={report.id} className={'report_news'}>
                                    <NavLink
                                        to={`/users/${Object.values(allUsers?.info).find((user: IAllUsersInfo) => user?.nickname === report.user_nickname).nickname}`}>
                                        <div className={'report_news_header'}>
                                            <img src={`${Object.values(allUsers?.info)
                                                .find((user: IAllUsersInfo) => user?.nickname === report.user_nickname)?.avatar}`}
                                                 alt={'user_avatar'}
                                            />
                                            <div>
                                                <span><strong>{Object.values(allUsers?.info).find((user: IAllUsersInfo) => user?.nickname === report.user_nickname)?.custom_nickname}</strong></span>
                                                <span>{formatDate(filter === 'reportDate' ? report?.report_date : filter === 'createdDate' ? report?.created_date : report?.date_modified)}</span>
                                            </div>
                                        </div>
                                    </NavLink>
                                    <span><TextOverflow maxHeight={1000} text={parse((report.text
                                        .split('\n')
                                        .map((line, index) =>
                                            `${index > 0 ? '\n' : ''}${line[0] !== '<' ? '&emsp;&emsp;' : ''}${line}`
                                        )).join(''))
                                    }/>
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

            </div>
        </div>
    )
}
export default Wall