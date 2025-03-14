import React from "react";
import {NavLink} from "react-router-dom";

const HeaderTabs: React.FC = () => {

    return(
        <div className={'header_tabs_root'}>
            <nav>
                <>
                    <NavLink to={'/archive'}>
                        <div data-text="Профили и отношения">
                            <span>Профили и отношения</span>
                        </div>
                    </NavLink>
                    <NavLink to={'/wall'}>
                        <div data-text="Стена">
                            <span>Стена</span>
                        </div>
                    </NavLink>
                    <NavLink to={'/roundtable'}>
                        <div data-text="Итоги КС">
                            <span>Итоги КС</span>
                        </div>
                    </NavLink>
                    <NavLink to={'/fridays'}>
                        <div data-text="Пятницы">
                            <span>Пятницы</span>
                        </div>
                    </NavLink>
                    <NavLink to={'/library'}>
                        <div data-text="ЛабЛиб">
                            <span>ЛабЛиб</span>
                        </div>
                    </NavLink>
                </>
            </nav>
        </div>
    )
}

export default HeaderTabs