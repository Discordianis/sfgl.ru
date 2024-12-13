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

    const processTextWithSpoilers = (rawText: string) => {
        return rawText
            .split(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/)
            .map((part, index) => {
                // Пропускаем пустые части
                if (!part.trim()) return null;

                if (index % 2 === 1) {
                    // Уникальный ключ для спойлера
                    const spoilerKey = `spoiler-${index}-${part.slice(0, 10)}`;

                    // Это текст внутри спойлера
                    return (
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
                                <span>{parse(part)}</span>
                            </div>
                        </div>
                    );
                }

                // Это обычный текст
                return (
                    <div key={index} className={'text_overflow'}>
                        {part
                            .split('\n')
                            .filter((line) => line.trim()) // Пропускаем пустые строки
                            .map((line, idx) => (
                                <div key={idx}>
                                    {line[0] !== '<' && <span style={{ marginLeft: '1em' }}>&emsp;</span>}
                                    {parse(line)}
                                </div>
                            ))}
                    </div>
                );
            })
            .filter(Boolean); // Убираем все null значения
    };

    return (
        <div
            className={`text-block ${isExpanded || isShortText ? 'expanded' : ''}`}
            style={{ maxHeight: isExpanded ? '' : `${maxHeight}px` }}
        >
            <div className="text-content" ref={textRef}>
                {typeof text === 'string' ? processTextWithSpoilers(text) : text}
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