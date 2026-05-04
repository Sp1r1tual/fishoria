import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setNetworkOffline, addToast } from '@/store/slices/uiSlice';
import { store } from '@/store/store';

import i18n from '@/i18n';

export const useNetworkMonitor = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOffline = () => {
      dispatch(setNetworkOffline(true));
    };
    const handleOnline = () => {
      const { isNetworkOffline } = store.getState().ui;
      if (isNetworkOffline) {
        dispatch(
          addToast({ type: 'success', message: i18n.t('network.restored') }),
        );
      }
      dispatch(setNetworkOffline(false));
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch]);
};
