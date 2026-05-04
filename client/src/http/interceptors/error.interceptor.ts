import type { AxiosInstance, AxiosError } from 'axios';
import i18n from '@/i18n';

import { store } from '@/store/store';
import { addToast, setNetworkOffline } from '@/store/slices/uiSlice';

export const errorInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      const state = store.getState();
      if (state.ui.isNetworkOffline) {
        store.dispatch(setNetworkOffline(false));
        store.dispatch(
          addToast({ type: 'success', message: i18n.t('network.restored') }),
        );
      }
      return response;
    },
    (error: AxiosError<{ message?: string }>) => {
      const status = error.response?.status;
      const url = error.config?.url || '';

      if (status === 401 || status === 403 || url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (status === 429) {
        store.dispatch(
          addToast({
            type: 'error',
            message: i18n.t(
              'error.tooManyRequests',
              'Too many requests. Please try again later.',
            ),
          }),
        );
      } else if (error.response) {
        const message = i18n.t(
          error.response.data?.message || 'errors.unknown',
        );
        store.dispatch(
          addToast({
            type: 'error',
            message,
          }),
        );
      } else if (
        error.code === 'ERR_NETWORK' ||
        (!error.response && error.request)
      ) {
        store.dispatch(setNetworkOffline(true));
      }

      return Promise.reject(error);
    },
  );
};
