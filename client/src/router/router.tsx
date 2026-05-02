import { createBrowserRouter } from 'react-router';
import type { TFunction } from 'i18next';

import App from '@/App';
import { ErrorElement } from '@/components/errors/ErrorElement';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLayout } from '@/layouts/PageLayout';
import { GameScreen } from '@/components/GameScreen/GameScreen';

import * as Pages from './pages';

export const router = createBrowserRouter([
  {
    path: '/server-unavailable',
    lazy: Pages.ServerUnavailablePage,
    handle: {
      title: (t: TFunction) => t('serverUnavailable.title'),
      description: (t: TFunction) => t('serverUnavailable.description'),
      noindex: true,
    },
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/welcome',
        lazy: Pages.LandingPage,
        handle: {
          title: (t: TFunction) => t('landing.title'),
          description: (t: TFunction) => t('meta.landing'),
        },
      },
      {
        path: '/reset-password',
        lazy: Pages.ResetPasswordPage,
        handle: {
          title: (t: TFunction) =>
            `Fishoria | ${t('landing.resetPassword.title')}`,
          description: (t: TFunction) => t('meta.resetPassword'),
          noindex: true,
        },
      },
      {
        path: '/privacy',
        lazy: Pages.PrivacyPage,
        handle: {
          title: (t: TFunction) => `Fishoria | ${t('privacy.title')}`,
          description: (t: TFunction) => t('meta.privacy'),
          noindex: true,
        },
      },
      {
        path: '/terms',
        lazy: Pages.TermsPage,
        handle: {
          title: (t: TFunction) => `Fishoria | ${t('terms.title')}`,
          description: (t: TFunction) => t('meta.terms'),
          noindex: true,
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
                lazy: Pages.ShopPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('shop.title')}`,
                  description: (t: TFunction) => t('meta.shop'),
                },
              },
              {
                path: 'keepnet',
                lazy: Pages.InventoryPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('inventory.title')}`,
                  description: (t: TFunction) => t('meta.inventory'),
                },
              },
              {
                path: 'equipment',
                lazy: Pages.GearPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('gear.title')}`,
                  description: (t: TFunction) => t('meta.gear'),
                },
              },
              {
                path: 'statistics',
                lazy: Pages.StatsPage,
                handle: {
                  title: (t: TFunction) =>
                    `Fishoria | ${t('statistics.title')}`,
                  description: (t: TFunction) => t('meta.statistics'),
                },
              },
              {
                path: 'settings',
                lazy: Pages.SettingsPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('settings.title')}`,
                  description: (t: TFunction) => t('meta.settings'),
                },
              },
              {
                path: 'guide',
                lazy: Pages.GuidePage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('guide.title')}`,
                  description: (t: TFunction) => t('meta.guide'),
                },
              },
              {
                path: 'quests',
                lazy: Pages.QuestsPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('quests.title')}`,
                  description: (t: TFunction) => t('meta.quests'),
                },
              },
              {
                path: 'help',
                lazy: Pages.HelpPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('help.title')}`,
                  description: (t: TFunction) => t('meta.help'),
                },
              },
              {
                path: 'news',
                lazy: Pages.NewsPage,
                handle: {
                  title: (t: TFunction) => `Fishoria | ${t('news.title')}`,
                  description: (t: TFunction) => t('meta.news'),
                },
              },
              {
                path: 'achievements',
                lazy: Pages.AchievementsPage,
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
