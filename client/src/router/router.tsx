import { createBrowserRouter } from 'react-router';
import type { TFunction } from 'i18next';

import App from '@/App';
import { ErrorElement } from '@/components/errors/ErrorElement';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLayout } from '@/layouts/PageLayout';
import { GameScreen } from '@/components/GameScreen/GameScreen';

import { LandingPage } from './pages/LandingPage';
import { ShopPage } from './pages/ShopPage';
import { InventoryPage } from './pages/InventoryPage';
import { GearPage } from './pages/GearPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GuidePage } from './pages/GuidePage';
import { QuestsPage } from './pages/QuestsPage';
import { HelpPage } from './pages/HelpPage';
import { NewsPage } from './pages/NewsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ServerUnavailablePage } from './pages/ServerUnavailablePage';

export const router = createBrowserRouter([
  {
    path: '/server-unavailable',
    element: <ServerUnavailablePage />,
    handle: {
      title: (t: TFunction) => t('serverUnavailable.title'),
      description: (t: TFunction) => t('serverUnavailable.description'),
    },
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/welcome',
        element: <LandingPage />,
        handle: {
          title: (t: TFunction) => t('landing.title'),
          description: (t: TFunction) => t('meta.landing'),
        },
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
        handle: {
          title: (t: TFunction) =>
            `Fishoria | ${t('landing.resetPassword.title')}`,
          description: (t: TFunction) => t('meta.resetPassword'),
        },
      },
      {
        path: '/privacy',
        element: <PrivacyPage />,
        handle: {
          title: (t: TFunction) => `Fishoria | ${t('privacy.title')}`,
          description: (t: TFunction) => t('meta.privacy'),
        },
      },
      {
        path: '/terms',
        element: <TermsPage />,
        handle: {
          title: (t: TFunction) => `Fishoria | ${t('terms.title')}`,
          description: (t: TFunction) => t('meta.terms'),
        },
      },
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <GameScreen />,
            handle: {
              title: 'Fishoria',
              description: (t: TFunction) => t('meta.home'),
            },
          },
          {
            element: <PageLayout />,
            children: [
              {
                path: 'marketplace',
                element: <ShopPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('shop.title')}`,
                  description: (t: TFunction) => t('meta.shop'),
                },
              },
              {
                path: 'keepnet',
                element: <InventoryPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('inventory.title')}`,
                  description: (t: TFunction) => t('meta.inventory'),
                },
              },
              {
                path: 'equipment',
                element: <GearPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('gear.title')}`,
                  description: (t: TFunction) => t('meta.gear'),
                },
              },
              {
                path: 'statistics',
                element: <StatsPage />,
                handle: {
                  title: (t: TFunction) =>
                    `Fishoria | ${t('statistics.title')}`,
                  description: (t: TFunction) => t('meta.statistics'),
                },
              },
              {
                path: 'settings',
                element: <SettingsPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('settings.title')}`,
                  description: (t: TFunction) => t('meta.settings'),
                },
              },
              {
                path: 'guide',
                element: <GuidePage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('guide.title')}`,
                  description: (t: TFunction) => t('meta.guide'),
                },
              },
              {
                path: 'quests',
                element: <QuestsPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('quests.title')}`,
                  description: (t: TFunction) => t('meta.quests'),
                },
              },
              {
                path: 'help',
                element: <HelpPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('help.title')}`,
                  description: (t: TFunction) => t('meta.help'),
                },
              },
              {
                path: 'news',
                element: <NewsPage />,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('news.title')}`,
                  description: (t: TFunction) => t('meta.news'),
                },
              },
              {
                path: 'achievements',
                element: <AchievementsPage />,
                handle: {
                  title: (t: TFunction) =>
                    `Fishoria | ${t('achievements.title')}`,
                  description: (t: TFunction) => t('meta.achievements'),
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);
