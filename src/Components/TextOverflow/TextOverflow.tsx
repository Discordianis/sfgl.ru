import './TextOverflow.css';
import React, { useEffect, useRef, useState } from 'react';
import parse from "html-react-parser";

interface ITextBlockProps {
    text: string | React.ReactNode;
    maxHeight: number;
}

const TextOverflow: React.FC<ITextBlockProps> = ({ text, maxHeight }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isShortText, setIsShortText] = useState(false);
    const [visibleSpoilers, setVisibleSpoilers] = useState<Set<string>>(new Set());
    const textRef = useRef<HTMLDivElement>(null);

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
            fullMatch.toString()

            // Добавляем текст перед текущим тегом
            if (lastIndex < match.index) {
                const precedingText = rawText.slice(lastIndex, match.index);
                const textLines = precedingText
                    .split('\n')
                    .filter((line) => line.trim()) // Пропускаем пустые строки
                    .map((line, idx) => (
                        <div key={`line-${match.index}-${idx}`}>
                            {line[0] !== '<' && <span style={{ marginLeft: '1em' }}>&emsp;</span>}
                            {parse(line)}
                        </div>
                    ));
                children.push(...textLines);
            }

            if (spoilerContent) {
                // Обработка тега [spoiler][/spoiler]
                const spoilerKey = `spoiler-${match.index}-${spoilerContent.slice(0, 10)}`;
                children.push(
                    <div key={spoilerKey} className={`b_spoiler_textoverflow`}>
                        <div
                            className={`spoiler_button ${visibleSpoilers.has(spoilerKey) ? 'opened' : ''}`}
                            onClick={() => toggleSpoiler(spoilerKey)}
                            style={{
                                borderRadius: visibleSpoilers.has(spoilerKey) ? '8px 8px 0 0' : ''
                            }}
                        >
                            <span>Спойлер</span>
                        </div>
                        <div
                            className={`spoiler_content hidden ${visibleSpoilers.has(spoilerKey) ? 'visible' : ''}`}
                            style={{
                                maxHeight: visibleSpoilers.has(spoilerKey) ? '600px' : '0',
                                overflow: 'hidden',
                            }}
                        >
                            <span>{parse(spoilerContent)}</span>
                        </div>
                    </div>
                );
            } else if (divContent) {
                // Обработка тега [div style="..."][/div]
                const styleMatch = divAttributes?.match(/style="([\s\S]*?)"/);
                const styles = styleMatch ? parseStyleString(styleMatch[1]) : {};

                // Рекурсивная обработка вложенных спойлеров в div
                const processedDivContent = processTextWithSpoilersAndDivs(divContent);

                children.push(
                    <div key={`div-${match.index}`} style={styles} className={'custom_div_element'}>
                        {processedDivContent}
                    </div>
                );
            }
            lastIndex = regex.lastIndex;
        }

        // Добавляем оставшийся текст после последнего совпадения
        if (lastIndex < rawText.length) {
            const remainingText = rawText.slice(lastIndex);
            const textLines = remainingText
                .split('\n')
                .filter((line) => line.trim()) // Пропускаем пустые строки
                .map((line, idx) => (
                    <div key={`line-${lastIndex}-${idx}`}>
                        {line[0] !== '<' && <span style={{ marginLeft: '1em' }}>&emsp;</span>}
                        {parse(line)}
                    </div>
                ));
            children.push(...textLines);
        }

        return <div className="text_overflow">{children}</div>;
    };

    return (
        <div
            className={`text-block ${isExpanded || isShortText ? 'expanded' : ''}`}
            style={{ maxHeight: isExpanded ? '' : `${maxHeight}px` }}
        >
            <div className="text-content" ref={textRef}>
                {typeof text === 'string' ? processTextWithSpoilersAndDivs(text) : text}
            </div>
            {(!isExpanded && !isShortText) && (
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

export default TextOverflow;
