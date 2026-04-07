import { useState, useRef, useEffect } from 'react';
import styles from './WoodySelect.module.css';

interface WoodySelectOption {
  value: string;
  label: string;
}

interface WoodySelectProps {
  id?: string;
  value: string;
  options: WoodySelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function WoodySelect({
  id,
  value,
  options,
  onChange,
  className = '',
}: WoodySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`${styles['woody-select']} ${className}`}
      id={id}
    >
      <div
        className={`${styles['woody-select__trigger']} ${isOpen ? styles['woody-select__trigger--open'] : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles['woody-select__value']}>
          {selectedOption?.label}
        </span>
        <div className={styles['woody-select__arrow']}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div
        className={`${styles['woody-select__dropdown']} ${isOpen ? styles['woody-select__dropdown--visible'] : ''}`}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={`${styles['woody-select__option']} ${
              option.value === value
                ? styles['woody-select__option--selected']
                : ''
            }`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
            {option.value === value && (
              <span className={styles['woody-select__check']}>✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
