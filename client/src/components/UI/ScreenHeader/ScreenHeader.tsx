import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../buttons/WoodyButton/WoodyButton';
import { InfoButton } from '../buttons/InfoButton/InfoButton';

import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  title?: string;
  titleIcon?: string;
  onBack?: () => void;
  headerExtra?: ReactNode;
  showBack?: boolean;
  onInfo?: () => void;
  infoText?: string;
}

export function ScreenHeader({
  title,
  titleIcon,
  onBack,
  headerExtra,
  showBack = true,
  onInfo,
  infoText,
}: ScreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <header className={`glass ${styles.header}`}>
        {showBack && onBack && (
          <WoodyButton
            variant="brown"
            size="sm"
            isBackBtn
            onClick={onBack}
            label={t('nav.back')}
          />
        )}

        <div className={styles.title_group}>
          {titleIcon && (
            <img src={titleIcon} alt="" className={styles.title_icon} />
          )}
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.header_extra}>
          {headerExtra}
          {infoText && (
            <InfoButton
              title={infoText}
              onClick={onInfo || (() => {})}
              className={styles.info_btn}
            />
          )}
        </div>
      </header>
    </div>
  );
}
