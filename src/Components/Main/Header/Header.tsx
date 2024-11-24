import React, {useEffect, useState} from "react";
import Logo from "./Logo.tsx";
import Login from "./Login.tsx";
import './Header.css'
import HeaderTabs from "./HeaderTabs.tsx";
import Button from "../../Button/Button.tsx";
import {NavLink} from "react-router-dom";
import Modal from "../../Modal/Modal.tsx";
import menuButton from '../../../../public/icons/menuButton.png'
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";

const Header: React.FC = () => {

    const [widthMaxError, setWidthMaxError] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const userData = useSelector((state: RootState) => state.myData?.data?.info)
    const token = localStorage.getItem('token')

    useEffect(() => {
        const sizeMax = () => {
            if (window.innerWidth <= 1292) {
                setWidthMaxError(true)
            }
            else {
                setWidthMaxError(false)
            }
        }
        sizeMax()

        window.addEventListener('resize', sizeMax)
    }, []);

    const closeModal = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape') {
            setOpenModal(false)
        }
    }

    const handleClose = () => {
        setOpenModal(false)
    }

    return(
        <div className={'header_root'}>
            <header>
                <Logo />
                {!widthMaxError ?
                    <>
                        <HeaderTabs />
                        <Login />
                    </>
                :
                    <div>
                        <div className={'header_modal_menu_button'} onClick={() => setOpenModal(true)}>
                            <img src={`${menuButton}`} alt={'menu_button'}/>
                        </div>
                        <Modal open={openModal} onKeyDown={closeModal} onClose={handleClose}>
                            <div className={'header_modal'}>
                                <div className={'header_modal_title'}>
                                    <h3>Навигация по сайту</h3>
                                    <Button onClick={() => setOpenModal(false)}>X</Button>
                                </div>
                                <div className={'header_modal_tabs'}>
                                    <NavLink to={'/archive'} onClick={() => setOpenModal(false)}>
                                        <span>Профили и отношения</span>
                                    </NavLink>
                                    <NavLink to={'/wall'} onClick={() => setOpenModal(false)}>
                                        <span>Стена</span>
                                    </NavLink>
                                    <NavLink to={'/roundtable'} onClick={() => setOpenModal(false)}>
                                        <span>Итоги КС</span>
                                    </NavLink>
                                    <NavLink to={'/fridays'} onClick={() => setOpenModal(false)}>
                                        <span>Пятницы</span>
                                    </NavLink>
                                    <NavLink to={'/library'} onClick={() => setOpenModal(false)}>
                                        <span>ЛабЛиб</span>
                                    </NavLink>
                                    <div className={token ? 'header_modal_last_profile' : 'header_modal_last_login'}>
                                        <NavLink to={`/users/${userData?.nickname}`} onClick={() => setOpenModal(false)}>
                                            {token ?
                                                <div className={'header_modal_user'}>
                                                    <img src={`${userData?.avatar}`} alt={'user_avatar'}/>
                                                    <span>{userData?.custom_nickname}</span>
                                                </div>
                                                :
                                                <div className={'header_modal_login'}>
                                                    <Login />
                                                </div>
                                            }
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                }
            </header>
        </div>
    )
}

export default Header