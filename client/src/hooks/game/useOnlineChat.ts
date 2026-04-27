import { useEffect, useRef, useCallback } from 'react';

import type {
  IChatMessage,
  IChatRoomState,
  ICatchEventPayload,
} from '@/common/types';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  setChatConnectionStatus,
  addChatMessage,
  setChatHistory,
  setRoomState,
  setCurrentChatLakeId,
  clearChat,
} from '@/store/slices/onlineSlice';

import {
  getChatSocket,
  connectChat,
  disconnectChat,
} from '@/services/socket.service';

export function useOnlineChat(lakeId: string | null) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const currentChatLakeId = useAppSelector((s) => s.online.currentChatLakeId);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!lakeId || !isAuthenticated || !onlineMode) {
      if (joinedRef.current) {
        disconnectChat();
        dispatch(clearChat());
        joinedRef.current = false;
      }
      return;
    }

    const socket = getChatSocket();

    const onConnect = () => {
      dispatch(setChatConnectionStatus('online'));

      socket.emit('chat:join', { lakeId });
      joinedRef.current = true;
      dispatch(setCurrentChatLakeId(lakeId));
    };

    const onDisconnect = () => {
      dispatch(setChatConnectionStatus('offline'));
      joinedRef.current = false;
    };

    const onConnectError = () => {
      dispatch(setChatConnectionStatus('error'));
    };

    const onHistory = (history: IChatMessage[]) => {
      dispatch(setChatHistory(history));
    };

    const onMessage = (message: IChatMessage) => {
      dispatch(addChatMessage(message));
    };

    const onRoomState = (state: IChatRoomState) => {
      dispatch(setRoomState(state));
    };

    const onError = (err: { message: string }) => {
      console.warn('[OnlineChat] Server error:', err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    socket.on('chat:room_state', onRoomState);
    socket.on('chat:error', onError);

    dispatch(setChatConnectionStatus('connecting'));
    // Connect without explicit token — cookies are sent automatically
    connectChat('');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
      socket.off('chat:room_state', onRoomState);
      socket.off('chat:error', onError);

      disconnectChat();
      dispatch(clearChat());
      joinedRef.current = false;
    };
  }, [lakeId, isAuthenticated, onlineMode, dispatch]);

  // Re-join when lakeId changes (without full reconnect)
  useEffect(() => {
    if (!lakeId || !joinedRef.current) return;
    if (currentChatLakeId === lakeId) return;

    const socket = getChatSocket();
    if (socket.connected) {
      socket.emit('chat:join', { lakeId });
      dispatch(setCurrentChatLakeId(lakeId));
    }
  }, [lakeId, currentChatLakeId, dispatch]);

  const sendMessage = useCallback((text: string) => {
    const socket = getChatSocket();
    if (!socket.connected || !text.trim()) return;

    socket.emit('chat:send_message', { text: text.trim() });
  }, []);

  const sendCatchEvent = useCallback((payload: ICatchEventPayload) => {
    const socket = getChatSocket();
    if (!socket.connected) return;

    socket.emit('chat:catch_event', payload);
  }, []);

  return { sendMessage, sendCatchEvent };
}
