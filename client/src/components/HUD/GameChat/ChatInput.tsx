import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './GameChat.module.css';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      const val = inputValue.trim();
      if (!val) return;

      onSendMessage(val);
      setInputValue('');
    },
    [inputValue, onSendMessage],
  );

  return (
    <form className={styles.chat__input_wrapper} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.chat__input}
        placeholder={t('hud.chat.placeholder')}
        maxLength={100}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <span
        className={`${styles.chat__counter} ${
          inputValue.length >= 90 ? styles['chat__counter--warning'] : ''
        }`}
      >
        {inputValue.length}/100
      </span>
      <button
        type="submit"
        className={styles.chat__send_btn}
        disabled={!inputValue.trim()}
      >
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
  );
};
