import { createBrowserRouter } from 'react-router';

import App from '@/App';
import { ShopPage } from './pages/ShopPage';
import { InventoryPage } from './pages/InventoryPage';
import { GearPage } from './pages/GearPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GuidePage } from './pages/GuidePage';
import { QuestsPage } from './pages/QuestsPage';
import { HelpPage } from './pages/HelpPage';
import { NewsPage } from './pages/NewsPage';
import { LandingPage } from './pages/LandingPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { GameScreen } from '@/components/GameScreen/GameScreen';
import { AchievementsPage } from './pages/AchievementsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ErrorElement } from '@/components/errors/ErrorElement';
import { ServerUnavailablePage } from './pages/ServerUnavailablePage';

export const router = createBrowserRouter([
  {
    path: '/server-unavailable',
    element: <ServerUnavailablePage />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/welcome',
        element: <LandingPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '/terms',
        element: <TermsPage />,
      },
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <GameScreen />,
          },
          {
            path: 'marketplace',
            element: <ShopPage />,
          },
          {
            path: 'keepnet',
            element: <InventoryPage />,
          },
          {
            path: 'equipment',
            element: <GearPage />,
          },
          {
            path: 'statistics',
            element: <StatsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'guide',
            element: <GuidePage />,
          },
          {
            path: 'quests',
            element: <QuestsPage />,
          },
          {
            path: 'help',
            element: <HelpPage />,
          },
          {
            path: 'news',
            element: <NewsPage />,
          },
          {
            path: 'achievements',
            element: <AchievementsPage />,
          },
        ],
      },
    ],
  },
]);
