import { useTranslation } from 'react-i18next';

import { Toggle } from '../UI/Toggle/Toggle';
import { ServiceStatus } from '../UI/ServiceStatus/ServiceStatus';

import styles from './Settings.module.css';

export function NetworkSection() {
  const { t } = useTranslation();

  return (
    <div className={styles['settings__network-row']}>
      <Toggle label={t('lakeSelect.playOnline')} onChange={() => {}} />

      <ServiceStatus
        status="online"
        label={t('settings.serverStatus.online')}
        onClick={() => {}}
      />
    </div>
  );
}
