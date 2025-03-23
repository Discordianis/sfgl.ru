import React, {useEffect, useRef, useState} from 'react';
import parse from 'html-react-parser';
import Tooltip from '@mui/material/Tooltip';
import '../TextOverflow/TextOverflow.css';
import './CustomTooltip.css'
import imageNF from "../../../public/icons/imageNotFound.jpeg";
import moment from "moment/moment";
import Modal from "../Modal/Modal.tsx";
import Button from "../Button/Button.tsx";
import TextOverflowV19 from "../TextOverflowOld/TextOverflowV1.9.tsx";


interface ICharactersInfo {
    age: string,
    author: string,
    birthday: string,
    cover: string,
    date_created: string,
    date_modified: string,
    description: string,
    id: string,
    life_status: string,
    name_eng: string,
    name_rus: string,
    names: string,
    role: string,
    va_avatar: string,
    va_char_avatar: string,
    va_char_name: string,
    va_name: string,
}

interface ICharacters {
    status: boolean,
    info: {
        length: number,
        [key: number]: ICharactersInfo
    }
}

interface ITextBlockProps {
    text: string | React.ReactNode;
    maxHeight: number;
    tooltipData: ICharacters
}

const CustomTooltip: React.FC<ITextBlockProps> = ({text, maxHeight, tooltipData}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isShortText, setIsShortText] = useState(false);
    const [visibleSpoilers, setVisibleSpoilers] = useState<Set<string>>(new Set());
    const textRef = useRef<HTMLDivElement>(null);
    const [openModal, setOpenModal] = useState(false)

    useEffect(() => {
        if (textRef.current) {
            const innerHeight = textRef.current.scrollHeight;
            setIsShortText(innerHeight <= maxHeight);
        }
    }, [maxHeight]);

    const toggleSpoiler = (key: string) => {
        setVisibleSpoilers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleModal = () => {
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
    }

    const handleCloseModal = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape') {
            setOpenModal(false)
        }
    }

    const parseStyleString = (styleString: string) => {
        return styleString.split(';').reduce((acc: Record<string, string>, styleRule) => {
            const [key, value] = styleRule.split(':');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});
    };

    const processTextWithSpoilersAndDivs = (rawText: string) => {
        const children: React.ReactNode[] = [];
        const regex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]|\[div(.*?)\]([\s\S]*?)\[\/div\]/g;

        let match;
        let lastIndex = 0;

        while ((match = regex.exec(rawText)) !== null) {
            const [fullMatch, spoilerContent, divAttributes, divContent] = match;
            fullMatch.toString();

            if (lastIndex < match.index) {
                const precedingText = rawText.slice(lastIndex, match.index);
                const textLines = precedingText
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, idx) => (
                        <div key={`line-${match.index}-${idx}`}>
                            {line[0] !== '<' && <span style={{marginLeft: '1em'}}>&emsp;</span>}
                            {parse(line, {
                                replace: (domNode) => {

                                    if (domNode.type === 'tag' && domNode.name === 'a' && domNode.children && domNode.children.length > 0) {
                                        if (!tooltipData || !tooltipData.info) {

                                            return (
                                                <a href={domNode.attribs.href}>
                                                    {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                                </a>
                                            );
                                        }

                                        const href = domNode.attribs.href;
                                        const match = href.match(/\/characters\/(\d+)/);
                                        const characterKey = match ? match[1] : null;

                                        const characters = Object.values(tooltipData?.info).find(
                                            (character): character is ICharactersInfo => {
                                                return typeof character === 'object' && character !== null && 'id' in character && character.id === characterKey;
                                            }
                                        );
                                        console.log('characterData:', characters);
                                        const style = domNode.attribs.style || ''
                                        console.log(style)
                                        if (!characters) {
                                            return (
                                                <a href={domNode.attribs.href} style={{...parseStyleString(style)}}>
                                                    {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                                </a>
                                            );
                                        }

                                        const matchIndex = match ? match.index : 'unknown';

                                        return (
                                            <Tooltip
                                                key={`tooltip-${matchIndex}-${idx || 'unknown'}`}
                                                title={
                                                    <div className={'tooltip_character_root'}>
                                                        <div className={'story_right_title'}>
                                                            <h6>{characters?.name_rus}
                                                                {characters?.name_eng &&
                                                                    <span style={{color: 'gray'}}> / </span>}
                                                                {characters?.name_eng}
                                                            </h6>
                                                        </div>
                                                        <div className={'story_info_left'}>
                                                            <div>
                                                                <div onClick={handleModal} className={'char_info_cover'}>
                                                                    <div className={'div_image_big'}
                                                                         style={{backgroundImage: 'url(' + `${characters?.cover ? characters?.cover : imageNF}` + ')'}}>
                                                                    </div>
                                                                </div>
                                                                <Modal open={openModal} onClose={handleClose}
                                                                       onKeyDown={handleCloseModal}>
                                                                    <div>
                                                                        <Button onClick={handleClose}>x</Button>
                                                                    </div>
                                                                    <div style={{marginTop: '50px'}}>
                                                                        <img
                                                                            src={`${characters?.cover ? characters?.cover : imageNF}`}
                                                                            alt={'story_img'}/>
                                                                    </div>
                                                                </Modal>
                                                            </div>
                                                        </div>
                                                        <div className={'char_info_right_tltp'}>
                                                            <div>
                                                                <div className={'story_right_commons'}>
                                                                    <div>
                                                                        {characters?.names &&
                                                                            <div>
                                                                                <span><strong>Прочие имена:</strong> {characters?.names}</span>
                                                                            </div>
                                                                        }
                                                                        <div>
                                                                            <span><strong>Дата рождения: </strong>{characters?.birthday ? moment(characters?.birthday).format('D MMM YYYY [г.]') : 'Неизвестно'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span><strong>Возраст в годах: </strong>{characters?.age ? characters?.age : 'Неизвестно'}</span>
                                                                        </div>
                                                                        <div className={'character_right_status'}>
                                                                            <div>
                                                                                <span><strong>Статус: </strong></span>
                                                                            </div>
                                                                            <div className={'char_right_status'}>
                                                                                <div
                                                                                    className={(characters?.life_status === 'lively') ? 'char_right_status_lively' : characters?.life_status === 'dead' ? 'char_right_status_dead' : 'char_right_status_unknown'}>
                                                                                    <span>{(characters?.life_status === 'lively') ? 'Жив(-а)' : characters?.life_status === 'dead' ? 'Мертв(-а)' : 'Неизвестно'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                        </div>
                                                                        <div>
                                                    <span><strong>Дата добавления: </strong>
                                                        {characters?.date_created
                                                            ?
                                                            `${moment(characters?.date_created).format('D MMM YYYY [г.]')}`
                                                            :
                                                            'Неизвестно'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={'char_page_va_root'}>
                                                                    {characters?.va_char_name &&
                                                                        <div>
                                                                            <div className={'char_page_va_char'}>
                                                                                <div className={'char_page_va_char_title'}>
                                                                                    <h4>Персонаж озвучки:</h4>
                                                                                </div>
                                                                                <div className={'char_page_va_char_info'}>
                                                                                    <div>
                                                                                        <img
                                                                                            src={`${characters?.va_char_avatar ? characters?.va_char_avatar : imageNF}`}
                                                                                            alt={'char_va_avatar'}/>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4>{characters?.va_char_name}</h4>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    {characters?.va_name &&
                                                                        <div>
                                                                            <div className={'char_page_va_seiyuu'}>
                                                                                <div
                                                                                    className={'char_page_va_seiyuu_title'}>
                                                                                    <h4>Сэйю:</h4>
                                                                                </div>
                                                                                <div className={'char_page_va_info'}>
                                                                                    <div>
                                                                                        <img
                                                                                            src={`${characters?.va_avatar ? characters?.va_avatar : imageNF}`}
                                                                                            alt={'char_va_avatar'}/>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4>{characters?.va_name}</h4>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className={'story_right_description'}>
                                                                    <div className={'story_right_description_title'}>
                                                                        <span><strong>Описание</strong></span>
                                                                    </div>
                                                                    <div className={'char_desc_tltp'}>
                                                                        {characters?.description ?
                                                                            <span>
                                                                            <TextOverflowV19 maxHeight={400}
                                                                                          text={characters?.description}
                                                                            />
                                                                        </span>
                                                                            :
                                                                            <span>Описание отсутствует...</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                arrow
                                                placement="top"
                                            >
                                                <a href={domNode.attribs.href} style={{...parseStyleString(style)}}>
                                                    {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                                </a>
                                            </Tooltip>
                                        );
                                    }
                                    return domNode;
                                },
                            })}
                        </div>
                    ));
                children.push(...textLines);
            }

            if (spoilerContent) {
                const spoilerKey = `spoiler-${match.index}-${spoilerContent.slice(0, 10)}`;
                children.push(
                    <div key={spoilerKey} className={`b_spoiler_textoverflow`}>
                        <div
                            className={`spoiler_button ${visibleSpoilers.has(spoilerKey) ? 'opened' : ''}`}
                            onClick={() => toggleSpoiler(spoilerKey)}
                            style={{
                                borderRadius: visibleSpoilers.has(spoilerKey) ? '8px 8px 0 0' : '',
                            }}
                        >
                            <span>Спойлер</span>
                        </div>
                        <div
                            className={`spoiler_content hidden ${visibleSpoilers.has(spoilerKey) ? 'visible' : ''}`}
                            style={{
                                maxHeight: visibleSpoilers.has(spoilerKey) ? '99999px' : '0',
                                overflow: 'hidden',
                            }}
                        >
                            <span>{parse(spoilerContent)}</span>
                        </div>
                    </div>
                );
            } else if (divContent) {
                const styleMatch = divAttributes?.match(/style="([\s\S]*?)"/);
                const styles = styleMatch ? parseStyleString(styleMatch[1]) : {};

                const processedDivContent = processTextWithSpoilersAndDivs(divContent);

                children.push(
                    <div key={`div-${match.index}`} style={styles} className={'custom_div_element'}>
                        {processedDivContent}
                    </div>
                );
            }
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < rawText.length) {
            const remainingText = rawText.slice(lastIndex);
            const textLines = remainingText
                .split('\n')
                .filter((line) => line.trim())
                .map((line, idx) => (
                    <div key={`line-${lastIndex}-${idx}`}>
                        {line[0] !== '<' && <span style={{marginLeft: '1em'}}>&emsp;</span>}
                        {parse(line, {
                            replace: (domNode) => {
                                if (domNode.type === 'tag' && domNode.name === 'a' && domNode.children && domNode.children.length > 0) {
                                    if (!tooltipData || !tooltipData.info) {
                                        const style = domNode.attribs.style || ''
                                        console.log(style)
                                        return (
                                            <a href={domNode.attribs.href} style={{...parseStyleString(style)}}>
                                                {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                            </a>
                                        );
                                    }

                                    const href = domNode.attribs.href;
                                    const match = href.match(/\/characters\/(\d+)/);
                                    const characterKey = match ? match[1] : null;

                                    console.log('domNode.attribs.href:', href);
                                    console.log('characterKey:', characterKey);

                                    const characters = Object.values(tooltipData?.info).find(
                                        (character): character is ICharactersInfo => {
                                            return typeof character === 'object' && character !== null && 'id' in character && character.id === characterKey;
                                        }
                                    );
                                    console.log('characterData:', characters);
                                    const style = domNode.attribs.style || ''
                                    console.log(style)
                                    if (!characters) {
                                        return (
                                            <a href={domNode.attribs.href} style={{...parseStyleString(style)}}>
                                                {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                            </a>
                                        );
                                    }

                                    const matchIndex = match ? match.index : 'unknown';

                                    return (
                                        <Tooltip
                                            key={`tooltip-${matchIndex}-${idx || 'unknown'}`}
                                            title={
                                                <div className={'tooltip_character_root'}>
                                                    <div className={'story_right_title'}>
                                                        <h6>{characters?.name_rus}
                                                            {characters?.name_eng &&
                                                                <span style={{color: 'gray'}}> / </span>}
                                                            {characters?.name_eng}
                                                        </h6>
                                                    </div>
                                                    <div className={'story_info_left'}>
                                                        <div>
                                                            <div onClick={handleModal} className={'char_info_cover'}>
                                                                <div className={'div_image_big'}
                                                                     style={{backgroundImage: 'url(' + `${characters?.cover ? characters?.cover : imageNF}` + ')'}}>
                                                                </div>
                                                            </div>
                                                            <Modal open={openModal} onClose={handleClose}
                                                                   onKeyDown={handleCloseModal}>
                                                                <div>
                                                                    <Button onClick={handleClose}>x</Button>
                                                                </div>
                                                                <div style={{marginTop: '50px'}}>
                                                                    <img
                                                                        src={`${characters?.cover ? characters?.cover : imageNF}`}
                                                                        alt={'story_img'}/>
                                                                </div>
                                                            </Modal>
                                                        </div>
                                                    </div>
                                                    <div className={'char_info_right_tltp'}>
                                                        <div>
                                                            <div className={'story_right_commons'}>
                                                                <div>
                                                                    {characters?.names &&
                                                                        <div>
                                                                            <span><strong>Прочие имена:</strong> {characters?.names}</span>
                                                                        </div>
                                                                    }
                                                                    <div>
                                                                        <span><strong>Дата рождения: </strong>{characters?.birthday ? moment(characters?.birthday).format('D MMM YYYY [г.]') : 'Неизвестно'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span><strong>Возраст в годах: </strong>{characters?.age ? characters?.age : 'Неизвестно'}</span>
                                                                    </div>
                                                                    <div className={'character_right_status'}>
                                                                        <div>
                                                                            <span><strong>Статус: </strong></span>
                                                                        </div>
                                                                        <div className={'char_right_status'}>
                                                                            <div
                                                                                className={(characters?.life_status === 'lively') ? 'char_right_status_lively' : characters?.life_status === 'dead' ? 'char_right_status_dead' : 'char_right_status_unknown'}>
                                                                                <span>{(characters?.life_status === 'lively') ? 'Жив(-а)' : characters?.life_status === 'dead' ? 'Мертв(-а)' : 'Неизвестно'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                    </div>
                                                                    <div>
                                                    <span><strong>Дата добавления: </strong>
                                                        {characters?.date_created
                                                            ?
                                                            `${moment(characters?.date_created).format('D MMM YYYY [г.]')}`
                                                            :
                                                            'Неизвестно'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={'char_page_va_root'}>
                                                                {characters?.va_char_name &&
                                                                    <div>
                                                                        <div className={'char_page_va_char'}>
                                                                            <div className={'char_page_va_char_title'}>
                                                                                <h4>Персонаж озвучки:</h4>
                                                                            </div>
                                                                            <div className={'char_page_va_char_info'}>
                                                                                <div>
                                                                                    <img
                                                                                        src={`${characters?.va_char_avatar ? characters?.va_char_avatar : imageNF}`}
                                                                                        alt={'char_va_avatar'}/>
                                                                                </div>
                                                                                <div>
                                                                                    <h4>{characters?.va_char_name}</h4>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                                {characters?.va_name &&
                                                                    <div>
                                                                        <div className={'char_page_va_seiyuu'}>
                                                                            <div
                                                                                className={'char_page_va_seiyuu_title'}>
                                                                                <h4>Сэйю:</h4>
                                                                            </div>
                                                                            <div className={'char_page_va_info'}>
                                                                                <div>
                                                                                    <img
                                                                                        src={`${characters?.va_avatar ? characters?.va_avatar : imageNF}`}
                                                                                        alt={'char_va_avatar'}/>
                                                                                </div>
                                                                                <div>
                                                                                    <h4>{characters?.va_name}</h4>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div className={'story_right_description'}>
                                                                <div className={'story_right_description_title'}>
                                                                    <span><strong>Описание</strong></span>
                                                                </div>
                                                                <div className={'char_desc_tltp'}>
                                                                    {characters?.description ?
                                                                        <span>
                                                                            <TextOverflowV19 maxHeight={400}
                                                                                          text={characters?.description}
                                                                            />
                                                                        </span>
                                                                        :
                                                                        <span>Описание отсутствует...</span>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            arrow
                                            placement="top"
                                        >
                                            <a href={domNode.attribs.href} style={{...parseStyleString(style)}}>
                                                {domNode.children[0].type === 'text' ? domNode.children[0].data : ''}
                                            </a>
                                        </Tooltip>
                                    );
                                }
                                return domNode;
                            },
                        })}
                    </div>
                ));
            children.push(...textLines);
        }

        return <div className="text_overflow">{children}</div>;
    };

    return (
        <div
            className={`text-block ${isExpanded || isShortText ? 'expanded' : ''}`}
            style={{maxHeight: isExpanded ? '' : `${maxHeight}px`}}
        >
            <div className="text-content" ref={textRef}>
                {typeof text === 'string' ? processTextWithSpoilersAndDivs(text) : text}
            </div>
            {!isExpanded && !isShortText && (
                <div className="overlay">
                    <div>
                        <div onClick={() => setIsExpanded(true)}>
                            <button>Развернуть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTooltip