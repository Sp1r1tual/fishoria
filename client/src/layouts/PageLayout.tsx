import { Suspense, type ReactNode } from 'react';
import { Outlet } from 'react-router';

import { Footer } from '@/components/Footer/Footer';
import { GlobalPreloader } from '@/components/UI/GlobalPreloader/GlobalPreloader';

import styles from './PageLayout.module.css';

interface IPageLayoutProps {
  children?: ReactNode;
}

export function PageLayout({ children }: IPageLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.scrollArea}>
        <Suspense fallback={<GlobalPreloader delay={0} />}>
          {children ?? <Outlet />}
        </Suspense>

        <Footer />
      </div>
    </div>
  );
}
