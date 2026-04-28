import type { AxiosInstance, AxiosError } from 'axios';
import i18n from '@/i18n';

import { store } from '@/store/store';
import { addToast } from '@/store/slices/uiSlice';

export const errorInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 429) {
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
        const message =
          error.response.data?.message || i18n.t('errors.unknown');
        store.dispatch(
          addToast({
            type: 'error',
            message,
          }),
        );
      } else if (error.request) {
        store.dispatch(
          addToast({
            type: 'error',
            message: i18n.t(
              'error.socket.unknown',
              'A connection error occurred',
            ),
          }),
        );
      }

      return Promise.reject(error);
    },
  );
};
