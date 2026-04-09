import { Component, type ReactNode } from 'react';
import { Translation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import styles from './errors.module.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorMessage = error.message.toLowerCase();
    // If it's a chunk load error (failed to fetch module), reload the page
    if (
      errorMessage.includes('failed to fetch dynamically imported module') ||
      (errorMessage.includes('loading chunk') &&
        errorMessage.includes('failed'))
    ) {
      console.warn('Chunk load error caught in ErrorBoundary. Reloading...');
      window.location.reload();
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:\n', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Translation>
          {(t: TFunction) => (
            <div className={styles.errorContainer}>
              <div className={styles.errorBox}>
                <h1>
                  {t('errorPage.boundaryTitle', 'Oops! Something went wrong.')}
                </h1>
                <p>
                  {t(
                    'errorPage.boundaryDescription',
                    'An unexpected error occurred in this component.',
                  )}
                </p>

                {this.state.error && (
                  <div className={styles.errorDetails}>
                    {this.state.error.toString()}
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <WoodyButton variant="brown" onClick={this.handleReload}>
                    {t('errorPage.reload', 'Reload Page')}
                  </WoodyButton>
                  <WoodyButton variant="green" onClick={this.handleGoHome}>
                    {t('errorPage.goHome', 'Go Home')}
                  </WoodyButton>
                </div>
              </div>
            </div>
          )}
        </Translation>
      );
    }

    return this.props.children;
  }
}
