import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { CircleButton } from '../../buttons/CircleButton/CircleButton';

import styles from './Modal.module.css';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
  closeButtonVariant?: 'red' | 'brown' | 'glass' | 'danger' | 'wooden';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  width,
  maxWidth,
  showCloseButton = false,
  closeButtonVariant = 'red',
}: IModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        style={{ width: width || '100%', maxWidth: maxWidth || '500px' }}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showCloseButton && (
              <CircleButton
                variant={closeButtonVariant}
                size="sm"
                onClick={onClose}
                className={styles.closeBtn}
              />
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
