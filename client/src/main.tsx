import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import i18n, { i18nInitPromise, type SupportedLanguageType } from './i18n';

import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { GlobalErrorOverlay } from './components/errors/GlobalErrorOverlay';
import { router } from './router/router';

import { store } from './store/store';
import { updateSettings } from './store/slices/settingsSlice';

import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <ErrorBoundary>
          <GlobalErrorOverlay />
          <ReactQueryProvider>
            <RouterProvider router={router} />
            <Analytics />
            <SpeedInsights />
          </ReactQueryProvider>
        </ErrorBoundary>
      </Provider>
    </StrictMode>,
  );
} else {
  console.error('Root element not found');
}

i18nInitPromise.then(() => {
  const currentLang = i18n.language as SupportedLanguageType;

  if (store.getState().settings.language !== currentLang) {
    store.dispatch(updateSettings({ language: currentLang }));
  }
});
