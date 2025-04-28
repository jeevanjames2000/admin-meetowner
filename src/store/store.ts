import { configureStore } from "@reduxjs/toolkit";

import propertyDetails from "./slices/propertyDetails";
import authentication from './slices/authSlice';
import listingReducer from './slices/listings';
import usersReducers from './slices/users';
import leadsReducers from './slices/leads';
import employeeReducer from './slices/employee'
import uploadReducer from './slices/uploadSlice';
import approvedReducer from './slices/approve_listings';
import { initializeAuthState } from "../utils/authutils";
import placesReducer from "./slices/places"
import adSlice from './slices/adSlice'

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
        upload:uploadReducer,
        approved:approvedReducer,
        places:placesReducer,
        ads:adSlice
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

