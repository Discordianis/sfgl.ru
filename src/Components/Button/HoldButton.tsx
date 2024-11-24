import React, { ButtonHTMLAttributes, DetailedHTMLProps, useRef, useState } from "react";
import Button from "./Button.tsx";

interface HoldButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    onClick: () => void;
}

const HoldButton: React.FC<HoldButtonProps> = ({ onClick, children }) => {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const holdTimeout = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        setIsHolding(true);
        const startTime = Date.now();

        holdTimeout.current = setInterval(() => {
            const timeHeld = Date.now() - startTime;
            const newProgress = Math.min((timeHeld / 3000) * 100, 100);
            setProgress(newProgress);

            if (newProgress === 100) {
                clearInterval(holdTimeout.current!);
                onClick();
            }
        }, 1);
    };

    const cancelHold = () => {
        setIsHolding(false);
        setProgress(0);
        if (holdTimeout.current) {
            clearInterval(holdTimeout.current);
            holdTimeout.current = null;
        }
    };

    return (
        <div className={'hold_button'}>
            <Button
                style={{
                    position: 'relative',
                    color: '#b34949',
                    border: '2px solid #b34949',
                    overflow: 'hidden'
                }}
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
            >
                {children}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: `${progress}%`,
                        backgroundColor: 'rgba(179, 73, 73, 0.3)',
                        transition: isHolding ? 'none' : 'height 0.3s ease-out'
                    }}
                />
            </Button>
            <span>(зажмите)</span>
        </div>

    );
};

export default HoldButton;
