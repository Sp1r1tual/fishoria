import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';

import { useResetProfileMutation } from '@/queries/player.queries';

import styles from './Settings.module.css';

export function DangerZoneSection() {
  const { t } = useTranslation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { mutateAsync: resetProfile, isPending } = useResetProfileMutation();

  const handleResetProgress = useCallback(() => {
    setIsResetModalOpen(true);
  }, []);

  const confirmReset = useCallback(async () => {
    try {
      await resetProfile();
      localStorage.removeItem('fishoria_settings');
      localStorage.removeItem('fishing_session_data');
      localStorage.removeItem('fishoria_read_news_ids');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      setIsResetModalOpen(false);
    }
  }, [resetProfile]);

  const handleCancelReset = useCallback(() => {
    if (isPending) return;
    setIsResetModalOpen(false);
  }, [isPending]);

  return (
    <>
      <section className={styles['settings__section']}>
        <h3 className={styles['settings__section-title']}>
          {t('settings.dangerZone')}
        </h3>
        <div className={styles['settings__danger-wrap']}>
          <div className={styles['settings__warning']}>
            {t('settings.resetWarning')}
          </div>
          <WoodyButton
            variant="red"
            size="md"
            disabled={isPending}
            className={styles['settings__danger-btn']}
            onClick={handleResetProgress}
            label={
              isPending ? t('common.processing') : t('settings.resetButton')
            }
          />
        </div>
      </section>

      <ConfirmChoiceModal
        isOpen={isResetModalOpen}
        title={t('settings.dangerZone')}
        message={t('settings.resetConfirm')}
        confirmLabel={
          isPending ? t('common.processing') : t('settings.resetButton')
        }
        cancelLabel={t('nav.back')}
        onConfirm={confirmReset}
        onCancel={handleCancelReset}
        isLoading={isPending}
        confirmButtonVariant="red"
      />
    </>
  );
}
