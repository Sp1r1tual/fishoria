import styles from './ExpandButton.module.css';

interface ExpandButtonProps {
  isExpanded: boolean;
}

export const ExpandButton = ({ isExpanded }: ExpandButtonProps) => {
  return (
    <span className={styles.statsCardToggle}>{isExpanded ? '−' : '+'}</span>
  );
};
