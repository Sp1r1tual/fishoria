import { useEffect, useState } from 'react';

import styles from './GlobalErrorOverlay.module.css';

type RuntimeError = {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
};

const getErrorId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `runtime-error-${Date.now()}`;
};

export const GlobalErrorOverlay = () => {
  const [errors, setErrors] = useState<RuntimeError[]>([]);

  const pushError = (message: string, stack?: string) => {
    setErrors((current) => [
      ...current,
      {
        id: getErrorId(),
        message,
        stack,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const removeError = (id: string) => {
    setErrors((current) => current.filter((e) => e.id !== id));
  };

  useEffect(() => {
    const handleWindowError = (
      message: string | Event,
      _url?: string,
      _lineNo?: number,
      _columnNo?: number,
      error?: Error | null,
    ) => {
      const text = typeof message === 'string' ? message : 'Unknown error';
      pushError(text, error?.stack);
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || 'Promise Rejection';
      const stack = reason instanceof Error ? reason.stack : undefined;
      pushError(message, stack);
    };

    window.onerror = handleWindowError;
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.onerror = null;
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className={styles.overlay} role="alert" aria-live="assertive">
      <div className={styles.overlayHeader}>
        <strong>Runtime errors</strong>
      </div>

      {errors.map((error) => (
        <div key={error.id} className={styles.messageBox}>
          <div className={styles.messageHeader}>
            <strong>Runtime error:</strong>
            <span className={styles.timestamp}>{error.timestamp}</span>
            <button
              onClick={() => removeError(error.id)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
          <div className={styles.messageText}>{error.message}</div>
          {error.stack && (
            <pre className={styles.stackTrace}>{error.stack}</pre>
          )}
        </div>
      ))}
    </div>
  );
};
