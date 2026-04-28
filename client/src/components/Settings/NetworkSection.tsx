import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { updateSettings } from '@/store/slices/settingsSlice';
import {
  setSessionOffline,
  selectGlobalConnectionStatus,
} from '@/store/slices/onlineSlice';

import { Toggle } from '../UI/Toggle/Toggle';
import { ServiceStatus } from '../UI/ServiceStatus/ServiceStatus';

import styles from './Settings.module.css';

export function NetworkSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const connectionStatus = useAppSelector(selectGlobalConnectionStatus);

  const handleToggle = () => {
    const nextMode = !onlineMode;
    dispatch(updateSettings({ onlineMode: nextMode }));
    if (nextMode) {
      dispatch(setSessionOffline(false));
    }
  };

  const getStatusLabel = () => {
    if (!onlineMode) return t('online.status.disabled');
    switch (connectionStatus) {
      case 'online':
        return t('online.status.online');
      case 'connecting':
        return t('online.status.connecting');
      case 'error':
        return t('online.status.error');
      default:
        return t('online.status.offline');
    }
  };

  const statusType = !onlineMode ? 'offline' : connectionStatus;

  return (
    <div className={styles['settings__network-row']}>
      <Toggle
        label={t('lakeSelect.playOnline')}
        isChecked={onlineMode}
        onChange={handleToggle}
      />

      <ServiceStatus status={statusType} label={getStatusLabel()} />
    </div>
  );
}
