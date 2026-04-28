import { useTranslation } from 'react-i18next';

import type { IChatMessage } from '@/common/types';

import { formatDate } from '@/common/utils/date.util';

import styles from './GameChat.module.css';

interface ChatMessageProps {
  msg: IChatMessage;
  onOpenProfile: (userId: string) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

export const ChatMessage = ({
  msg,
  onOpenProfile,
  onDelete,
  currentUserId,
}: ChatMessageProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.message} ${styles[`message--${msg.type}`]}`}
      data-msg-id={msg.id}
      data-msg-type={msg.type}
    >
      <span className={styles.message__time}>
        {formatDate(msg.timestamp, 'time')}
      </span>
      <span
        className={`${styles.message__user} ${
          msg.isModerator ? styles['message__user--mod'] : ''
        }`}
        onClick={() => onOpenProfile(msg.userId)}
      >
        {msg.user}:
      </span>
      {msg.type === 'chat' ? (
        <span className={styles.message__text}>{msg.text}</span>
      ) : (
        <span className={styles.message__log}>
          {`${t('hud.caught')} `}
          <span className={styles.message__fish}>
            {msg.fishId ? t(`fish.${msg.fishId}.name`) : msg.fish}
          </span>{' '}
          (<span className={styles.message__weight}>{msg.weight}</span>)
        </span>
      )}

      {msg.type === 'chat' && msg.userId === currentUserId && (
        <button
          className={styles.message__delete}
          onClick={() => onDelete?.(msg.id)}
          title={t('common.delete')}
        >
          ×
        </button>
      )}
    </div>
  );
};
