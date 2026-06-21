import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import searchReducer from "./slices/searchSlice";
import interestReducer from "./slices/interestSlice";
import languageReducer from "./slices/languageSlice";
import adminReducer from "./slices/adminSlice"; // ADD THIS

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "language"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  search: searchReducer,
  interest: interestReducer,
  language: languageReducer,
  admin: adminReducer, // ADD THIS
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
