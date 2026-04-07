import styles from './ItemIcon.module.css';

interface ItemIconProps {
  icon?: string;
  className?: string;
}

export function ItemIcon({ icon, className = '' }: ItemIconProps) {
  if (!icon) return null;

  const isImage = icon.includes('/') || icon.startsWith('data:');

  return (
    <div className={`${styles.item_icon} ${className}`}>
      {isImage ? (
        <img src={icon} alt="" className={styles.item_icon__image} />
      ) : (
        <span className={styles.item_icon__text}>{icon}</span>
      )}
    </div>
  );
}
