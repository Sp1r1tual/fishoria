import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useOnlineChat } from '@/hooks/game/useOnlineChat';

import type { IChatMessage, IPlayerProfile } from '@/common/types';

import { ProfileModal } from '@/components/UI/modals/ProfileModal/ProfileModal';
import { ChatTabs } from './ChatTabs';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

import { useAppSelector } from '@/hooks/core/useAppStore';

import { PlayerService } from '@/services/player.service';
import { chatReducer, initialState, getMessageIndex } from './Chat.utils';

import styles from './GameChat.module.css';

interface IGameChatContentProps {
  isNight: boolean;
  initialReadPointers: Record<string, string | null>;
}

export function GameChatContent({
  isNight,
  initialReadPointers,
}: IGameChatContentProps) {
  const { t } = useTranslation();
  const [state, dispatchAction] = useReducer(chatReducer, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);

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

  const [sessionPointers] = useState<Record<string, string | null>>(() => ({
    chat: initialReadPointers['chat'] || null,
    system: initialReadPointers['system'] || null,
  }));

  const currentChatType = state.activeTab === 'events' ? 'system' : 'chat';

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

  const observerRef = useRef<IntersectionObserver | null>(null);
  const messagesRef = useRef(messages);
  const readPointersRef = useRef(readPointers);
  const isMinimizedRef = useRef(state.isMinimized);

  useEffect(() => {
    messagesRef.current = messages;
    readPointersRef.current = readPointers;
    isMinimizedRef.current = state.isMinimized;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isMinimizedRef.current) return;
        const currentMsgs = messagesRef.current;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute('data-msg-id');
          const type = entry.target.getAttribute('data-msg-type') as
            | 'chat'
            | 'system';
          if (!id || !type) continue;
          const msgIdx = getMessageIndex(currentMsgs, id);
          const currentPointerIdx = getMessageIndex(
            currentMsgs,
            readPointersRef.current[type] || null,
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
  }, [markAsRead]);

  const filteredMessages = useMemo(
    () =>
      messages
        .filter((msg: IChatMessage) =>
          state.activeTab === 'events'
            ? msg.type === 'system'
            : msg.type === 'chat',
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
    [messages, state.activeTab],
  );

  const firstUnreadIdx = useMemo(() => {
    const sessionPointer = sessionPointers[currentChatType];
    if (!sessionPointer) return 0;
    const sessionIdxInAll = getMessageIndex(messages, sessionPointer);
    return filteredMessages.findIndex(
      (m) => getMessageIndex(messages, m.id) > sessionIdxInAll,
    );
  }, [filteredMessages, sessionPointers, currentChatType, messages]);

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
  }, [filteredMessages, state.isMinimized, state.activeTab]);

  useEffect(() => {
    if (state.isMinimized) return;
    isScrolledUpRef.current = false;
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 10);
  }, [state.activeTab, state.isMinimized]);

  useEffect(() => {
    if (scrollRef.current && !isScrolledUpRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 10;
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
      dispatchAction({ type: 'SET_TAB', tab: 'messages' });
    },
    [sendMessage],
  );

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

  const onlineCount = roomState?.onlineCount ?? 0;

  return (
    <div
      className={`${styles.chat} ${isNight ? styles['chat--night'] : ''} ${state.isMinimized ? styles['chat--minimized'] : ''}`}
    >
      <ChatTabs
        activeTab={state.activeTab}
        isMinimized={state.isMinimized}
        unreadCounts={unreadCounts}
        connectionStatus={chatConnectionStatus}
        onlineCount={onlineCount}
        onSetTab={(tab) => dispatchAction({ type: 'SET_TAB', tab })}
        onToggleMinimized={() => dispatchAction({ type: 'TOGGLE_MINIMIZED' })}
      />

      <div className={styles.chat__body}>
        <div
          className={styles.chat__messages}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {filteredMessages.map((msg: IChatMessage, idx: number) => (
            <div key={msg.id}>
              {idx === firstUnreadIdx && firstUnreadIdx !== -1 && (
                <div className={styles.chat__unread_line}>
                  <span>{t('hud.chat.unread_messages')}</span>
                </div>
              )}
              <ChatMessage msg={msg} onOpenProfile={handleOpenProfile} />
            </div>
          ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        player={selectedPlayer}
        isError={profileError}
      />
    </div>
  );
}
