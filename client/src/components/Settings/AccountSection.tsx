import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/hooks/core/useLogout';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';

import styles from './Settings.module.css';

export function AccountSection() {
  const { logout } = useLogout();
  const { t } = useTranslation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleCancelLogout = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  return (
    <>
      <section className={styles['settings__section']}>
        <h3 className={styles['settings__section-title']}>
          {t('settings.account')}
        </h3>
        <div className={styles['settings__logout-container']}>
          <WoodyButton
            variant="red"
            size="md"
            onClick={handleLogout}
            label={t('settings.logoutButton')}
          />
        </div>
      </section>

      <ConfirmChoiceModal
        isOpen={isLogoutModalOpen}
        title={t('settings.logoutConfirmTitle')}
        message={t('settings.logoutConfirmMessage')}
        confirmLabel={t('settings.logoutButton')}
        cancelLabel={t('nav.back')}
        onConfirm={confirmLogout}
        onCancel={handleCancelLogout}
        confirmButtonVariant="red"
      />
    </>
  );
}
