import './TextOverflowOld.css'
import React, {useEffect, useRef, useState} from "react";
interface ITextBlockProps {
    text: string | React.ReactNode;
    children?: React.ReactNode
    maxHeight: number
}
const TextOverflow: React.FC<ITextBlockProps> = ({ text, maxHeight, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isShortText, setIsShortText] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (textRef.current) {
            const innerHeight = textRef.current.scrollHeight;
            setIsShortText(innerHeight <= maxHeight);
        }
    }, [isShortText, maxHeight]);
    return (
        <div className={`text-block ${isExpanded || isShortText ? 'expanded' : ''}`} style={{maxHeight: isExpanded ? '' : `${maxHeight}px`}}>
            <div className="text-content" ref={textRef}>
                {text}
                {children}
            </div>
            {(!isExpanded && !isShortText) &&
                <div className="overlay">
                    <div>
                        <div onClick={() => setIsExpanded(true)}>
                            <button>Развернуть</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};
export default TextOverflow;