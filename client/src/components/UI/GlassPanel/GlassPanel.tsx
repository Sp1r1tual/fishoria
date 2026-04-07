import type { ReactNode } from 'react';

import styles from './GlassPanel.module.css';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return <div className={`glass ${styles.panel} ${className}`}>{children}</div>;
}
