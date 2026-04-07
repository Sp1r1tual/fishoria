import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer/Footer';

import styles from './PageLayout.module.css';

interface IPageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: IPageLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.scrollArea}>
        {children}
        <Footer />
      </div>
    </div>
  );
}
