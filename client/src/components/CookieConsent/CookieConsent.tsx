import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

import styles from './CookieConsent.module.css';

const CONSENT_KEY = 'web-fishing-cookie-consent';

interface CookieConsentProps {
  onAccept?: () => void;
}

export function CookieConsent({ onAccept }: CookieConsentProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem(CONSENT_KEY)) {
          setIsVisible(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className={styles['cookie-consent']}>
      <div className={styles['cookie-consent__content']}>
        <div className={styles['cookie-consent__icon']}>🍪</div>
        <div className={styles['cookie-consent__text']}>
          <h4 className={styles['cookie-consent__title']}>
            {t('cookie.title')}
          </h4>
          <p className={styles['cookie-consent__desc']}>
            {t('cookie.description')}
          </p>
        </div>
      </div>
      <WoodyButton
        variant="green"
        size="sm"
        isShining={true}
        onClick={handleAccept}
        className={styles['cookie-consent__btn']}
      >
        {t('cookie.accept')}
      </WoodyButton>
    </div>
  );
}
