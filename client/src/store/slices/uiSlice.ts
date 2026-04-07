import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ScreenType, IToast } from '@/common/types';

interface IUiState {
  screen: ScreenType;
  previousScreen: ScreenType;
  toasts: IToast[];
  gameAssetsLoaded: boolean;
}

const INITIAL_STATE: IUiState = {
  screen: 'mainMenu',
  previousScreen: 'mainMenu',
  toasts: [],
  gameAssetsLoaded: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: INITIAL_STATE,
  reducers: {
    navigateTo(state, action: PayloadAction<ScreenType>) {
      state.previousScreen = state.screen;
      state.screen = action.payload;
    },
    addToast(state, action: PayloadAction<Omit<IToast, 'id'>>) {
      const id = Math.random().toString(36).substr(2, 9);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setGameAssetsLoaded(state, action: PayloadAction<boolean>) {
      state.gameAssetsLoaded = action.payload;
    },
  },
});

export const { navigateTo, addToast, removeToast, setGameAssetsLoaded } =
  uiSlice.actions;
export default uiSlice.reducer;
