import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { addToast } from '@/store/slices/uiSlice';

interface ServerError {
  response?: {
    status?: number;
  };
}

export function useServerErrorHandler(isError: boolean, error: unknown) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isError && error) {
      const axiosError = error as ServerError;
      const status = axiosError.response?.status;

      if (!status || status >= 500) {
        dispatch(
          addToast({
            message: t(
              'common.serverUnavailable',
              'Server is temporarily unavailable. Redirecting...',
            ),
            type: 'error',
            duration: 3000,
          }),
        );

        const timer = setTimeout(() => {
          navigate('/server-unavailable');
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [isError, error, dispatch, navigate, t]);
}
