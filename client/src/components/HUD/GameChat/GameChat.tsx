import { useReducer, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useOnlineChat } from '@/hooks/game/useOnlineChat';

import type { IChatMessage, ConnectionStatusType } from '@/common/types';

import { useAppSelector } from '@/hooks/core/useAppStore';

import { formatDate } from '@/common/utils/date.util';

import styles from './GameChat.module.css';

type ChatTab = 'events' | 'messages';

interface IChatState {
  activeTab: ChatTab;
  isMinimized: boolean;
  unreadEvents: number;
  unreadMessages: number;
}

type ChatAction =
  | { type: 'SET_TAB'; tab: ChatTab }
  | { type: 'TOGGLE_MINIMIZED' }
  | { type: 'INCREMENT_UNREAD'; messageType: 'system' | 'chat' }
  | { type: 'RESET_UNREAD'; tab: ChatTab };

const initialState: IChatState = {
  activeTab: 'events',
  isMinimized: true,
  unreadEvents: 0,
  unreadMessages: 0,
};

function chatReducer(state: IChatState, action: ChatAction): IChatState {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.tab,
        isMinimized: false,
        unreadEvents: action.tab === 'events' ? 0 : state.unreadEvents,
        unreadMessages: action.tab === 'messages' ? 0 : state.unreadMessages,
      };
    case 'TOGGLE_MINIMIZED': {
      const nextMinimized = !state.isMinimized;
      return {
        ...state,
        isMinimized: nextMinimized,
        unreadEvents:
          !nextMinimized && state.activeTab === 'events'
            ? 0
            : state.unreadEvents,
        unreadMessages:
          !nextMinimized && state.activeTab === 'messages'
            ? 0
            : state.unreadMessages,
      };
    }
    case 'INCREMENT_UNREAD': {
      const isSystem = action.messageType === 'system';
      let unreadEvents = state.unreadEvents;
      let unreadMessages = state.unreadMessages;

      if (state.isMinimized) {
        if (isSystem) unreadEvents++;
        else unreadMessages++;
      } else {
        if (isSystem && state.activeTab !== 'events') unreadEvents++;
        if (!isSystem && state.activeTab !== 'messages') unreadMessages++;
      }

      return { ...state, unreadEvents, unreadMessages };
    }
    case 'RESET_UNREAD':
      return {
        ...state,
        unreadEvents: action.tab === 'events' ? 0 : state.unreadEvents,
        unreadMessages: action.tab === 'messages' ? 0 : state.unreadMessages,
      };
    default:
      return state;
  }
}

interface IGameChatProps {
  isNight?: boolean;
}

