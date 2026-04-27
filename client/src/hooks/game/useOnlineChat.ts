import { useEffect, useRef, useCallback } from 'react';

import type {
  IChatMessage,
  IChatRoomState,
  ICatchEventPayload,
  IChatHistoryResponse,
} from '@/common/types';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  addChatMessage,
  setChatHistory,
  setReadPointer,
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

    const onHistory = (response: IChatHistoryResponse) => {
      dispatch(setChatHistory(response));
    };

    const onMessage = (message: IChatMessage) => {
      dispatch(addChatMessage(message));
    };

    const onRoomState = (state: IChatRoomState) => {
      dispatch(setRoomState(state));
    };

    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    socket.on('chat:room_state', onRoomState);

    socket.emit('chat:join', { lakeId });
    joinedRef.current = true;
    dispatch(setCurrentChatLakeId(lakeId));

    return () => {
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
      socket.off('chat:room_state', onRoomState);

      socket.emit('chat:leave');

      dispatch(clearChat());
      joinedRef.current = false;
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

  const markAsRead = useCallback(
    (messageId: string, type: 'chat' | 'system') => {
      if (!lakeId) return;
      const socket = getChatSocket();
      if (!socket.connected) return;

      socket.emit('chat:mark_read', { lakeId, messageId, type });
      dispatch(setReadPointer({ type, messageId }));
    },
    [lakeId, dispatch],
  );

  return { sendMessage, sendCatchEvent, markAsRead };
}
