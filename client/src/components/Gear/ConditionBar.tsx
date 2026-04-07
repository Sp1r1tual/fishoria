interface IConditionBarProps {
  value: number;
  max: number;
  label: string;
  color: string;
  styles: Record<string, string>;
}

export function ConditionBar({
  value,
  max,
  label,
  color,
  styles,
}: IConditionBarProps) {
  return (
    <div className={styles['gear-item__condition-wrap']}>
      <span className={styles['gear-item__condition-text']} style={{ color }}>
        {label}
      </span>
      <div className={styles['gear-item__condition-bar']}>
        <div
          className={styles['gear-item__condition-fill']}
          style={{
            width: `${Math.max(0, (value / max) * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
