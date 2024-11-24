import React, {ReactNode, useEffect, useRef, useState} from 'react';
import './ContextMenu.css'

interface ContextMenuProp {
    children: ReactNode
}
const ContextMenu:React.FC<ContextMenuProp> = ({children}) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const bottonRef = useRef(null)
    const menuRef = useRef<HTMLDivElement | null>(null)

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setMenuVisible(!menuVisible);
    };

    const handleClickOutside = (e: MouseEvent) => {
        const currentMenu = menuRef.current
        if (currentMenu &&
            !currentMenu.contains(e.target as Node)
        ){
            setMenuVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
    }, []);

    return (
        <div className={'context_menu_root'}>
            {!menuVisible &&
                <span ref={bottonRef} className={'context_menu_button'} onClick={handleButtonClick}>+</span>
            }
            {menuVisible && (
                <div ref={menuRef} className={'context_menu'}>
                    {[children]}
                </div>
            )}
        </div>
    );
};

export default ContextMenu
