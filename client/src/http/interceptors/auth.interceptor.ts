import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { IUser } from '@/common/types';

import { store } from '@/store/store';
import { setUser, clearAuth } from '@/store/slices/authSlice';

const PUBLIC_PATHS = [
  '/auth/google',
  '/auth/refresh',
  '/auth/logout',
  '/auth/login',
  '/auth/register',
];

let refreshPromise: Promise<IUser> | null = null;

const refreshToken = async (): Promise<IUser> => {
  if (store.getState().auth.isLoggedOut) {
    throw new Error('User has logged out');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        let headers = {};
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        if (match && match[1]) {
          headers = { 'x-xsrf-token': decodeURIComponent(match[1]) };
        }

        const refreshResponse = await axios.post<{
          user: IUser;
          expiresIn: number;
        }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true, headers },
        );

        console.log('[Auth] Token successfully refreshed');

        const user = refreshResponse.data.user;

        store.dispatch(setUser(user));

        if (
          refreshResponse.data &&
          typeof refreshResponse.data === 'object' &&
          'expiresIn' in refreshResponse.data
        ) {
          const expiresAt =
            Date.now() + (refreshResponse.data.expiresIn as number);
          localStorage.setItem('authExpiry', expiresAt.toString());
        }

        return user;
      } catch (error) {
        const isAxiosError = axios.isAxiosError(error);
        const status = isAxiosError ? error.response?.status : null;

        if (status === 401 || status === 403) {
          localStorage.removeItem('hasSession');
          localStorage.removeItem('authExpiry');
          store.dispatch(clearAuth());
        } else {
          console.error(
            '[Auth] Token refresh failed with non-auth error:',
            error,
          );
        }

        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const authInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (
        response.data &&
        typeof response.data === 'object' &&
        'expiresIn' in response.data
      ) {
        const expiresAt = Date.now() + (response.data.expiresIn as number);
        localStorage.setItem('authExpiry', expiresAt.toString());
        localStorage.setItem('hasSession', 'true');
      }
      return response;
    },
    async (
      error: AxiosError & {
        config?: AxiosRequestConfig & { _retry?: boolean };
      },
    ) => {
      const originalRequest = error.config;

      if (
        originalRequest &&
        PUBLIC_PATHS.some((path) => originalRequest.url?.includes(path))
      ) {
        return Promise.reject(error);
      }

      if (store.getState().auth.isLoggedOut) {
        return Promise.reject(error);
      }

      if (
        originalRequest &&
        error.response?.status === 404 &&
        originalRequest.url?.includes('/player/profile')
      ) {
        localStorage.removeItem('hasSession');
        localStorage.removeItem('authExpiry');
        store.dispatch(clearAuth());
        return Promise.reject(error);
      }

      if (
        originalRequest &&
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          await refreshToken();

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          if (
            axios.isAxiosError(refreshError) &&
            refreshError.response?.status !== 401 &&
            refreshError.response?.status !== 403
          ) {
            console.error(
              '[Auth] Token refresh failed in response interceptor:',
              refreshError,
            );
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export { authInterceptors, refreshToken };
