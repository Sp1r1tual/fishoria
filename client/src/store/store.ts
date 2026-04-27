import { configureStore } from '@reduxjs/toolkit';

import gameReducer from './slices/gameSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import newsReducer from './slices/newsSlice';
import onlineReducer from './slices/onlineSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
    settings: settingsReducer,
    auth: authReducer,
    news: newsReducer,
    online: onlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/openConfirmModal'],
        ignoredPaths: ['ui.confirmModal.onConfirm', 'ui.confirmModal.onCancel'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
