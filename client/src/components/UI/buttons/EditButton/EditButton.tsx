import React from 'react';

import { CircleButton } from '../CircleButton/CircleButton';

import pencilIcon from '@/assets/ui/pencil.webp';

import styles from './EditButton.module.css';

interface IEditButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const EditButton = ({
  onClick,
  className = '',
  title,
  size = 'sm',
}: IEditButtonProps) => {
  return (
    <CircleButton
      variant="brown"
      size={size}
      onClick={onClick}
      className={`${styles.edit_btn} ${className}`}
      title={title}
      icon={
        <img src={pencilIcon} alt="Edit" className={styles.edit_btn__icon} />
      }
    />
  );
};
