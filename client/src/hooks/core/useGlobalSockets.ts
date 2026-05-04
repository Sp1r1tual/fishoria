import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import type { WeatherType } from '@/common/types';

import { TimeManager } from '@/game/managers/TimeManager';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  setConnectionStatus,
  setChatConnectionStatus,
  setLakesOnlineStats,
  clearChat,
  setSessionOffline,
} from '@/store/slices/onlineSlice';
import {
  setWeather,
  setWeatherForecast,
  setLastWeatherUpdateHour,
} from '@/store/slices/gameSlice';
import { addToast } from '@/store/slices/uiSlice';

import i18n from '@/i18n';

import { refreshToken } from '@/http/interceptors/auth.interceptor';
import { OnlineService } from '@/services/online.service';

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
import { isPublicRoute } from '@/common/constants/routes';

export function useGlobalSockets() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isSessionOffline = useAppSelector((s) => s.online.isSessionOffline);
  const lastToastTimeRef = useRef<Record<string, number>>({});
  const isSessionOfflineRef = useRef(isSessionOffline);
  const locationRef = useRef(location);

  useEffect(() => {
    isSessionOfflineRef.current = isSessionOffline;
  }, [isSessionOffline]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const isPublicPath = isPublicRoute(location.pathname);

  const hasSession = localStorage.getItem('hasSession') === 'true';

  useEffect(() => {
    if (!onlineMode || !isAuthenticated || isPublicPath || !hasSession) {
      dispatch(setConnectionStatus('offline'));
      dispatch(setChatConnectionStatus('offline'));
      disconnectStatus();
      disconnectChat();
      disconnectGame();
      dispatch(clearChat());
      return;
    }

    const showSocketToast = (msgKey: string) => {
      if (isSessionOfflineRef.current) return;

      const now = Date.now();
      const lastTime = lastToastTimeRef.current[msgKey] || 0;
      if (now - lastTime < 2000) return;

      lastToastTimeRef.current[msgKey] = now;
      dispatch(
        addToast({
          type: 'error',
          message: `[Socket] ${i18n.t(msgKey)}`,
        }),
      );
    };

    const statusInterval = setInterval(
      () => OnlineService.pingStatus(),
      10 * 60 * 1000,
    );
    OnlineService.pingStatus();

    const authCheckInterval = setInterval(async () => {
      const authExpiry = localStorage.getItem('authExpiry');
      if (authExpiry && isAuthenticated) {
        const expiresAt = parseInt(authExpiry, 10);
        if (Date.now() > expiresAt - 30000) {
          try {
            await refreshToken();
          } catch (e) {
            console.warn('[Online] Proactive refresh failed', e);
          }
        }
      }
    }, 30000);

    const statusSocket = getStatusSocket();
    const chatSocket = getChatSocket();
    const gameSocket = getGameSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Online] Page became visible - checking connection...');
        // Force ping on visibility change to ensure quick wakeup
        OnlineService.pingStatus(true);

        if (isSessionOfflineRef.current) {
          dispatch(setSessionOffline(false));
        }

        if (!statusSocket.connected) connectStatus();
        if (!chatSocket.connected) connectChat();
        if (!gameSocket.connected) connectGame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    const onStatusConnect = () => {
      if (isSessionOfflineRef.current) {
        dispatch(setSessionOffline(false));
      }
      dispatch(setConnectionStatus('online'));
    };
    const onStatusDisconnect = () => dispatch(setConnectionStatus('offline'));
    const onChatConnect = () => {
      if (isSessionOfflineRef.current) {
        dispatch(setSessionOffline(false));
      }
      dispatch(setChatConnectionStatus('online'));
    };
    const onChatDisconnect = () => dispatch(setChatConnectionStatus('offline'));

    const onConnectionError = (err: unknown) => {
      console.warn('[Online] Connection error:', err);

      // Proactively ping on error to wake up server if it's still asleep
      OnlineService.pingStatus();

      if (!isSessionOfflineRef.current) {
        console.warn(
          '[Online] Connection error - switching to silent background retry mode',
        );
        dispatch(setSessionOffline(true));
        showSocketToast('error.socket.connection_error');
      }

      dispatch(setConnectionStatus('offline'));
      dispatch(setChatConnectionStatus('offline'));
    };

    const onException = async (err: { message?: string; error?: string }) => {
      console.warn('[Online] Socket Exception:', err);
      dispatch(setChatConnectionStatus('error'));

      const rawMsg = err?.message || err?.error || 'unknown';

      const isAuthError =
        rawMsg === 'Unauthorized' ||
        rawMsg === 'Invalid token' ||
        rawMsg === 'Token expired' ||
        rawMsg.toLowerCase().includes('unauthorized') ||
        rawMsg.toLowerCase().includes('token expired');

      if (isAuthError) {
        const isCurrentlyPublic = isPublicRoute(locationRef.current.pathname);

        if (
          isAuthenticated &&
          localStorage.getItem('hasSession') === 'true' &&
          !isCurrentlyPublic
        ) {
          try {
            await refreshToken();

            statusSocket.disconnect().connect();
            chatSocket.disconnect().connect();
            gameSocket.disconnect().connect();
            return;
          } catch (refreshErr) {
            console.error('[Online] Token refresh failed:', refreshErr);
          }
        }
      }

      const msgMap: Record<string, string> = {
        'Internal server error': 'error.socket.connection_error',
        'Forbidden resource': 'error.socket.forbidden',
        Unauthorized: 'error.socket.auth_error',
        'Invalid token': 'error.socket.auth_error',
        'Bad Request': 'error.socket.bad_request',
        'Limit reached': 'error.socket.limit_reached',
      };

      let msgKey = msgMap[rawMsg];
      if (!msgKey) {
        if (rawMsg.includes('Throttler') || rawMsg.includes('Many Requests')) {
          msgKey = 'error.socket.limit_reached';
        } else {
          msgKey = rawMsg.includes(' ') ? 'errors.unknown' : rawMsg;
        }
      }

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
      console.log('[Online] Game Sync received:', state.weather);
      TimeManager.restoreSession(state.virtualTime);

      dispatch(setWeatherForecast(state.weatherForecast));
      dispatch(setWeather(state.weather));

      if (state.lastWeatherUpdateHour !== undefined) {
        dispatch(setLastWeatherUpdateHour(state.lastWeatherUpdateHour));
      }
    };

    statusSocket.on('connect', onStatusConnect);
    statusSocket.on('disconnect', onStatusDisconnect);
    statusSocket.on('connect_error', onConnectionError);

    chatSocket.on('connect', onChatConnect);
    chatSocket.on('disconnect', onChatDisconnect);
    chatSocket.on('connect_error', onConnectionError);
    chatSocket.on('chat:all_lakes_stats', onAllLakesStats);
    chatSocket.on('exception', onException);
    chatSocket.on('chat:error', onException);

    gameSocket.on('game:sync', onGameSync);
    gameSocket.on('connect_error', onConnectionError);
    gameSocket.on('exception', onException);

    dispatch(setConnectionStatus('connecting'));
    dispatch(setChatConnectionStatus('connecting'));

    connectStatus();
    connectChat();
    connectGame();

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

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);

      clearInterval(statusInterval);
      clearInterval(authCheckInterval);
    };
  }, [dispatch, onlineMode, isAuthenticated, isPublicPath, hasSession]);
}
