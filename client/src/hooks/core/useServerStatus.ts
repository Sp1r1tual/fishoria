import axios from 'axios';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { setConnectionStatus } from '@/store/slices/onlineSlice';

import {
  getStatusSocket,
  connectStatus,
  disconnectStatus,
} from '@/services/socket.service';

const ONLINE_SERVER_URL =
  import.meta.env.VITE_ONLINE_SERVER_URL ?? 'http://localhost:5001';

export function useServerStatus() {
  const dispatch = useAppDispatch();
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);

  useEffect(() => {
    if (!onlineMode) {
      dispatch(setConnectionStatus('offline'));
      return;
    }

    axios.get(ONLINE_SERVER_URL).catch(() => {
      // Ignored: socket.io will handle reconnects if this fails
    });
    const socket = getStatusSocket();

    const onConnect = () => {
      dispatch(setConnectionStatus('online'));
    };

    const onDisconnect = () => {
      dispatch(setConnectionStatus('offline'));
    };

    const onConnectError = () => {
      dispatch(setConnectionStatus('error'));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    dispatch(setConnectionStatus('connecting'));
    connectStatus();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);

      disconnectStatus();
    };
  }, [dispatch, onlineMode]);
}
