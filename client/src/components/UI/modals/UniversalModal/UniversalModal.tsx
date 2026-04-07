import { createPortal } from 'react-dom';

import type { UniversalModalType } from '@/common/types';

import { BluredOverlay } from '../../BluredOverlay/BluredOverlay';

import styles from './UniversalModal.module.css';

interface UniversalModalProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  type?: UniversalModalType;
  description?: string | React.ReactNode;
  large?: boolean;
}

export function UniversalModal({
  isOpen,
  title,
  onClose,
  children,
  actions,
  header,
  type = 'default',
  description,
  large = false,
}: UniversalModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <BluredOverlay opacity={0.65} blurSize="12px" onClick={onClose} />

      <div
        className={`
          ${styles.modal} 
          ${styles[`modal--${type}`]} 
          ${large ? styles.modalLarge : ''} 
          fade-in
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.glow} />

        {header && <div className={styles.header}>{header}</div>}

        <div className={styles.content}>
          <div className={styles.titleGroup}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && (
              <div className={styles.description}>{description}</div>
            )}
          </div>

          <div className={styles.body}>{children}</div>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>,
    document.getElementById('portal-root') || document.body,
  );
}
