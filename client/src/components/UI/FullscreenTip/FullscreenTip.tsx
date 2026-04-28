import { useTranslation } from 'react-i18next';

import { useIsPortrait } from '@/hooks/ui/useIsPortrait';

import { WoodyButton } from '../buttons/WoodyButton/WoodyButton';
import { BluredOverlay } from '../BluredOverlay/BluredOverlay';

import {
  isIOS,
  isAndroid,
  isMac,
  isWindows,
  isMobile,
} from '@/common/utils/device.util';

import styles from './FullscreenTip.module.css';

interface FullscreenTipProps {
  onClose: () => void;
}

export const FullscreenTip: React.FC<FullscreenTipProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const isPortrait = useIsPortrait();

  const getHintKey = () => {
    if (isWindows) return 'fullscreen.hints.windows';
    if (isMac) return 'fullscreen.hints.mac';
    if (isIOS) return 'fullscreen.hints.ios';
    if (isAndroid) return 'fullscreen.hints.android';
    return 'fullscreen.hints.default';
  };

  const containerClasses = `
    ${styles.container} 
    ${isMobile ? styles.isMobile : ''} 
    ${isPortrait ? styles.isPortrait : styles.isLandscape}
  `.trim();

  return (
    <div className={containerClasses}>
      <BluredOverlay opacity={0.85} blurSize="8px" />
      <div className={styles.modal}>
        <h2 className={styles.title}>{t('fullscreen.title')}</h2>
        <p className={styles.description}>{t('fullscreen.description')}</p>

        <div className={styles.actions}>
          <div className={styles.hint}>{t(getHintKey())}</div>
          <WoodyButton variant="brown" size="md" onClick={onClose} isShining>
            {t('fullscreen.close')}
          </WoodyButton>
        </div>
      </div>
    </div>
  );
};