export function GameChat({ isNight = false }: IGameChatProps) {
  const { t } = useTranslation();
  const [state, dispatchAction] = useReducer(chatReducer, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Online state from Redux ──────────────────────────────────────────────
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const messages = useAppSelector((s) => s.online.messages);
  const roomState = useAppSelector((s) => s.online.roomState);
  const chatConnectionStatus = useAppSelector(
    (s) => s.online.chatConnectionStatus,
  );

  const { sendMessage } = useOnlineChat(currentLakeId);

  // ── Track unread on new messages ─────────────────────────────────────────
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const newMessages = messages.slice(prevMessageCountRef.current);
      for (const msg of newMessages) {
        dispatchAction({
          type: 'INCREMENT_UNREAD',
          messageType: msg.type,
        });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
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

  // ── Input handling ───────────────────────────────────────────────────────
  const handleInput = () => {
    if (!inputRef.current || !counterRef.current) return;
    const len = inputRef.current.value.length;
    counterRef.current.textContent = `${len}/100`;

    if (len >= 90) {
      counterRef.current.classList.add(styles['chat__counter--warning']);
    } else {
      counterRef.current.classList.remove(styles['chat__counter--warning']);
    }
  };

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputRef.current) return;

      const val = inputRef.current.value.trim();
      if (!val) return;

      sendMessage(val);

      inputRef.current.value = '';
      if (counterRef.current) counterRef.current.textContent = '0/100';
      if (counterRef.current)
        counterRef.current.classList.remove(styles['chat__counter--warning']);
      dispatchAction({ type: 'SET_TAB', tab: 'messages' });
    },
    [sendMessage],
  );

  // ── Filter messages by tab ───────────────────────────────────────────────
  const filteredMessages = messages.filter((msg: IChatMessage) =>
    state.activeTab === 'events' ? msg.type === 'system' : msg.type === 'chat',
  );

  const onlineCount = roomState?.onlineCount ?? 0;

  const dotClass = getDotClass(chatConnectionStatus);

  return (
    <div
      className={`${styles.chat} ${isNight ? styles['chat--night'] : ''} ${state.isMinimized ? styles['chat--minimized'] : ''}`}
    >
      <div className={styles.chat__tabs}>
        <div className={styles.chat__tabs_group}>
          <button
            className={`${styles.chat__tab} ${!state.isMinimized && state.activeTab === 'events' ? styles['chat__tab--active'] : ''}`}
            onClick={() => dispatchAction({ type: 'SET_TAB', tab: 'events' })}
          >
            <span className={styles['chat__tab-text--full']}>
              {t('hud.chat.tabs.events')}
            </span>
            <span className={styles['chat__tab-text--short']}>
              {t('hud.chat.tabs.eventsShort')}
            </span>
            {state.unreadEvents > 0 && (
              <span className={styles.chat__badge}>
                {state.unreadEvents > 99 ? '99+' : state.unreadEvents}
              </span>
            )}
          </button>
          <button
            className={`${styles.chat__tab} ${!state.isMinimized && state.activeTab === 'messages' ? styles['chat__tab--active'] : ''}`}
            onClick={() => dispatchAction({ type: 'SET_TAB', tab: 'messages' })}
          >
            <span className={styles['chat__tab-text--full']}>
              {t('hud.chat.tabs.messages')}
            </span>
            <span className={styles['chat__tab-text--short']}>
              {t('hud.chat.tabs.messagesShort')}
            </span>
            {state.unreadMessages > 0 && (
              <span className={styles.chat__badge}>
                {state.unreadMessages > 99 ? '99+' : state.unreadMessages}
              </span>
            )}
          </button>

          <div
            className={styles.chat__tab_indicator}
            style={{
              transform: `translateX(${state.activeTab === 'events' ? '0%' : '100%'})`,
              opacity: state.isMinimized ? 0 : 1,
            }}
          />
        </div>

        <div className={styles.chat__online_indicator}>
          <div className={`${styles.chat__online_dot} ${dotClass}`} />
          <span className={styles.chat__online_count}>{onlineCount}</span>
        </div>

        <button
          className={styles.chat__minimize}
          onClick={() => dispatchAction({ type: 'TOGGLE_MINIMIZED' })}
          title={
            state.isMinimized
              ? t('hud.chat.actions.expand')
              : t('hud.chat.actions.minimize')
          }
        >
          {state.isMinimized ? '+' : '−'}
        </button>
      </div>

      <div className={styles.chat__body}>
        <div
          className={styles.chat__messages}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {filteredMessages.map((msg: IChatMessage) => (
            <div
              key={msg.id}
              className={`${styles.message} ${styles[`message--${msg.type}`]}`}
            >
              <span className={styles.message__time}>
                {formatDate(msg.timestamp, 'time')}
              </span>
              <span
                className={`${styles.message__user} ${msg.isModerator ? styles['message__user--mod'] : ''}`}
              >
                {msg.user}:
              </span>
              {msg.type === 'chat' ? (
                <span className={styles.message__text}>{msg.text}</span>
              ) : (
                <span className={styles.message__log}>
                  {t('hud.chat.caught')}{' '}
                  <span className={styles.message__fish}>{msg.fish}</span> (
                  <span className={styles.message__weight}>{msg.weight}</span>)
                </span>
              )}
            </div>
          ))}
        </div>

        <form
          className={styles.chat__input_wrapper}
          onSubmit={handleSendMessage}
        >
          <input
            ref={inputRef}
            type="text"
            className={styles.chat__input}
            placeholder={t('hud.chat.placeholder')}
            maxLength={100}
            onInput={handleInput}
          />
          <span ref={counterRef} className={styles.chat__counter}>
            0/100
          </span>
          <button type="submit" className={styles.chat__send_btn}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function getDotClass(status: ConnectionStatusType): string {
  switch (status) {
    case 'online':
      return '';
    case 'connecting':
      return styles['chat__online_dot--connecting'];
    case 'error':
      return styles['chat__online_dot--error'];
    default:
      return styles['chat__online_dot--offline'];
  }
}
