import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { updateSettings } from '@/store/slices/settingsSlice';
import {
  setSessionOffline,
  selectGlobalConnectionStatus,
} from '@/store/slices/onlineSlice';

import { Toggle } from '../UI/Toggle/Toggle';
import { ServiceStatus } from '../UI/ServiceStatus/ServiceStatus';

import { OnlineService } from '@/services/online.service';

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

  const handleReconnect = () => {
    OnlineService.pingStatus(true);
    dispatch(setSessionOffline(false));
  };

  return (
    <div className={styles['settings__network-row']}>
      <Toggle
        label={t('lakeSelect.playOnline')}
        isChecked={onlineMode}
        onChange={handleToggle}
      />

      <div className={styles['settings__network-status-wrapper']}>
        <ServiceStatus status={statusType} label={getStatusLabel()} />

        {onlineMode &&
          (connectionStatus === 'offline' || connectionStatus === 'error') && (
            <button
              className={styles['settings__reconnect-button']}
              onClick={handleReconnect}
              title={t('online.reconnect')}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          )}
      </div>
    </div>
  );
}
