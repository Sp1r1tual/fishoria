import { configureStore } from '@reduxjs/toolkit';

import gameReducer from './slices/gameSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import newsReducer from './slices/newsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
    settings: settingsReducer,
    auth: authReducer,
    news: newsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
