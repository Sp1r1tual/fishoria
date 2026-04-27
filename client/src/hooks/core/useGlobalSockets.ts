import axios from 'axios';
import { useEffect } from 'react';

import type { WeatherType } from '@/common/types';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  setConnectionStatus,
  setChatConnectionStatus,
  setLakesOnlineStats,
  clearChat,
} from '@/store/slices/onlineSlice';
import {
  setWeather,
  setWeatherForecast,
  setLastWeatherUpdateHour,
} from '@/store/slices/gameSlice';
import { addToast } from '@/store/slices/uiSlice';

import i18n from '@/i18n';
import { TimeManager } from '@/game/managers/TimeManager';

import {
  getStatusSocket,
  connectStatus,
  disconnectStatus,
  getChatSocket,
  connectChat,
  disconnectChat,
  getGameSocket,
  connectGame,
  disconnectGame,
} from '@/services/socket.service';

const ONLINE_SERVER_URL =
  import.meta.env.VITE_ONLINE_SERVER_URL ?? 'http://localhost:5001';

export function useGlobalSockets() {
  const dispatch = useAppDispatch();
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!onlineMode || !isAuthenticated) {
      dispatch(setConnectionStatus('offline'));
      dispatch(setChatConnectionStatus('offline'));
      disconnectStatus();
      disconnectChat();
      disconnectGame();
      dispatch(clearChat());
      return;
    }

    axios.get(`${ONLINE_SERVER_URL}/status`).catch(() => {});
    const statusSocket = getStatusSocket();

    const onStatusConnect = () => dispatch(setConnectionStatus('online'));
    const onStatusDisconnect = () => dispatch(setConnectionStatus('offline'));
    const onStatusError = () => {
      dispatch(setConnectionStatus('error'));
      dispatch(
        addToast({
          type: 'error',
          message: i18n.t('error.socket.connection_error'),
        }),
      );
    };

    statusSocket.on('connect', onStatusConnect);
    statusSocket.on('disconnect', onStatusDisconnect);
    statusSocket.on('connect_error', onStatusError);

    dispatch(setConnectionStatus('connecting'));
    connectStatus();

    const chatSocket = getChatSocket();

    const onChatConnect = () => dispatch(setChatConnectionStatus('online'));
    const onChatDisconnect = () => dispatch(setChatConnectionStatus('offline'));
    const onChatError = () => dispatch(setChatConnectionStatus('error'));

    const onAllLakesStats = (stats: Record<string, number>) => {
      dispatch(setLakesOnlineStats(stats));
    };

    const onException = (err: { message?: string }) => {
      console.warn('[OnlineChat] NestJS Exception:', err);
      dispatch(setChatConnectionStatus('error'));
      dispatch(
        addToast({
          type: 'error',
          message: err.message || i18n.t('error.socket.unknown'),
        }),
      );
    };

    chatSocket.on('connect', onChatConnect);
    chatSocket.on('disconnect', onChatDisconnect);
    chatSocket.on('connect_error', onChatError);
    chatSocket.on('chat:all_lakes_stats', onAllLakesStats);
    chatSocket.on('exception', onException);

    dispatch(setChatConnectionStatus('connecting'));
    connectChat('');

    const gameSocket = getGameSocket();

    const onGameSync = (state: {
      virtualTime: number;
      weather: WeatherType;
      weatherForecast: WeatherType[];
      lastWeatherUpdateHour: number;
    }) => {
      TimeManager.restoreSession(state.virtualTime);
      dispatch(setWeather(state.weather));
      dispatch(setWeatherForecast(state.weatherForecast));
      dispatch(setLastWeatherUpdateHour(state.lastWeatherUpdateHour));
    };

    gameSocket.on('game:sync', onGameSync);
    connectGame('');

    return () => {
      statusSocket.off('connect', onStatusConnect);
      statusSocket.off('disconnect', onStatusDisconnect);
      statusSocket.off('connect_error', onStatusError);
      disconnectStatus();

      chatSocket.off('connect', onChatConnect);
      chatSocket.off('disconnect', onChatDisconnect);
      chatSocket.off('connect_error', onChatError);
      chatSocket.off('chat:all_lakes_stats', onAllLakesStats);
      chatSocket.off('exception', onException);
      disconnectChat();
      dispatch(clearChat());

      gameSocket.off('game:sync', onGameSync);
      disconnectGame();
    };
  }, [dispatch, onlineMode, isAuthenticated]);
}
