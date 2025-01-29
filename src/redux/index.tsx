import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {dataReducer} from "./myData.tsx";
import {serverReducer} from "./server.tsx";
import {testApi} from "./test.tsx";

const rootReduces = combineReducers({
    myData: dataReducer,
    server: serverReducer,
    [testApi.reducerPath]: testApi.reducer
})

const store = configureStore({
    reducer: rootReduces,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(testApi.middleware)
})
export default store
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;