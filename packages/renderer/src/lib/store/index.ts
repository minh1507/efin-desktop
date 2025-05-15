import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import localForageStorage from './sqlite-storage';
import authReducer from './slices/authSlice';
import statsReducer from './slices/statsSlice';

// Cấu hình Redux Persist
const persistConfig = {
  key: 'root',
  storage: localForageStorage,
  whitelist: ['auth'] // Chỉ lưu auth state vào IndexedDB thông qua localForage
};

const rootReducer = combineReducers({
  auth: authReducer,
  stats: statsReducer,
  // thêm các reducers khác ở đây
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 