import { configureStore } from "@reduxjs/toolkit";

import propertyDetails from "./slices/propertyDetails";
import authentication from './slices/authSlice';


const store =  configureStore({
    reducer : {
        property:propertyDetails,
        auth:authentication
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

