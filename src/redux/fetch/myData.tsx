
import { createAsyncThunk } from "@reduxjs/toolkit";
import {fetchDataSuccess } from "../myData.tsx";
import {RootState} from "../index.tsx";

export const fetchData = createAsyncThunk('myData/fetchData', async (_, { dispatch, getState }) => {
    const token = localStorage.getItem('token');
    const state = getState() as RootState
    const url = state.server.server
    const env = state.server.env
    if (token) {
        const userRes = await fetch(`${url}`, {
            method: 'POST',
            body: JSON.stringify({action: 'getMyself', token: token})
        })
        const data = await userRes.json();
        if (data.status){
            dispatch(fetchDataSuccess(data))
        }
        else {
            if (env === 'test') {
                console.log(data.info)
            }
            localStorage.removeItem('token')
        }
    }
    return null;
});
