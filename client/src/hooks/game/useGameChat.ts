import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { useOnlineChat } from '@/hooks/game/useOnlineChat';

import type { IChatMessage, IPlayerProfile, ChatTabType } from '@/common/types';

import { useAppSelector } from '@/hooks/core/useAppStore';
import { PlayerService } from '@/services/player.service';

function getMessageIndex(messages: IChatMessage[], id: string | null): number {
  if (!id) return -1;
  return messages.findIndex((m) => m.id === id);
}

interface IChatState {
  activeTab: ChatTabType;
  isMinimized: boolean;
}

type ChatAction =
  | { type: 'SET_TAB'; tab: ChatTabType }
  | { type: 'TOGGLE_MINIMIZED' };

const initialState: IChatState = {
  activeTab: 'events',
  isMinimized: true,
};

function chatReducer(state: IChatState, action: ChatAction): IChatState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab, isMinimized: false };
    case 'TOGGLE_MINIMIZED':
      return { ...state, isMinimized: !state.isMinimized };
    default:
      return state;
  }
}

export function useGameChat(
  initialReadPointers: Record<string, string | null>,
) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const messages = useAppSelector((s) => s.online.messages);
  const roomState = useAppSelector((s) => s.online.roomState);
  const readPointers = useAppSelector((s) => s.online.readPointers);
  const chatConnectionStatus = useAppSelector(
    (s) => s.online.chatConnectionStatus,
  );

  const { sendMessage, markAsRead } = useOnlineChat(currentLakeId);

  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerProfile | null>(
    null,
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileError, setProfileError] = useState(false);

  const handleOpenProfile = useCallback(async (userId: string) => {
    setIsProfileOpen(true);
    setProfileError(false);
    setSelectedPlayer(null);
    try {
      const data = await PlayerService.getOtherProfile(userId);
      setSelectedPlayer(data);
    } catch (error) {
      console.error('[GameChat] Error loading profile:', error);
      setProfileError(true);
    }
  }, []);

  const filteredMessages = useMemo(
    () =>
      messages.filter((msg) =>
        state.activeTab === 'events'
          ? msg.type === 'system'
          : msg.type === 'chat',
      ),
    [messages, state.activeTab],
  );

  const unreadCounts = useMemo(() => {
    const counts = { system: 0, chat: 0 };
    (['system', 'chat'] as const).forEach((type) => {
      const pointer = readPointers[type];
      const idx = getMessageIndex(messages, pointer);
      counts[type] = messages
        .slice(idx + 1)
        .filter((m) => m.type === type).length;
    });
    return counts;
  }, [messages, readPointers]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 10;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (scrollRef.current && (force || !isScrolledUpRef.current)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, messages, state.activeTab, state.isMinimized]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (state.isMinimized) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const id = entry.target.getAttribute('data-msg-id');
          const type = entry.target.getAttribute('data-msg-type') as
            | 'chat'
            | 'system';
          if (!id || !type) continue;

          const msgIdx = getMessageIndex(messages, id);
          const currentPointerIdx = getMessageIndex(
            messages,
            readPointers[type] || null,
          );

          if (msgIdx > currentPointerIdx) {
            markAsRead(id, type);
          }
        }
      },
      { threshold: 0.1, root: scrollRef.current },
    );

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [markAsRead, messages, readPointers, state.isMinimized]);

  useEffect(() => {
    if (state.isMinimized || !scrollRef.current || !observerRef.current) return;

    const observer = observerRef.current;
    const container = scrollRef.current;
    const timer = setTimeout(() => {
      container
        .querySelectorAll('[data-msg-id]')
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      container
        .querySelectorAll('[data-msg-id]')
        .forEach((el) => observer.unobserve(el));
    };
  }, [messages, state.isMinimized, state.activeTab]);

  const [sessionPointers] = useState(() => ({
    chat: initialReadPointers['chat'] || null,
    system: initialReadPointers['system'] || null,
  }));

  const currentChatType = state.activeTab === 'events' ? 'system' : 'chat';

  const firstUnreadIdx = useMemo(() => {
    const sessionPointer = sessionPointers[currentChatType];
    if (!sessionPointer) return -1;
    const sessionIdxInAll = getMessageIndex(messages, sessionPointer);
    return filteredMessages.findIndex(
      (m) => getMessageIndex(messages, m.id) > sessionIdxInAll,
    );
  }, [filteredMessages, sessionPointers, currentChatType, messages]);

  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
      dispatch({ type: 'SET_TAB', tab: 'messages' });
      scrollToBottom(true);
    },
    [sendMessage, scrollToBottom],
  );

  const setTab = useCallback(
    (tab: ChatTabType) => dispatch({ type: 'SET_TAB', tab }),
    [],
  );
  const toggleMinimized = useCallback(
    () => dispatch({ type: 'TOGGLE_MINIMIZED' }),
    [],
  );

  return {
    state,
    filteredMessages,
    unreadCounts,
    onlineCount: roomState?.onlineCount ?? 0,
    connectionStatus: chatConnectionStatus,
    firstUnreadIdx,
    selectedPlayer,
    isProfileOpen,
    profileError,
    handleOpenProfile,
    setIsProfileOpen,
    scrollRef,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    setTab,
    toggleMinimized,
  };
}
