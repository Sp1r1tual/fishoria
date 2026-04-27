import { useTranslation } from 'react-i18next';

import { useGameChat } from '@/hooks/game/useGameChat';

import { ProfileModal } from '@/components/UI/modals/ProfileModal/ProfileModal';
import { ChatTabs } from './ChatTabs';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

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

  const {
    state,
    filteredMessages,
    unreadCounts,
    onlineCount,
    connectionStatus,
    firstUnreadIdx,
    selectedPlayer,
    isProfileOpen,
    profileError,
    handleOpenProfile,
    setIsProfileOpen,
    scrollRef,
    handleScroll,
    handleSendMessage,
    setTab,
    toggleMinimized,
  } = useGameChat(initialReadPointers);

  return (
    <div
      className={`${styles.chat} ${isNight ? styles['chat--night'] : ''} ${
        state.isMinimized ? styles['chat--minimized'] : ''
      }`}
    >
      <ChatTabs
        activeTab={state.activeTab}
        isMinimized={state.isMinimized}
        unreadCounts={unreadCounts}
        connectionStatus={connectionStatus}
        onlineCount={onlineCount}
        onSetTab={setTab}
        onToggleMinimized={toggleMinimized}
      />

      <div className={styles.chat__body}>
        <div
          className={styles.chat__messages}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {filteredMessages.map((msg, idx) => (
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
