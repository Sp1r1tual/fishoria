import { Component, type ReactNode } from 'react';
import { Translation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

import styles from './errors.module.css';

interface IErrorBoundaryProps {
  children?: ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  public state: IErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    const errorMessage = error.message.toLowerCase();

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
                <h1>{t('errorPage.boundaryTitle')}</h1>
                <p>{t('errorPage.boundaryDescription')}</p>

                {this.state.error && (
                  <div className={styles.errorDetails}>
                    {this.state.error.toString()}
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <WoodyButton variant="brown" onClick={this.handleReload}>
                    {t('errorPage.reload')}
                  </WoodyButton>
                  <WoodyButton variant="green" onClick={this.handleGoHome}>
                    {t('errorPage.goHome')}
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
