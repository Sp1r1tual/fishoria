import type { ReactNode } from 'react';

import { BluredOverlay } from '../BluredOverlay/BluredOverlay';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';

import mainBg from '@/assets/ui/main_menu_background.webp';

import styles from './ScreenContainer.module.css';

interface ScreenContainerProps {
  children: ReactNode;
  title?: string;
  titleIcon?: string;
  onBack: () => void;
  background?: string;
  className?: string;
  headerExtra?: ReactNode;
  showBgImage?: boolean;
  showBlur?: boolean;
  onInfo?: () => void;
  infoText?: string;
}

export function ScreenContainer({
  children,
  title,
  titleIcon,
  onBack,
  background = mainBg,
  className = '',
  headerExtra,
  showBgImage = true,
  showBlur = true,
  onInfo,
  infoText,
}: ScreenContainerProps) {
  return (
    <main className={`${styles.container} ${className}`}>
      {showBgImage && (
        <div
          className={styles.container__bg}
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {showBlur && <BluredOverlay opacity={0.3} blurSize="5px" />}

      <div className={`${styles.container__inner} fade-in`}>
        <ScreenHeader
          title={title}
          titleIcon={titleIcon}
          onBack={onBack}
          headerExtra={headerExtra}
          onInfo={onInfo}
          infoText={infoText}
        />

        <div className={styles.container__content}>{children}</div>
      </div>
    </main>
  );
}
