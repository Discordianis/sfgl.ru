import React, {ButtonHTMLAttributes, DetailedHTMLProps} from "react";
import './Button.css'
interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>{
    isActive?: boolean
}

const Button: React.FC<ButtonProps> = ({children, isActive, ...props}) => {
    return (
        <button className={isActive ? 'button active' : 'button'} {...props}>{children}</button>
    )
}
export default Button