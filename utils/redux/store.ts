// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import counterReducer from './slice/counter.slice';
import uploadStatsReducer from './slice/uploadStats.slice';

const rootReducer = combineReducers({
  counter: counterReducer,
  uploadStats: uploadStatsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;