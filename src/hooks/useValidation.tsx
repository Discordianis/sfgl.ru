import {useEffect, useState} from "react";

interface IValidations {
    emptyInput?: boolean;
    minLengthError?: number;
    maxLengthError?: number;
    emailError?: boolean;
    nicknameError?: boolean;
    customNicknameError?: boolean;
    passwordUpperCaseError?: boolean
    passwordSymbolError?: boolean
    passwordNumberError?: boolean
    repeatPasswordError?: string;
}

interface IValidationResult {
    emptyInput: boolean;
    minLengthError: boolean;
    maxLengthError: boolean;
    emailError: boolean;
    nicknameError: boolean;
    customNicknameError?: boolean;
    passwordUpperCaseError?: boolean
    passwordSymbolError?: boolean
    passwordNumberError?: boolean
    repeatPasswordError: boolean;
    anyError: boolean;
}

export default function useValidation(value: string, validations: IValidations): IValidationResult{
    const [emptyInput, setEmptyInput] = useState<boolean>(true);
    const [minLengthError, setMinLengthError] = useState<boolean>(false);
    const [maxLengthError, setMaxLengthError] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<boolean>(false);
    const [nicknameError, setNicknameError] = useState<boolean>(false);
    const [customNicknameError, setCustomNicknameError] = useState<boolean>(false);
    const [passwordUpperCaseError, setPasswordUpperCaseError] = useState<boolean>(false);
    const [passwordSymbolError, setPasswordSymbolError] = useState<boolean>(false);
    const [passwordNumberError, setPasswordNumberError] = useState<boolean>(false);
    const [repeatPasswordError, setRepeatPasswordError] = useState<boolean>(false);
    const [anyError, setAnyError] = useState<boolean>(false);

    const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
    const rn = /^[a-zA-Z0-9]+$/
    const rnrus = /^[a-zA-ZА-Яа-яёЁ0-9 _-]+$/
    const rpUpperCase = /^(?=.*[A-Z]).+$/;
    const rpSymbol = /[!@#$%^&*(),.?":{}|<>[\]\/;‘’“”`~\-+\\=_]/;
    const rpNumber = /^(?=.*[0-9]).+$/;


    useEffect(() => {
        for (const validKey in validations) {
            switch (validKey) {
                case "emptyInput":
                    setEmptyInput(value.length === 0);
                    break;
                case "minLengthError":
                    setMinLengthError(value.length < (validations[validKey] as number));
                    break;
                case "maxLengthError":
                    setMaxLengthError(value.length > (validations[validKey] as number));
                    break;
                case "emailError":
                    setEmailError(!re.test(String(value).trim()));
                    break;
                case "nicknameError":
                    setNicknameError(!rn.test(String(value).trim()));
                    break;
                case "customNicknameError":
                    setCustomNicknameError(!rnrus.test(String(value).trim()));
                    break;
                case "passwordUpperCaseError":
                    setPasswordUpperCaseError(!rpUpperCase.test(String(value).trim()));
                    break;
                case "passwordSymbolError":
                    setPasswordSymbolError(!rpSymbol.test(String(value).trim()));
                    break;
                case "passwordNumberError":
                    setPasswordNumberError(!rpNumber.test(String(value).trim()));
                    break;
                case "repeatPasswordError":
                    setRepeatPasswordError(value !== (validations[validKey] as string));
                    break;
                default:
                    break;
            }
        }
    }, [value]);

    useEffect(() => {
        if (emptyInput || minLengthError || maxLengthError || emailError || nicknameError || customNicknameError || passwordUpperCaseError || passwordSymbolError || passwordNumberError || repeatPasswordError){
            setAnyError(true)
        }
        else setAnyError(false)
    }, [emptyInput, minLengthError, maxLengthError, emailError, nicknameError, customNicknameError, passwordUpperCaseError, passwordSymbolError, passwordNumberError, repeatPasswordError]);

    return{
        emptyInput,
        minLengthError,
        maxLengthError,
        emailError,
        nicknameError,
        customNicknameError,
        passwordUpperCaseError,
        passwordSymbolError,
        passwordNumberError,
        repeatPasswordError,
        anyError
    }
}

