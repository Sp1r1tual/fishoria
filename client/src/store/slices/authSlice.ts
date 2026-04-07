import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IUser } from '@/common/types';

type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  status: AuthStatus;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
    },

    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'succeeded' : 'failed';
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'failed';
    },
  },
});

export const { setUser, clearAuth, setLoading, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
