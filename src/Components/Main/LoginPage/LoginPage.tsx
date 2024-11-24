import './LoginPage.css'
import React, {useEffect, useState} from "react";
import BG from "../../../../public/background/card.png";
import Button from "../../Button/Button";
import {NavLink, useNavigate} from "react-router-dom";
import useInput from "../../../hooks/useInput";
import CryptoJS from 'crypto-js';
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";

const LoginPage: React.FC = () => {
    const inputNickname = useInput("", {});
    const inputPassword = useInput("", {});
    const [widthMaxError, setWidthMaxError] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const url = useSelector((state: RootState) => state.server.server)

    function hashPasswordWithSalt(password: string) {
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const hashedPassword = hashPasswordWithSalt(inputPassword.value);
        try {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify({action: "login", conditions: {nickname: inputNickname.value, password: hashedPassword}})
            }).then(response => response.json())
                .then(result => {
                    if (result.status) {
                        if (result.info.password === hashedPassword) {
                            localStorage.setItem('token', result.info.token)
                            setError(null);
                            navigate('/');
                            window.location.reload();
                        } else {
                            setError('Неправильный логин или пароль');
                        }
                    } else {
                        setError('Неправильный логин или пароль');
                    }
                })
        } catch (err) {
            console.error(err);
            setError('Ошибка при входе. Попробуйте еще раз.');
        }
    };

    useEffect(() => {
        const sizeMax = () => {
            if (window.innerWidth <= 835) {
                setWidthMaxError(true)
            }
            else {
                setWidthMaxError(false)
            }
        }
        sizeMax()

        window.addEventListener('resize', sizeMax)
    }, []);

    return (
        <>
            {!localStorage.getItem('token') ?
                <div className='login_page_root'>
                    <div>
                        <div style={{ background: !widthMaxError ? `url(${BG})` : '' }} className={widthMaxError ? 'login_page_nobg' : 'login_page_bg'}>
                            <form onSubmit={handleLogin}>
                                <h2>Вход в аккаунт</h2>
                                <div className='login_form'>
                                    <div className='login_nickname'>
                                        <label>
                                            Имя пользователя:
                                            <input type='text' name='nickname' autoComplete='name'
                                                   value={inputNickname.value}
                                                   onChange={(e) => inputNickname.onChange(e)}
                                                   required />
                                        </label>
                                    </div>
                                    <div className='login_password'>
                                        <label>
                                            Пароль:
                                            <input type='password' name='password' autoComplete='current-password'
                                                   value={inputPassword.value}
                                                   onChange={(e) => inputPassword.onChange(e)}
                                                   required />
                                        </label>
                                    </div>
                                    <div className='login_button'>
                                        <Button type='submit'>Войти</Button>
                                    </div>
                                    {error &&
                                        <div>
                                            <span>{error}</span>
                                        </div>
                                    }
                                </div>
                            </form>
                            <div className='or_regist'>
                                <span>Нет аккаунта?</span>
                                <nav>
                                    <NavLink to='/registration'>
                                        <Button type='button'>Зарегистрироваться</Button>
                                    </NavLink>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div>
                    <h2>Вы уже вошли в систему!</h2>
                    <nav>
                        <NavLink to='/'>
                            <Button>Вернуться на главную</Button>
                        </NavLink>
                    </nav>
                </div>
            }
        </>
    );
};

export default LoginPage;