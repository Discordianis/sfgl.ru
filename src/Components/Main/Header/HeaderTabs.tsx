import React from "react";
import {NavLink} from "react-router-dom";

const HeaderTabs: React.FC = () => {

    return(
        <div className={'header_tabs_root'}>
            <nav>
                <>
                    <NavLink to={'/archive'}>
                        <span>Профили и отношения</span>
                    </NavLink>
                    <NavLink to={'/wall'}>
                        <span>Стена</span>
                    </NavLink>
                    <NavLink to={'/roundtable'}>
                        <span>Итоги КС</span>
                    </NavLink>
                    <NavLink to={'/fridays'}>
                        <span>Пятницы</span>
                    </NavLink>
                    <NavLink to={'/library'}>
                        <span>ЛабЛиб</span>
                    </NavLink>
                </>
            </nav>
        </div>
    )
}

export default HeaderTabs