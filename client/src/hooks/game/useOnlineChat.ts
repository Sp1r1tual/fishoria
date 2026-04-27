import { useEffect, useRef, useCallback } from 'react';

import type {
  IChatMessage,
  IChatRoomState,
  ICatchEventPayload,
} from '@/common/types';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  addChatMessage,
  setChatHistory,
  setRoomState,
  setCurrentChatLakeId,
  clearChat,
} from '@/store/slices/onlineSlice';

import { getChatSocket } from '@/services/socket.service';

export function useOnlineChat(lakeId: string | null) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !onlineMode || !lakeId) {
      if (joinedRef.current) {
        dispatch(clearChat());
        joinedRef.current = false;
      }
      return;
    }

    const socket = getChatSocket();
    if (!socket.connected) return;

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

    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    socket.on('chat:room_state', onRoomState);
    socket.on('chat:error', onError);

    socket.emit('chat:join', { lakeId });
    joinedRef.current = true;
    dispatch(setCurrentChatLakeId(lakeId));

    return () => {
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
      socket.off('chat:room_state', onRoomState);
      socket.off('chat:error', onError);

      dispatch(clearChat());
      joinedRef.current = false;
      // We don't disconnect the global socket here!
    };
  }, [lakeId, isAuthenticated, onlineMode, dispatch]);

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
