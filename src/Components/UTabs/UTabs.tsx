import React, {HTMLAttributes, ReactNode} from "react";
import './UTabs.css'

interface UTabsProps extends HTMLAttributes<HTMLDivElement>{
    children?: ReactNode
    isActive?: boolean
}

const UTabs: React.FC<UTabsProps> = ({children, isActive, ...props}) => {
    return (
        <>
            <div className={isActive ? 'utabs active' : 'utabs'} {...props}>{children}</div>
        </>
    )
}

export default UTabs