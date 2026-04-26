import { useTranslation } from 'react-i18next';

import { ProfileEditForm } from './ProfileEditForm';

import { usePlayerQuery } from '@/queries/player.queries';

import styles from './ProfileEdit.module.css';

export function ProfileEdit() {
  const { t } = useTranslation();
  const { data: player, isLoading } = usePlayerQuery();

  if (isLoading || !player) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  return <ProfileEditForm player={player} />;
}
