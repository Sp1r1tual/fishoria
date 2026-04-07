import styles from './BluredOverlay.module.css';

interface BluredOverlayProps {
  opacity?: number;
  blurSize?: string;
  onClick?: () => void;
}

export function BluredOverlay({
  opacity = 0.5,
  blurSize = '8px',
  onClick,
}: BluredOverlayProps) {
  return (
    <div
      className={styles.overlay}
      onClick={onClick}
      style={{
        backgroundColor: `rgba(2, 6, 23, ${opacity})`,
        backdropFilter: `blur(${blurSize})`,
        pointerEvents: onClick ? 'auto' : 'none',
      }}
    />
  );
}
