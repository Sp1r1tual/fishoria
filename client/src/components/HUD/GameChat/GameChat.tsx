import { useReducer, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { openProfileModal } from '@/store/slices/uiSlice';

import styles from './GameChat.module.css';

interface IMessage {
  id: string;
  type: 'chat' | 'system';
  user: string;
  isModerator?: boolean;
  text?: string;
  fish?: string;
  weight?: string;
  timestamp: string;
}

type ChatTab = 'events' | 'messages';

interface IChatState {
  activeTab: ChatTab;
  isMinimized: boolean;
  unreadEvents: number;
  unreadMessages: number;
  messages: IMessage[];
}

type ChatAction =
  | { type: 'SET_TAB'; tab: ChatTab }
  | { type: 'TOGGLE_MINIMIZED' }
  | { type: 'ADD_MESSAGE'; message: IMessage }
  | { type: 'RESET_UNREAD'; tab: ChatTab };

const initialState: IChatState = {
  activeTab: 'events',
  isMinimized: true,
  unreadEvents: 0,
  unreadMessages: 0,
  messages: [
    {
      id: '1',
      type: 'system',
      user: 'FisherPro',
      fish: 'Щука',
      weight: '3.420 кг',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      id: '2',
      type: 'chat',
      user: 'Рибак_Василь',
      isModerator: true,
      text: 'Всім привіт! Де зараз найкраще клює короп?',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      id: '3',
      type: 'chat',
      user: 'Admin_Fishoria',
      isModerator: true,
      text: 'Нагадую всім про дотримання правил чату!',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ],
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
    case 'ADD_MESSAGE': {
      const isSystem = action.message.type === 'system';
      let unreadEvents = state.unreadEvents;
      let unreadMessages = state.unreadMessages;

      if (state.isMinimized) {
        if (isSystem) unreadEvents++;
        else unreadMessages++;
      } else {
        if (isSystem && state.activeTab !== 'events') unreadEvents++;
        if (!isSystem && state.activeTab !== 'messages') unreadMessages++;
      }

      return {
        ...state,
        messages: [...state.messages.slice(-49), action.message],
        unreadEvents,
        unreadMessages,
      };
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

const MOCK_USERS = [
  'Рибак_Василь',
  'FisherPro',
  'Карась_Коля',
  'AquaLover',
  'BigFishHunter',
];
const MOCK_FISH = ['Короп', 'Щука', 'Окунь', 'Лящ', 'Плітка', 'Судак'];

interface IGameChatProps {
  isNight?: boolean;
}

export function GameChat({ isNight = false }: IGameChatProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [state, dispatchAction] = useReducer(chatReducer, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);

  const activeTabRef = useRef(state.activeTab);
  const isMinimizedRef = useRef(state.isMinimized);
  const inputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const handleNicknameClick = (username: string) => {
    dispatch(openProfileModal({ player: null }));

    setTimeout(() => {
      dispatch(
        openProfileModal({
          player: {
            id: Math.random().toString(),
            user: {
              id: Math.random().toString(),
              username: username,
              email: 'mock@example.com',
              avatar: 'profile_01.webp',
              role: username === 'Admin_Fishoria' ? 'MODERATOR' : 'PLAYER',
              isActivated: true,
              language: 'uk',
              createdAt: new Date().toISOString(),
            },
            level: Math.floor(Math.random() * 50) + 1,
            xp: 1250,
            money: 5000,
            equippedRodUid: null,
            equippedReelUid: null,
            equippedLineUid: null,
            equippedHookUid: null,
            hasEchoSounder: false,
            activeBait: '',
            activeGroundbait: '',
            gearItems: [],
            consumables: [],
            fishCatches: [],
            lakeStats: [],
            playerQuests: [],
            playerAchievements: [],
            createdAt: new Date().toISOString(),
          },
        }),
      );
    }, 600);
  };

  useEffect(() => {
    activeTabRef.current = state.activeTab;
    isMinimizedRef.current = state.isMinimized;
  }, [state.activeTab, state.isMinimized]);

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
  }, [state.messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 10;
  };

  useEffect(() => {
    const interval = setInterval(
      () => {
        const isSystem = Math.random() > 0.4;
        const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];

        const newMessage: IMessage = {
          id: Date.now().toString(),
          type: isSystem ? 'system' : 'chat',
          user,
          text: isSystem ? undefined : 'Гарна погода для риболовлі!',
          fish: isSystem
            ? MOCK_FISH[Math.floor(Math.random() * MOCK_FISH.length)]
            : undefined,
          weight: isSystem
            ? (Math.random() * 5 + 0.5).toFixed(3) + ' кг'
            : undefined,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        dispatchAction({ type: 'ADD_MESSAGE', message: newMessage });
      },
      12000 + Math.random() * 10000,
    );

    return () => clearInterval(interval);
  }, []);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;

    const val = inputRef.current.value.trim();
    if (!val) return;

    const newMessage: IMessage = {
      id: Date.now().toString(),
      type: 'chat',
      user: 'Ви',
      text: val,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    dispatchAction({ type: 'ADD_MESSAGE', message: newMessage });
    inputRef.current.value = '';
    if (counterRef.current) counterRef.current.textContent = '0/100';
    if (counterRef.current)
      counterRef.current.classList.remove(styles['chat__counter--warning']);
    dispatchAction({ type: 'SET_TAB', tab: 'messages' });
  };

  const filteredMessages = state.messages.filter((msg) =>
    state.activeTab === 'events' ? msg.type === 'system' : msg.type === 'chat',
  );

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
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${styles[`message--${msg.type}`]}`}
            >
              <span className={styles.message__time}>{msg.timestamp}</span>
              <span
                className={`${styles.message__user} ${msg.isModerator ? styles['message__user--mod'] : ''}`}
                onClick={() => handleNicknameClick(msg.user)}
              >
                {msg.user}:
              </span>
              {msg.type === 'chat' ? (
                <span className={styles.message__text}>{msg.text}</span>
              ) : (
                <span className={styles.message__log}>
                  впіймав{' '}
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
