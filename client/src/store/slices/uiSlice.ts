import { createSlice, type PayloadAction, nanoid } from '@reduxjs/toolkit';

import type {
  ScreenType,
  IToast,
  IPlayerProfile,
  IModalConfig,
} from '@/common/types';

interface IUiState {
  screen: ScreenType;
  previousScreen: ScreenType;
  toasts: IToast[];
  gameAssetsLoaded: boolean;
  profileModal: {
    isOpen: boolean;
    player: IPlayerProfile | null;
    isError: boolean;
  };
  isWeatherModalOpen: boolean;
  confirmModal: IModalConfig | null;
}

const INITIAL_STATE: IUiState = {
  screen: 'mainMenu',
  previousScreen: 'mainMenu',
  toasts: [],
  gameAssetsLoaded: false,
  profileModal: {
    isOpen: false,
    player: null,
    isError: false,
  },
  isWeatherModalOpen: false,
  confirmModal: null,
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
    openProfileModal(
      state,
      action: PayloadAction<{
        player: IPlayerProfile | null;
        isError?: boolean;
      }>,
    ) {
      state.profileModal = {
        isOpen: true,
        player: action.payload.player,
        isError: action.payload.isError ?? false,
      };
    },
    closeProfileModal(state) {
      state.profileModal.isOpen = false;
    },
    openWeatherModal(state) {
      state.isWeatherModalOpen = true;
    },
    closeWeatherModal(state) {
      state.isWeatherModalOpen = false;
    },
    openConfirmModal(state, action: PayloadAction<IModalConfig>) {
      state.confirmModal = action.payload;
    },
    closeConfirmModal(state) {
      state.confirmModal = null;
    },
  },
});

export const {
  navigateTo,
  addToast,
  removeToast,
  setGameAssetsLoaded,
  openProfileModal,
  closeProfileModal,
  openWeatherModal,
  closeWeatherModal,
  openConfirmModal,
  closeConfirmModal,
} = uiSlice.actions;

export default uiSlice.reducer;
