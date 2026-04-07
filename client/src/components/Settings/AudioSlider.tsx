import styles from './Settings.module.css';

interface AudioSliderProps {
  id?: string;
  name?: string;
  value: number;
  enabled: boolean;
  onVolumeChange: (volume: number) => void;
}

export const AudioSlider = ({
  id,
  name,
  value,
  enabled,
  onVolumeChange,
}: AudioSliderProps) => {
  return (
    <input
      id={id}
      name={name}
      type="range"
      min="0"
      max="100"
      value={value}
      disabled={!enabled}
      onChange={(e) => onVolumeChange(parseInt(e.target.value))}
      className={styles['settings__slider']}
    />
  );
};
