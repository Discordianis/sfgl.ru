import React, {useEffect, useState} from "react";
import './ProfileRelationShip.css'
import UTabs from "../../../UTabs/UTabs.tsx";

import Loading from "../../../Loading/Loading.tsx";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {RootState} from "../../../../redux";
import parse from "html-react-parser";
import {Button, MenuItem, Select} from "@mui/material";

interface IAchieve {
    cover: string,
    date: string,
    date_modified: string,
    description: string,
    name: string,
    user_nickname: string,
    id: string
}
interface IReports {
    created_date: string,
    date_modified: string,
    hidden: string | number,
    id: string,
    report_date: string | number | Date,
    text: string,
    user_nickname: string,
    image: string,
    no_format: string
}

interface IAllArchive {
    status: boolean,
    info: {
        achievements: {
            length: number;
            [key: number]: IAchieve
        },
        love: {
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
            partner_type: string,
            partner_confirmed: boolean,
            partner_custom_nickname: string,
            partner_name: string,
            start_date: string,
            start_description: string,
            status: string,
            tries: string,
            user_custom_nickname: string,
            user_nickname: string,
        }
        relations: {
            length: number
            [key: number]: {
                date_modified: string,
                end_date: string,
                id: string,
                name: string,
                optional: string,
                start_date: string,
                summary_date: string,
                user_nickname: string
            }
        },
        reports: {
            length: number;
            [key: number]: IReports
        }
    }
}

interface ILinksInfo {
    name: string,
    link: string,
    img: string,
}

interface ILinks {
    [key: number]: ILinksInfo
}

interface IProfile {
    status: boolean,
    info: {
        about: string,
        age: string,
        avatar: string,
        background: string,
        birthday: string,
        custom_nickname: string,
        last_online_date: string,
        music: string,
        nickname: string,
        online: string,
        orientation: string,
        links: string,
    }
}

