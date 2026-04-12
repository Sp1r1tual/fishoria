import { type ReactNode, forwardRef } from 'react';

import { Footer } from '@/components/Footer/Footer';
import { Bubbles } from '@/components/UI/Bubbles/Bubbles';

import styles from './LandingLayout.module.css';

interface ILandingLayoutProps {
  children: ReactNode;
  bubbleCount?: number;
  contentClassName?: string;
}

export const LandingLayout = forwardRef<HTMLDivElement, ILandingLayoutProps>(
  ({ children, bubbleCount = 20, contentClassName }, ref) => {
    return (
      <>
        <div ref={ref} className={styles.container}>
          <div className={styles.background} aria-hidden="true" />
          <Bubbles count={bubbleCount} aria-hidden="true" />
          <div className={contentClassName || styles.content}>{children}</div>
        </div>

        <Footer />
      </>
    );
  },
);
