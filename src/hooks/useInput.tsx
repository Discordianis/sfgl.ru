import React, { useState } from "react";
import useValidation from "./useValidation";

interface IUseInput {
    emptyInput?: boolean;
    minLengthError?: number;
    maxLengthError?: number;
    emailError?: boolean;
    nicknameError?: boolean;
    customNicknameError?: boolean;
    passwordLowerCaseError?: boolean;
    passwordUpperCaseError?: boolean;
    passwordSymbolError?: boolean;
    passwordNumberError?: boolean;
    repeatPasswordError?: string;
}

export default function useInput(defaultValue: string = '', validation: IUseInput) {
    const [value, setValue] = useState<string>(defaultValue);
    const valid = useValidation(value, validation);

    return {
        value, setValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
        onBlur: () => {},
        ...valid,
    };
}
