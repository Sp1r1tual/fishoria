import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../../buttons/WoodyButton/WoodyButton';
import { CircleButton } from '../../buttons/CircleButton/CircleButton';
import { BluredOverlay } from '../../BluredOverlay/BluredOverlay';

import styles from './ConfirmChoiceModal.module.css';

interface IConfirmChoiceModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: string;
  price?: number;
  coinIcon?: string;
  isLoading?: boolean;
  closeButtonVariant?: 'red' | 'brown' | 'glass' | 'danger' | 'wooden';
  confirmButtonVariant?: 'green' | 'brown' | 'red';
}

export function ConfirmChoiceModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon,
  price,
  coinIcon,
  isLoading = false,
  closeButtonVariant = 'wooden',
  confirmButtonVariant = 'green',
}: IConfirmChoiceModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const finalConfirmLabel = confirmLabel || t('shop.buy');
  const finalCancelLabel = cancelLabel || t('nav.back');

  return createPortal(
    <div className={styles.modal} onClick={onCancel}>
      <BluredOverlay opacity={0.6} blurSize="8px" onClick={onCancel} />
      <div
        className={`${styles.modal__inner} fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>{title}</h2>
          <CircleButton
            variant={closeButtonVariant}
            size="sm"
            onClick={onCancel}
            className={styles.modal__close}
            disabled={isLoading}
          />
        </div>

        <div className={styles.modal__content}>
          {icon && (
            <div className={styles.modal__icon}>
              {icon.includes('/') || icon.includes('data:') ? (
                <img
                  src={icon}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                icon
              )}
            </div>
          )}
          <p className={styles.modal__message}>{message}</p>

          {price !== undefined && coinIcon && (
            <div className={styles.modal__price}>
              {t('shop.totalCost')} <img src={coinIcon} alt="coins" /> {price}
            </div>
          )}

          <div className={styles.modal__actions}>
            <WoodyButton
              variant="brown"
              size="md"
              disabled={isLoading}
              onClick={onCancel}
              label={finalCancelLabel}
            />
            <WoodyButton
              variant={confirmButtonVariant}
              size="md"
              disabled={isLoading}
              onClick={onConfirm}
              label={finalConfirmLabel}
            />
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root') || document.body,
  );
}
