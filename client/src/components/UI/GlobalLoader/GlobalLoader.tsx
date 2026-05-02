import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

import styles from './GlobalLoader.module.css';

export function GlobalLoader() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isLoading) {
      timeout = setTimeout(() => {
        setShouldShow(true);
      }, 100);
    } else {
      timeout = setTimeout(() => {
        setShouldShow(false);
      }, 0);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  if (!shouldShow) return null;

  return <div className={styles.loader} id="global-route-loader" />;
}
