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
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  withScrollFade?: boolean;
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
  width = 'md',
  withScrollFade = false,
}: ScreenContainerProps) {
  const widthClass = styles[`width-${width}`];

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

      <div className={`${styles.container__inner} ${widthClass} fade-in`}>
        <ScreenHeader
          title={title}
          titleIcon={titleIcon}
          onBack={onBack}
          headerExtra={headerExtra}
          onInfo={onInfo}
          infoText={infoText}
        />

        <div
          className={`${styles.container__content} ${
            withScrollFade ? styles.with_fade : ''
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
