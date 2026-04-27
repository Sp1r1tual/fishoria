import axios from 'axios';
import { useEffect, useRef } from 'react';

import type { WeatherType } from '@/common/types';

import { TimeManager } from '@/game/managers/TimeManager';

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
  const lastToastTimeRef = useRef<Record<string, number>>({});

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

    const showSocketToast = (msgKey: string) => {
      const now = Date.now();
      const lastTime = lastToastTimeRef.current[msgKey] || 0;
      if (now - lastTime < 2000) return; // Deduplicate within 2s

      lastToastTimeRef.current[msgKey] = now;
      dispatch(
        addToast({
          type: 'error',
          message: `[Socket] ${i18n.t(msgKey)}`,
        }),
      );
    };

    axios.get(`${ONLINE_SERVER_URL}/status`).catch(() => {});
    const statusSocket = getStatusSocket();
    const chatSocket = getChatSocket();
    const gameSocket = getGameSocket();

    const onStatusConnect = () => dispatch(setConnectionStatus('online'));
    const onStatusDisconnect = () => dispatch(setConnectionStatus('offline'));
    const onChatConnect = () => dispatch(setChatConnectionStatus('online'));
    const onChatDisconnect = () => dispatch(setChatConnectionStatus('offline'));

    const onConnectionError = () => {
      dispatch(setConnectionStatus('error'));
      dispatch(setChatConnectionStatus('error'));
      showSocketToast('error.socket.connection_error');
    };

    const onException = (err: { message?: string; error?: string }) => {
      console.warn('[Online] Socket Exception:', err);
      dispatch(setChatConnectionStatus('error'));
      const msgKey = err?.message || err?.error || 'errors.unknown';
      showSocketToast(msgKey);
    };

    const onAllLakesStats = (stats: Record<string, number>) => {
      dispatch(setLakesOnlineStats(stats));
    };

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

    // Status Socket
    statusSocket.on('connect', onStatusConnect);
    statusSocket.on('disconnect', onStatusDisconnect);
    statusSocket.on('connect_error', onConnectionError);

    // Chat Socket
    chatSocket.on('connect', onChatConnect);
    chatSocket.on('disconnect', onChatDisconnect);
    chatSocket.on('connect_error', onConnectionError);
    chatSocket.on('chat:all_lakes_stats', onAllLakesStats);
    chatSocket.on('exception', onException);
    chatSocket.on('chat:error', onException);

    // Game Socket
    gameSocket.on('game:sync', onGameSync);
    gameSocket.on('connect_error', onConnectionError);
    gameSocket.on('exception', onException);

    dispatch(setConnectionStatus('connecting'));
    dispatch(setChatConnectionStatus('connecting'));

    connectStatus();
    connectChat('');
    connectGame('');

    return () => {
      statusSocket.off('connect', onStatusConnect);
      statusSocket.off('disconnect', onStatusDisconnect);
      statusSocket.off('connect_error', onConnectionError);
      disconnectStatus();

      chatSocket.off('connect', onChatConnect);
      chatSocket.off('disconnect', onChatDisconnect);
      chatSocket.off('connect_error', onConnectionError);
      chatSocket.off('chat:all_lakes_stats', onAllLakesStats);
      chatSocket.off('exception', onException);
      chatSocket.off('chat:error', onException);
      disconnectChat();
      dispatch(clearChat());

      gameSocket.off('game:sync', onGameSync);
      gameSocket.off('connect_error', onConnectionError);
      gameSocket.off('exception', onException);
      disconnectGame();
    };
  }, [dispatch, onlineMode, isAuthenticated]);
}
