import { createSlice } from "@reduxjs/toolkit";

interface IData {
    status: boolean,
    info: {
        about: string,
        age: string,
        avatar: string,
        background: string,
        birthday: string,
        custom_nickname: string,
        date_modified: string,
        id: string,
        last_online_date: string,
        music: string,
        nickname: string,
        online: string,
        orientation: string,
        password: string,
        token: string,
        witch_access: string,
        styles: string
    }
}

interface MyDataState {
    data: IData | null;
}

const initialState: MyDataState = {
    data: null,
};

const dataSlice = createSlice({
    name: 'myData',
    initialState,
    reducers: {
        fetchDataSuccess(state, action) {
            state.data = action.payload;
        },
    },
});

export const {fetchDataSuccess} = dataSlice.actions;
export const dataReducer = dataSlice.reducer;
