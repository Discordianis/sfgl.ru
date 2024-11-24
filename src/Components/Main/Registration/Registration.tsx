import React, { useEffect, useState } from "react";
import BG from "../../../../public/background/card.png";
import Button from "../../Button/Button.tsx";
import './Registration.css';
import '../../../hooks/useInput.tsx';
import useInput from "../../../hooks/useInput";
import success from '../../../../public/icons/checkMarkSuccess.png';
import {NavLink, useNavigate} from "react-router-dom";
import CryptoJS from "crypto-js";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";

const Registration: React.FC = () => {
    const nickname = useInput('', { nicknameError: true, emptyInput: true, maxLengthError: 12 });
    const password = useInput('', { passwordLowerCaseError: true, passwordUpperCaseError: true, passwordSymbolError: true, passwordNumberError: true, minLengthError: 8, emptyInput: true });
    const repeatPassword = useInput('', { emptyInput: true, repeatPasswordError: password.value });
    const [widthMaxError, setWidthMaxError] = useState(false);
    const server = useSelector((state: RootState) => state.server.server)
    const navigate = useNavigate()

    const token = localStorage.getItem('token');

    async function hashPasswordWithSalt(password: string): Promise<string> {
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const hashedPassword = await hashPasswordWithSalt(password.value);

        function generateSalt(length = 16): string {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
        }

        const token = generateSalt()

        const userData = {
            nickname: nickname.value,
            custom_nickname: nickname.value,
            password: hashedPassword,
            token: token,
        };

        const bodyData = JSON.stringify({action: "registration", data: userData})

        await fetch(server, {
        method: "POST",
        body: bodyData
        })
        console.log("User registered successfully!");

        navigate('/login');
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
            {!token ?
                <div className={'register_page_root'}>
                    <div>
                        <div className={'password_items'} style={{width: widthMaxError ? '-webkit-fill-available' : '796px'}}>
                            <div className={password.minLengthError ? 'password_error_div' : 'password_success_div'}>
                                <img src={`${success}`} alt={'pass_status'} />
                                <span className={password.minLengthError ? 'password_error' : 'password_success'}>
                                    Пароль должен иметь минимум 8 символов
                                </span>
                            </div>
                            <div
                                className={password.passwordNumberError ? 'password_error_div' : 'password_success_div'}>
                                <img src={`${success}`} alt={'pass_status'}/>
                                <span className={password.passwordNumberError ? 'password_error' : 'password_success'}>
                                    Пароль должен иметь минимум 1 цифру
                                </span>
                            </div>
                            <div
                                className={password.passwordSymbolError ? 'password_error_div' : 'password_success_div'}>
                                <img src={`${success}`} alt={'pass_status'}/>
                                <span className={password.passwordSymbolError ? 'password_error' : 'password_success'}>
                                    Пароль должен иметь минимум 1 специальный символ
                                </span>
                            </div>
                            <div
                                className={password.passwordUpperCaseError ? 'password_error_div' : 'password_success_div'}>
                                <img src={`${success}`} alt={'pass_status'}/>
                                <span
                                    className={password.passwordUpperCaseError ? 'password_error' : 'password_success'}>
                                    Пароль должен иметь минимум 1 заглавную букву
                                </span>
                            </div>
                        </div>
                        <div className={`${widthMaxError ? 'pre_regist_div_nobg' : 'pre_regist_div'}`} style={{ background: !widthMaxError ? `url(${BG})` : '' }}>
                            <form>
                                <h2>Регистрация</h2>
                                <div className={'register_form'}>
                                    <div className={'register_nickname'}>
                                        <label>
                                            Имя пользователя:
                                            <input type={'text'} name={'nickname'} autoComplete={'name'}
                                                   onBlur={() => nickname.onBlur()}
                                                   onChange={(e) => nickname.onChange(e)}
                                                   value={nickname.value} required/>
                                        </label>
                                    </div>
                                    <div className={'register_password'}>
                                        <label>
                                            Пароль:
                                            <input type={'password'} name={'password'} autoComplete={'new-password'}
                                                   onBlur={() => password.onBlur()}
                                                   onChange={(e) => password.onChange(e)}
                                                   value={password.value} required/>
                                        </label>
                                    </div>
                                    <div className={'repeat_register_password'}>
                                        <label>
                                            Повторите пароль:
                                            <input type={'password'} name={'repeat_password'}
                                                   onBlur={() => repeatPassword.onBlur()}
                                                   onChange={(e) => repeatPassword.onChange(e)}
                                                   value={repeatPassword.value} autoComplete={'new-password'} required/>
                                        </label>
                                    </div>
                                    <div className={'register_button'}>
                                        <Button type={'submit'}
                                                disabled={(nickname.anyError || password.anyError || repeatPassword.anyError) || true}>
                                            Зарегистрироваться
                                        </Button>
                                    </div>
                                    <span style={{color: 'gray', fontSize: '13px', display: 'block'}}>Регистрация недоступна.
                                            Пожалуйста, обратитесь к администрации, если вы являетесь сотрудником Лаборатории.</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                :
                <div>
                    <h2>Вы уже вошли в систему!</h2>
                    <nav>
                        <NavLink to={'/'}>
                            <Button>Вернуться на главную</Button>
                        </NavLink>
                    </nav>
                </div>
            }
        </>
    );
};

export default Registration;
