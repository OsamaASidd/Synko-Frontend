import { configureStore } from "@reduxjs/toolkit";
import tableReducer from "./slices/tableSlice"; // Import your slice reducer
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use localStorage for web
import { createWrapper } from "next-redux-wrapper"; // Import for Next.js
import subscriptionReducer from "./slices/subscriptionSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["items"],
  timeout: 1000,
};

const persistedReducer = persistReducer(persistConfig, tableReducer);

const makeStore = () => {
  return configureStore({
    reducer: {
      items: persistedReducer,
      subscription: subscriptionReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }),
  });
};

export const store = makeStore(); // Create the store instance
export const persistor = persistStore(store); // Create persistor

// Create the wrapper using the makeStore function
export const wrapper = createWrapper(makeStore);
