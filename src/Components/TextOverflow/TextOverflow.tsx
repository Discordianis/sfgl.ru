import './TextOverflow.css';
import React, { useEffect, useRef, useState } from 'react';
import parse from "html-react-parser";
import Tooltip from '@mui/material/Tooltip';

interface ITextBlockProps {
    text: string | React.ReactNode;
    maxHeight: number;
    open?: boolean;
}

const TextOverflow: React.FC<ITextBlockProps> = ({ text, maxHeight, open }) => {
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

    useEffect(() => {
        if (open) {
            setIsExpanded(open);
        }
    }, [open]);

    const processTextWithSpoilersAndDivs = (rawText: string): React.ReactNode[] => {
        const children: React.ReactNode[] = [];
        const regex =
            /\[spoiler\]([\s\S]*?)\[\/spoiler\]|\[div(.*?)\]([\s\S]*?)\[\/div\]|\[info\s+info="(.*?)"\](.*?)\[\/info\]/g;

        let match;
        let lastIndex = 0;

        while ((match = regex.exec(rawText)) !== null) {
            if (lastIndex < match.index) {
                const precedingText = rawText.slice(lastIndex, match.index);
                children.push(renderInlineText(precedingText, `pre-${match.index}`));
            }

            if (match[1]) { // Spoiler
                const spoilerContent = match[1];
                const spoilerKey = `spoiler-${match.index}-${spoilerContent.slice(0, 10)}`;
                children.push(
                    <div key={spoilerKey} className="b_spoiler_textoverflow">
                        <div
                            className={`spoiler_button ${visibleSpoilers.has(spoilerKey) ? 'opened' : ''}`}
                            onClick={() => toggleSpoiler(spoilerKey)}
                            style={{ borderRadius: visibleSpoilers.has(spoilerKey) ? '8px 8px 0 0' : '' }}
                        >
                            <span>Спойлер</span>
                        </div>
                        <div
                            className={`spoiler_content hidden ${visibleSpoilers.has(spoilerKey) ? 'visible' : ''}`}
                            style={{ maxHeight: visibleSpoilers.has(spoilerKey) ? '99999px' : '0' }}
                        >
                            <span>{parse(spoilerContent)}</span>
                        </div>
                    </div>
                );
            } else if (match[3]) { // Div
                const divAttributes = match[2];
                const divContent = match[3];
                const styleMatch = divAttributes?.match(/style="([\s\S]*?)"/);
                const styles = styleMatch ? parseStyleString(styleMatch[1]) : {};

                children.push(
                    <div key={`div-${match.index}`} style={styles} className="custom_div_element">
                        {processTextWithSpoilersAndDivs(divContent)}
                    </div>
                );
            } else if (match[4]) { // Info
                const tooltipText = match[4];
                const infoText = match[5];
                children.push(
                    <Tooltip key={`info-${match.index}`} title={tooltipText}>
                        <a style={{ cursor: 'pointer', display: 'inline' }}>{parse(infoText)}</a>
                    </Tooltip>
                );
            }
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < rawText.length) {
            const remainingText = rawText.slice(lastIndex);
            children.push(renderInlineText(remainingText, `post-${lastIndex}`));
        }

        return children;
    };

    const renderInlineText = (text: string, keyPrefix: string): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        const lines = text.split(/\n+/).filter(Boolean);

        lines.forEach((line, idx) => {
            if (line.trim()) {
                parts.push(<span className={'style_no_space'} key={`${keyPrefix}-${idx}`}>{parse(line)}</span>);
            }
        });

        return parts;
    };

    useEffect(() => {
        const textContainer = textRef.current;
        if (!textContainer) return;
        let count = 0
        const spans = textContainer.querySelectorAll('span');
        spans.forEach((span) => {
            const nextSibling = span.nextElementSibling;
            const nextNextSibling = nextSibling?.nextElementSibling;
            const hasDiv = span.querySelector('div');

            if (hasDiv) {
                span.innerHTML = `${span.innerHTML}`;
            } else {
                if (count > 0) {
                    span.innerHTML = `&emsp;${span.innerHTML}`;
                }
            }
            if (count === 0) {
                span.style.marginTop = 'unset'
            }
            count++;

            if (nextSibling?.tagName === 'A') {
                span.appendChild(nextSibling);
                span.className = 'anotherDisplayForA'
                if (nextNextSibling?.tagName === 'SPAN') {
                    const copiedLink = nextNextSibling.cloneNode(true);
                    span.appendChild(copiedLink);
                    nextNextSibling.remove();
                }
            }
        });
    }, [text]);




    return (
        <div
            className={`text-block ${isExpanded || isShortText ? 'expanded' : ''}`}
            style={{ maxHeight: isExpanded ? '' : `${maxHeight}px` }}
        >
            <div className="text-content inline_fck_text" ref={textRef}>
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

export default TextOverflow;