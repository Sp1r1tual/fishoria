import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IUser } from '@/common/types';

type AuthStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  status: AuthStatusType;
  isInitialized: boolean;
  isLoggedOut: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  isInitialized: false,
  isLoggedOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },

    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'succeeded' : 'failed';
      if (action.payload) {
        state.isLoggedOut = false;
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'failed';
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'failed';
      state.isLoggedOut = true;
    },
  },
});

export const { setUser, clearAuth, setLoading, setInitialized, logout } =
  authSlice.actions;
export default authSlice.reducer;
