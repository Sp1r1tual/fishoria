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

const authAxios = axios.create();

const getXsrfHeaders = (): Record<string, string> => {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  if (match?.[1]) {
    return { 'x-xsrf-token': decodeURIComponent(match[1]) };
  }
  return {};
};

const isBanResponse = (error: AxiosError): string | false => {
  if (error.response?.status !== 403) return false;

  const data = error.response?.data as { message?: string } | undefined;

  if (data?.message?.startsWith('ACCOUNT_BANNED')) {
    const parts = data.message.split(':::');
    return parts.length > 1 ? parts[1] : 'No reason provided';
  }

  return false;
};

const handleBanDetected = (reason: string) => {
  localStorage.removeItem('hasSession');
  localStorage.removeItem('authExpiry');
  localStorage.removeItem('fishoria_settings');
  localStorage.removeItem('fishing_session_data');
  store.dispatch(clearAuth());
  sessionStorage.setItem('banned', 'true');
  if (reason) {
    sessionStorage.setItem('ban_reason', reason);
  }
  window.location.replace('/welcome');
};

let refreshPromise: Promise<IUser> | null = null;

const refreshToken = async (): Promise<IUser> => {
  if (store.getState().auth.isLoggedOut) {
    throw new Error('User has logged out');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshResponse = await authAxios.post<{
          user: IUser;
          expiresIn: number;
        }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true, headers: getXsrfHeaders() },
        );

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

        if (isAxiosError) {
          const banReason = isBanResponse(error);
          if (banReason !== false) {
            handleBanDetected(banReason);
            throw error;
          }
        }

        const status = isAxiosError ? error.response?.status : null;

        if (status === 401 || status === 403) {
          localStorage.removeItem('hasSession');
          localStorage.removeItem('authExpiry');
          store.dispatch(clearAuth());
        }

        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise as Promise<IUser>;
};

const authInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      if (
        !config.url ||
        PUBLIC_PATHS.some((path) => config.url?.includes(path))
      ) {
        return config;
      }

      const authExpiry = localStorage.getItem('authExpiry');
      if (authExpiry && !store.getState().auth.isLoggedOut) {
        const expiresAt = parseInt(authExpiry, 10);
        const now = Date.now();

        if (now > expiresAt - 15000) {
          try {
            await refreshToken();
          } catch {
            // Ignore proactive refresh failures, let the request proceed
          }
        }
      }

      return config;
    },
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
        !originalRequest ||
        !error.response ||
        PUBLIC_PATHS.some((path) => originalRequest.url?.includes(path))
      ) {
        return Promise.reject(error);
      }

      const banReason = isBanResponse(error);
      if (banReason !== false) {
        handleBanDetected(banReason);
        return Promise.reject(error);
      }

      if (
        error.response.status === 404 &&
        originalRequest.url?.includes('/player/profile')
      ) {
        localStorage.removeItem('hasSession');
        localStorage.removeItem('authExpiry');
        store.dispatch(clearAuth());
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        if (store.getState().auth.isLoggedOut) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          await refreshToken();
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export { authInterceptors, refreshToken };