const ProfileRelationShip: React.FC = () => {

    const [archiveData ,setArchiveData] = useState<IAllArchive | null>(null)
    const [profileData ,setProfileData] = useState<IProfile | null>(null)
    const [dataNot, setDataNot] = useState('');
    const [reportNot, setReportNot] = useState('');
    const [achieveNot, setAchieveNot] = useState('');
    const [tab, setTab] = useState('general');
    const [showAllReports, setShowAllReports] = useState(false);
    const [filter, setFilter] = useState<'newest' | 'date'>('newest');
    const [sortedReportsList, setSortedReportsList] = useState(null);
    const [loading, setLoading] = useState(true)
    const [links, setLinks] = useState<ILinks>()

    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const myData = useSelector((state: RootState) => state.myData)
    const params = useParams()

    useEffect(() => {
        const archiveFetch = async () => {
            try {
                const response = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getAllProfile', conditions: {user_nickname: params.nickname}})
                })
                const data = await response.json()
                setArchiveData(data)
            }
            catch (err) {
                console.error(err)
            }
        }
        archiveFetch()
    }, [params.nickname, server, token]);

    useEffect(() => {
        const profileFetch = async () => {
            try {
                const response = await fetch(server, {
                    method: 'POST',
                    body: JSON.stringify({token: token, action: 'getUser', conditions: {nickname: archiveData?.info.love?.user_nickname}})
                })
                const data = await response.json()
                setProfileData(data)
                setLoading(false)
            }
            catch (err) {
                console.error(err)
                setLoading(false)
            }
        }
        profileFetch()
    }, [archiveData?.info.love?.user_nickname, server, token]);

    useEffect(() => {
        if (archiveData?.info) {
            if (!archiveData?.info.love && archiveData?.info?.relations.length === 0) {
                setDataNot('Пользователь не заполнил данные.');
            }
            if (archiveData?.info.reports) {
                if (archiveData?.info.reports.length === 0) {
                    setReportNot('Отчёты отсутствуют...');
                }
            }
            if (archiveData?.info.achievements) {
                if (archiveData?.info.achievements.length === 0) {
                    setAchieveNot('У данного пользователя отсутствуют какие-либо достижения...')
                }
            }
        }
    }, [archiveData?.info]);

    const reformDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        if (!year || !month || !day) return null;
        return `${day}.${month}.${year}`;
    };

    const formatDate = (totalDays: number) => {
        const years = Math.floor(totalDays / 365);
        const months = Math.floor((totalDays % 365) / 30);
        const days = totalDays % 365 % 30;

        const getPlural = (n: number, one: string, few: string, many: string) => {
            return (n % 10 === 1 && n % 100 !== 11) ? one :
                (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? few :
                    many;
        };

        const yearsLabel = years > 0 ? `${years} ${getPlural(years, 'год', 'года', 'лет')}` : '';
        const monthsLabel = months > 0 ? `${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')}` : '';
        const daysLabel = days > 0 ? `${days} ${getPlural(days, 'день', 'дня', 'дней')}` : '';

        return [yearsLabel, monthsLabel, daysLabel].filter(Boolean).join(', ');
    };

    const calculateDaysBetweenDates = (startDate: string) => {
        const start = new Date(startDate).getTime();
        const now = new Date().getTime();
        const differenceInMs = now - start;
        return Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    };

    const formatYears = (totalDays: number) => {
        const years = Math.floor(totalDays / 365);

        const getPlural = (n: number, one: string, few: string, many: string) => {
            return (n % 10 === 1 && n % 100 !== 11) ? one :
                (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? few :
                    many;
        };

        return years > 0 ? `${years} ${getPlural(years, 'год', 'года', 'лет')}` : '';
    };

    useEffect(() => {
        if (archiveData?.info) {
            const sortedReports = Object.values(archiveData?.info.reports || []).sort((a: IReports, b: IReports) => {
                const aDate = new Date(a.report_date).getTime();
                const bDate = new Date(b.report_date).getTime();

                return filter === 'newest' ? bDate - aDate : aDate - bDate;
            });
            setSortedReportsList(sortedReports);
        }
    }, [filter, archiveData?.info]);

    useEffect(() => {
        if (profileData?.info?.links) {
            setLinks(JSON.parse(profileData?.info?.links))
            console.log(JSON.parse(profileData?.info?.links))
        }
    }, [profileData?.info?.links]);

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <div className={'profile_utabs'}>
                <UTabs isActive={tab === 'general'} onClick={() => setTab('general')}>Основная информация</UTabs>
                <UTabs isActive={tab === 'relations'} onClick={() => setTab('relations')}>Отношения</UTabs>
                <UTabs isActive={tab === 'reports'} onClick={() => setTab('reports')}>Отчёты</UTabs>
                <UTabs isActive={tab === 'achievement'} onClick={() => setTab('achievement')}>Достижения</UTabs>
            </div>
            <div className={'profile_rs_info'}>
                {tab === 'general' &&
                    <>
                        {(archiveData?.info && !dataNot) ?
                            <div>
                                <div className={'prs_bio_status_common'}>
                                    {(profileData?.info.birthday || profileData?.info.orientation) &&
                                        <div className={'prs_bio_data'}>
                                            <h4>Биологические данные</h4>
                                            {profileData?.info.birthday &&
                                                <span>Дата рождения: {reformDate(profileData?.info.birthday)} [{formatYears(Number(profileData?.info.age))}]</span>
                                            }
                                            {profileData?.info.orientation &&
                                                <span>Пол: {profileData?.info.orientation === 'man' ? 'мужчина' : "женщина"}</span>
                                            }
                                        </div>
                                    }
                                    {(profileData?.info?.links && links) &&
                                    <div className={'prs_links'}>
                                            <div className={'prs_links_data'}>
                                                <h4>Ссылки</h4>
                                                <div className={'prs_links_data_content'}>
                                                    {Object.values(links).map((lnk: ILinksInfo) =>
                                                        <a href={lnk.link}>
                                                            <img src={lnk.img} alt={'lng_image'}/>
                                                            <span>{lnk.name}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                    </div>
                                    }
                                    <div className={'prs_current_status_main'}>
                                        <div className={'prs_current_status'}>
                                            <h4>Текущий статус</h4>
                                            {archiveData?.info.love?.status ?
                                                <span>{archiveData?.info.love?.status}</span>
                                                :
                                                <span>Пользователь не заполнил данные</span>
                                                }
                                            </div>
                                            {(archiveData?.info && archiveData?.info.love && archiveData?.info.love?.partner_name && archiveData?.info.love?.user_nickname && (archiveData.info.love?.partner_confirmed || archiveData.info.love?.partner_type === 'nolab')) ?
                                                <div className={'prs_pp_status'}>
                                                    <h4>Текущие отношения</h4>
                                                    <span>{archiveData?.info.love?.custom_nickname} + {archiveData?.info.love?.partner_custom_nickname ||
                                                        archiveData?.info.love?.partner_name} [{formatDate(calculateDaysBetweenDates(archiveData?.info.love?.start_date))}]</span>
                                                    {(archiveData?.info.love?.start_date) &&
                                                        <span>Начало отношений: {reformDate(archiveData?.info.love?.start_date)}</span>
                                                    }
                                                    {archiveData?.info.love?.start_description &&
                                                        <span>{archiveData?.info.love?.start_description}</span>
                                                    }
                                                </div>
                                                :
                                                null
                                            }
                                            {(archiveData?.info.love?.partner_confirmed === false || (archiveData?.info.love?.partner_name === '' && archiveData?.info.love?.partner_type === 'nolab')) &&
                                                <div className={'prs_pp_no_status'}>
                                                    <h4>Текущие отношения</h4>
                                                    <span style={{color: '#e13f3f'}}>Без любви не увидеть...</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                :
                            <div>
                                <span>{dataNot}</span>
                            </div>
                        }
                    </>
                }
                {tab === 'relations' &&
                    <div>
                        {archiveData?.info && archiveData?.info.love && (archiveData?.info.love?.experience || archiveData?.info.love?.tries ||
                            archiveData?.info.love?.fails || archiveData?.info.love.additional) ? (
                            <div className={'prs_common_statistic'}>
                                <div>
                                    <h4>Общая статистика</h4>
                                    {archiveData?.info.love?.experience && (
                                        <span>Опыт отношений: {archiveData?.info.love?.experience} раз(-а)</span>
                                    )}
                                    {archiveData?.info.love?.fails && (
                                        <div className={'prs_common_fails'}>
                                            <span>Опыт отказов: {archiveData?.info.love?.fails} раз(-а)</span>
                                        </div>
                                    )}
                                    {(archiveData?.info.love?.tries) && (
                                        <div className={'prs_common_fails'}>
                                            <span>Опыт провальных попыток начать отношения: {archiveData?.info.love?.tries} раз(-а)</span>
                                        </div>
                                    )}
                                    {archiveData?.info.love?.additional && (
                                        <span>{archiveData?.info.love?.additional}</span>
                                    )}
                                </div>
                            </div>
                        ) : null}
                        {archiveData?.info.relations &&
                            Array.isArray(archiveData?.info.relations) && archiveData?.info.relations.length > 0 &&
                            archiveData?.info.relations[0].name !== '' && archiveData?.info.relations[0].summary_date !== '' &&
                            <>
                                <div className={'prs_relation_archive_title'}>
                                    <h4>Архив прошедших отношений</h4>
                                </div>
                                <div className={'prs_relation_archive'}>
                                    {Object.values(archiveData?.info.relations)
                                        .filter(archive => archive.name || archive.summary_date)
                                        .map((archive, index) =>
                                            <div key={index}>
                                                <span>#{index + 1}</span>
                                                <div>
                                                    <span>Имя бывшего партнёра: {archive.name}</span>
                                                    <span>Период отношений: {reformDate(archive.start_date)} – {reformDate(archive.end_date)} [{formatDate(Number(archive.summary_date))}]</span>
                                                    {archive.optional && archive.optional.length > 0 &&
                                                        <span>Дополнительно: {archive.optional}</span>}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </>
                        }
                    </div>
                }
                {tab === 'reports' &&
                    <>
                        {(archiveData?.info && !reportNot) ?
                            <div>
                                {archiveData?.info?.reports && Object.values(archiveData?.info.reports).length > 0 ? (
                                    <>
                                    {Object.values(archiveData?.info.reports).length > 1 &&
                                        <div className={'filter_buttons'}>
                                            <div className={'filter_buttons_fill'}
                                                 style={{marginTop: '5px', maxWidth: '400px', width: '100%'}}>
                                                <Select variant={'filled'} value={filter}
                                                        onChange={(e) => setFilter(e.target.value as 'newest' | 'date')}>
                                                    <MenuItem value="newest">Сортировка по хронологии</MenuItem>
                                                    <MenuItem value="date">Сортировка по хронологии (обратный порядок)</MenuItem>
                                                </Select>
                                            </div>
                                        </div>
                                    }
                                        <div className={'profile_rs_report_main'}>
                                            {Object.values(archiveData?.info.reports).length >= 1 && (
                                                sortedReportsList.slice(0, 1).map((report: IReports, index: number) => (
                                                    (report.hidden != 1 || archiveData?.info.love?.user_nickname === myData.data?.info.nickname) &&
                                                    <div className={'profile_rs_report'} key={index}
                                                         style={{background: report.hidden == 1 ? '#451b1b4f' : ''}}>
                                                        <div>
                                                            <span>Отчёт от {reformDate(report.report_date as string)}</span>
                                                            {report?.no_format === '0' ?
                                                                <div className={'report_span_root'}>
                                                                    {parse((report.text
                                                                        .split('\n')
                                                                        .map((line, index) =>
                                                                            `${index > 0 ? '\n' : ''}${line[0] !== '<' ? '&emsp;&emsp;' : ''}${line}`
                                                                        )).join(''))
                                                                    }
                                                                </div>
                                                                :
                                                                <div className={'report_span_root'}>
                                                                    <span>
                                                                        {parse(report.text)}
                                                                    </span>
                                                                </div>
                                                            }
                                                        </div>
                                                        {report?.image &&
                                                            <div className={'report_image'}>
                                                                <img src={`${report?.image}`}
                                                                     alt={'report_image'}/>
                                                            </div>
                                                        }
                                                    </div>
                                                ))
                                            )}
                                            {Object.values(archiveData?.info.reports).length > 1 && (
                                                <>
                                                    {showAllReports ? (
                                                        sortedReportsList.slice(1).map((report: IReports, index: number) => (
                                                            (report.hidden != 1 || archiveData?.info.love?.user_nickname === myData.data?.info.nickname) &&
                                                            <div className={'profile_rs_report'} key={index + 1} style={{background: report.hidden == 1 ? '#451b1b4f' : ''}}>
                                                                <div>
                                                                    <span>Отчёт от {reformDate(report.report_date as string)}</span>
                                                                    {report?.no_format === '0' ?
                                                                        <div className={'report_span_root'}>
                                                                            {parse((report.text
                                                                                .split('\n')
                                                                                .map((line, index) =>
                                                                                    `${index > 0 ? '\n' : ''}${line[0] !== '<' ? '&emsp;&emsp;' : ''}${line}`
                                                                                )).join(''))
                                                                            }
                                                                        </div>
                                                                        :
                                                                        <div className={'report_span_root'}>
                                                                    <span>
                                                                        {parse(report.text)}
                                                                    </span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                {report?.image &&
                                                                    <div className={'report_image'}>
                                                                        <img src={`${report?.image}`}
                                                                             alt={'report_image'}/>
                                                                    </div>
                                                                }
                                                            </div>
                                                        ))
                                                    ) : null}
                                                    <Button variant={'outlined'} onClick={() => setShowAllReports(!showAllReports)}>
                                                        {showAllReports ? 'Скрыть отчёты' : 'Показать остальные отчёты'}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span>Отчёты отсутствуют</span>
                                )}
                            </div>
                            :
                            <div>
                                <span>{reportNot}</span>
                            </div>
                        }
                    </>
                }
                {tab === 'achievement' &&
                    <>
                        {(archiveData?.info && !achieveNot) ?
                            <div className={'profile_ach_root'}>
                                {(archiveData?.info && !achieveNot && archiveData?.info.achievements) ? (
                                    <div>
                                        {archiveData?.info.achievements && Object.values(archiveData?.info.achievements).length > 0 ? (
                                            Object.values(archiveData?.info.achievements)
                                                .sort((a: IAchieve, b: IAchieve) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((achieve: IAchieve) => (
                                                <div className={'profile_ach'} key={achieve.id}>
                                                    <div>
                                                        {!achieve.cover ? <Loading />
                                                        :
                                                        achieve?.cover && <img src={`${achieve.cover}`} alt={'achieve_img'} />
                                                        }
                                                    </div>
                                                    <div>
                                                        {achieve?.name && <span><strong>{achieve.name}</strong></span>}
                                                        {achieve?.description && <span>{achieve.description}</span>}
                                                        {achieve?.date && <span>Дата получения: {reformDate(achieve?.date)}</span>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <span>{achieveNot}</span>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                            :
                            <div>
                                <span>{achieveNot}</span>
                            </div>
                        }
                    </>
                }
            </div>
        </>
    );
};

export default ProfileRelationShip;
