import React, {useState} from "react";
import Button from "../../../Button/Button.tsx";
import Modal from "../../../Modal/Modal.tsx";
import {NavLink, useParams} from "react-router-dom";
import './ProfileModalMenu.css'
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux";

const ProfileModalMenu: React.FC = () => {

    const [openModal, setOpenModal] = useState(false)
    const params = useParams()
    const myData = useSelector((state: RootState) => state.myData)

    const handleModal = () => {
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
    }

    const handleCloseModal = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape'){
            setOpenModal(false)
        }
    }

    const exitFromAccount = () => {
        localStorage.removeItem('token')

        window.location.reload()
    }

    return(
        <>
            <Button onClick={handleModal}>Открыть меню</Button>
            <div>
                <Modal open={openModal} onKeyDown={handleCloseModal} onClose={handleClose}>
                    <div className={'profile_modal_title_button'}>
                        <div className={'modal_profile_title'}>
                            <h3>Меню профиля</h3>
                        </div>
                        <div>
                            <Button onClick={() => setOpenModal(false)}>x</Button>
                        </div>
                    </div>
                    <div className={'profile_modal_general'}>
                        <div className={'profile_modal_add'}>
                            <div className={'profile_modal_title'}>
                                <h3>Добавление</h3>
                            </div>
                            <div className={'profile_modal_function'}>
                                <NavLink to={`/users/${params.nickname}/createInfo/archive`}>
                                    <span>Добавить информацию в архив</span>
                                </NavLink>
                            </div>
                            <div className={'profile_modal_function'}>
                                <NavLink to={`/users/${params.nickname}/createInfo/roundTable`}>
                                    <span>Добавить итоги КС</span>
                                </NavLink>
                            </div>
                            <div className={'profile_modal_function'}>
                                <NavLink to={`/users/${params.nickname}/createInfo/fridays`}>
                                    <span>Добавить пятницу</span>
                                </NavLink>
                            </div>
                            <div className={'profile_modal_function'}>
                                <NavLink to={`/users/${params.nickname}/createInfo/library`}>
                                    <span>Зона поэзии</span>
                                </NavLink>
                            </div>
                        </div>
                        <div className={'profile_modal_other'}>
                            <div className={'profile_modal_title'}>
                                <h3>Прочее</h3>
                            </div>
                            {myData.data?.info.nickname === 'MrZaxter' &&
                                <div className={'profile_modal_function'}>
                                    <NavLink to={`/admin`}>
                                        <span>Админова панель</span>
                                    </NavLink>
                                </div>
                            }
                            <div className={'profile_modal_function'}>
                                <NavLink to={`/users/${params.nickname}/settings`}>
                                    <span>Настройки профиля</span>
                                </NavLink>
                            </div>
                            <div className={'profile_modal_function'}>
                                <NavLink to={'/'}>
                                    <span onClick={exitFromAccount}>Выйти из аккаунта</span>
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>

        </>
    )
}

export default ProfileModalMenu