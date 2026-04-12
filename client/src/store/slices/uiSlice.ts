import { createSlice, type PayloadAction, nanoid } from '@reduxjs/toolkit';

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

    addToast: {
      reducer(state, action: PayloadAction<IToast>) {
        state.toasts.push(action.payload);
      },
      prepare(toast: Omit<IToast, 'id'>) {
        return {
          payload: {
            ...toast,
            id: nanoid(),
          },
        };
      },
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
