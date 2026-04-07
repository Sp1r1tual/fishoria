import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';

import { LocalizationSection } from './LocalizationSection';
import { AudioSection } from './AudioSection';
import { AccountSection } from './AccountSection';
import { DangerZoneSection } from './DangerZoneSection';

import settingsIcon from '@/assets/ui/settings.webp';

import styles from './Settings.module.css';

export function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <ScreenContainer
      title={t('settings.title')}
      titleIcon={settingsIcon}
      onBack={handleBackClick}
      className={styles.settings}
    >
      <LocalizationSection />
      <AudioSection />
      <AccountSection />
      <DangerZoneSection />
    </ScreenContainer>
  );
}
