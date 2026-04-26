import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

import lakeIcon from '@/assets/ui/echo_sounder.webp';
import weatherIcon from '@/assets/ui/cellphone.webp';
import spinningIcon from '@/assets/ui/bite_event.webp';
import shopIcon from '@/assets/ui/shop.webp';

import styles from './WelcomeModal.module.css';

const WELCOME_KEY = 'fishoria_welcome_shown';

export const WelcomeModal: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(WELCOME_KEY);
    }
    return false;
  });

  const handleClose = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles['welcome-overlay']}>
      <div className={styles['welcome-modal']}>
        <div className={styles['welcome-header']}>
          <h1 className={styles['welcome-title']}>{t('welcome.title')}</h1>
          <div className={styles['welcome-subtitle']}>
            {t('welcome.subtitle')}
          </div>
        </div>

        <div className={styles['welcome-content']}>
          <div className={styles['tutorial-grid']}>
            <div className={styles['tutorial-step']}>
              <div className={styles['step-header']}>
                <div className={styles['step-icon']}>
                  <img src={lakeIcon} alt="Lakes" />
                </div>
                <strong>{t('welcome.depth_title')}</strong>
              </div>
              <p>{t('welcome.depth_desc')}</p>
            </div>

            <div className={styles['tutorial-step']}>
              <div className={styles['step-header']}>
                <div className={styles['step-icon']}>
                  <img src={weatherIcon} alt="Weather" />
                </div>
                <strong>{t('welcome.weather_title')}</strong>
              </div>
              <p>{t('welcome.weather_desc')}</p>
            </div>

            <div className={styles['tutorial-step']}>
              <div className={styles['step-header']}>
                <div className={styles['step-icon']}>
                  <img src={spinningIcon} alt="Spinning" />
                </div>
                <strong>{t('welcome.spinning_title')}</strong>
              </div>
              <p>{t('welcome.spinning_desc')}</p>
            </div>

            <div className={styles['tutorial-step']}>
              <div className={styles['step-header']}>
                <div className={styles['step-icon']}>
                  <img src={shopIcon} alt="Shop" />
                </div>
                <strong>{t('welcome.economy_title')}</strong>
              </div>
              <p>{t('welcome.economy_desc')}</p>
            </div>
          </div>
        </div>

        <div className={styles['welcome-footer']}>
          <WoodyButton
            variant="brown"
            size="md"
            onClick={handleClose}
            className={styles['start-button']}
            isShining
          >
            {t('welcome.start_btn')}
          </WoodyButton>
        </div>
      </div>
    </div>
  );
};
