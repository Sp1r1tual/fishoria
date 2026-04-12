import { type ReactNode } from 'react';

import styles from './AuthFormCenter.module.css';

interface AuthFormCenterProps {
  children: ReactNode;
  maxWidth?: string;
}

export const AuthFormCenter = ({
  children,
  maxWidth = '520px',
}: AuthFormCenterProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner} style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
};
