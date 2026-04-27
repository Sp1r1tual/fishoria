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

  const tabs: { id: ChatTab; label: string; short: string; badge: number }[] = [
    {
      id: 'events',
      label: t('hud.chat.tabs.events'),
      short: t('hud.chat.tabs.eventsShort'),
      badge: unreadCounts.system,
    },
    {
      id: 'messages',
      label: t('hud.chat.tabs.messages'),
      short: t('hud.chat.tabs.messagesShort'),
      badge: unreadCounts.chat,
    },
  ];

  return (
    <div className={styles.chat__tabs}>
      <div className={styles.chat__tabs_group}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.chat__tab} ${
              !isMinimized && activeTab === tab.id
                ? styles['chat__tab--active']
                : ''
            }`}
            onClick={() => onSetTab(tab.id)}
          >
            <span className={styles['chat__tab-text--full']}>{tab.label}</span>
            <span className={styles['chat__tab-text--short']}>{tab.short}</span>
            {tab.badge > 0 && (
              <span className={styles.chat__badge}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
        <div
          className={styles.chat__tab_indicator}
          style={{
            transform: `translateX(${activeTab === 'events' ? '0%' : '100%'})`,
            opacity: isMinimized ? 0 : 1,
          }}
        />
      </div>
      <div className={styles.chat__online_indicator}>
        <div
          className={`${styles.chat__online_dot} ${getDotClass(connectionStatus)}`}
        />
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
