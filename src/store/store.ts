import { configureStore } from "@reduxjs/toolkit";

import propertyDetails from "./slices/propertyDetails";
import authentication from './slices/authSlice';
import listingReducer from './slices/listings';
import usersReducers from './slices/users';
import leadsReducers from './slices/leads';
import employeeReducer from './slices/employee'
import uploadReducer from './slices/uploadSlice';
import { initializeAuthState } from "../utils/authutils";

const preloadedState = {
    auth : initializeAuthState()
}

const store =  configureStore({
    reducer : {
        property:propertyDetails,
        auth:authentication,
        listings: listingReducer,
        users:usersReducers,
        leads:leadsReducers,
        employee:employeeReducer,
        upload:uploadReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

