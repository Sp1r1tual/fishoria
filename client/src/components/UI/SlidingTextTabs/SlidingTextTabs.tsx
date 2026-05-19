import { useClickSound } from '@/hooks/audio/useSoundEffect';

import styles from './SlidingTextTabs.module.css';

interface TabItem {
  id: string;
  label: string;
}

interface SlidingTextTabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: readonly TabItem[];
}

export function SlidingTextTabs({
  activeTab,
  onChange,
  tabs,
}: SlidingTextTabsProps) {
  const playClick = useClickSound();
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div
      className={styles['tabs-container']}
      style={
        {
          '--active-index': safeIndex,
        } as React.CSSProperties
      }
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              playClick();
              onChange(tab.id);
            }}
            className={`${styles['tab-button']} ${isActive ? styles['active'] : ''}`}
          >
            {tab.label}
          </button>
        );
      })}
      <div className={styles['underline-wrapper']}>
        <div className={styles['underline-line']} />
      </div>
    </div>
  );
}
