import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface IServer {
    server: string
    env: string
}

const initialState: IServer = {
    server: 'https://sfgl.ru/server2.php',
    env: 'test'
}

const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        serverState: (state, action: PayloadAction<string>) => {
            state.server = action.payload
        },
        envState: (state, action: PayloadAction<string>) => {
            state.env = action.payload
        }
    }
});

export const { serverState, envState } = serverSlice.actions;
export const serverReducer = serverSlice.reducer;
