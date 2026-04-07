import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import styles from './CookieConsent.module.css';

const CONSENT_KEY = 'web-fishing-cookie-consent';

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setIsVisible(false);
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
        variant="brown"
        size="sm"
        onClick={handleAccept}
        className={styles['cookie-consent__btn']}
      >
        {t('cookie.accept')}
      </WoodyButton>
    </div>
  );
}
