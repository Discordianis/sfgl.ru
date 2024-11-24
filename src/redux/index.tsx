import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {dataReducer} from "./myData.tsx";
import {serverReducer} from "./server.tsx";

const rootReduces = combineReducers({
    myData: dataReducer,
    server: serverReducer
})

const store = configureStore({
    reducer: rootReduces,
})
export default store
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;