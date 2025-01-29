import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const testApi = createApi({
    reducerPath: 'api/test',
    baseQuery: fetchBaseQuery({baseUrl: 'https://sfgl.ru/'}),
    endpoints: (build) => ({
        getTest: build.mutation({
            query: () => ({
                url: 'server2.php',
                method: 'POST',
                body: {token: '', action: 'getAllUsers'},
            })
        })
    })
})

export const {useGetTestMutation} = testApi