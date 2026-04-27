import { useTranslation } from 'react-i18next';

import styles from './GameChat.module.css';

type ChatTab = 'events' | 'messages';

interface ChatTabsProps {
  activeTab: ChatTab;
  isMinimized: boolean;
  unreadCounts: { system: number; chat: number };
  connectionStatus: string;
  onlineCount: number;
  onSetTab: (tab: ChatTab) => void;
  onToggleMinimized: () => void;
}

export const ChatTabs = ({
  activeTab,
  isMinimized,
  unreadCounts,
  connectionStatus,
  onlineCount,
  onSetTab,
  onToggleMinimized,
}: ChatTabsProps) => {
  const { t } = useTranslation();

  const getDotClass = (status: string): string => {
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
  };

  const dotClass = getDotClass(connectionStatus);

  return (
    <div className={styles.chat__tabs}>
      <div className={styles.chat__tabs_group}>
        <button
          className={`${styles.chat__tab} ${
            !isMinimized && activeTab === 'events'
              ? styles['chat__tab--active']
              : ''
          }`}
          onClick={() => onSetTab('events')}
        >
          <span className={styles['chat__tab-text--full']}>
            {t('hud.chat.tabs.events')}
          </span>
          <span className={styles['chat__tab-text--short']}>
            {t('hud.chat.tabs.eventsShort')}
          </span>
          {unreadCounts.system > 0 && (
            <span className={styles.chat__badge}>
              {unreadCounts.system > 99 ? '99+' : unreadCounts.system}
            </span>
          )}
        </button>
        <button
          className={`${styles.chat__tab} ${
            !isMinimized && activeTab === 'messages'
              ? styles['chat__tab--active']
              : ''
          }`}
          onClick={() => onSetTab('messages')}
        >
          <span className={styles['chat__tab-text--full']}>
            {t('hud.chat.tabs.messages')}
          </span>
          <span className={styles['chat__tab-text--short']}>
            {t('hud.chat.tabs.messagesShort')}
          </span>
          {unreadCounts.chat > 0 && (
            <span className={styles.chat__badge}>
              {unreadCounts.chat > 99 ? '99+' : unreadCounts.chat}
            </span>
          )}
        </button>
        <div
          className={styles.chat__tab_indicator}
          style={{
            transform: `translateX(${activeTab === 'events' ? '0%' : '100%'})`,
            opacity: isMinimized ? 0 : 1,
          }}
        />
      </div>
      <div className={styles.chat__online_indicator}>
        <div className={`${styles.chat__online_dot} ${dotClass}`} />
        {connectionStatus === 'online' && (
          <span className={styles.chat__online_count}>{onlineCount}</span>
        )}
      </div>
      <button
        className={styles.chat__minimize}
        onClick={onToggleMinimized}
        title={
          isMinimized
            ? t('hud.chat.actions.expand')
            : t('hud.chat.actions.minimize')
        }
      >
        {isMinimized ? '+' : '−'}
      </button>
    </div>
  );
};
