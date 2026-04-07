import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import './i18n';

import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { GlobalErrorOverlay } from './components/errors/GlobalErrorOverlay';
import { router } from './router/router';

import { store } from './store';
import { updateSettings } from './store/slices/settingsSlice';

import {
  loadTranslations,
  markLanguageInitialized,
  isFirstLanguageRun,
  detectLanguage,
  type SupportedLanguage,
} from './i18n';

import './index.css';

const initialLang: SupportedLanguage = isFirstLanguageRun()
  ? detectLanguage()
  : ((store.getState().settings.language as SupportedLanguage) ?? 'en');

if (isFirstLanguageRun()) {
  store.dispatch(updateSettings({ language: initialLang }));
  markLanguageInitialized();
}

loadTranslations(initialLang).then(() => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <ErrorBoundary>
          <GlobalErrorOverlay />
          <ReactQueryProvider>
            <RouterProvider router={router} />
          </ReactQueryProvider>
        </ErrorBoundary>
      </Provider>
    </StrictMode>,
  );
});
