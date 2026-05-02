import { lazy } from 'react';

export const LandingPage = lazy(() =>
  import('./LandingPage').then((m) => ({ default: m.LandingPage })),
);
export const ShopPage = lazy(() =>
  import('./ShopPage').then((m) => ({ default: m.ShopPage })),
);
export const InventoryPage = lazy(() =>
  import('./InventoryPage').then((m) => ({ default: m.InventoryPage })),
);
export const GearPage = lazy(() =>
  import('./GearPage').then((m) => ({ default: m.GearPage })),
);
export const StatsPage = lazy(() =>
  import('./StatsPage').then((m) => ({ default: m.StatsPage })),
);
export const SettingsPage = lazy(() =>
  import('./SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
export const GuidePage = lazy(() =>
  import('./GuidePage').then((m) => ({ default: m.GuidePage })),
);
export const QuestsPage = lazy(() =>
  import('./QuestsPage').then((m) => ({ default: m.QuestsPage })),
);
export const HelpPage = lazy(() =>
  import('./HelpPage').then((m) => ({ default: m.HelpPage })),
);
export const NewsPage = lazy(() =>
  import('./NewsPage').then((m) => ({ default: m.NewsPage })),
);
export const ResetPasswordPage = lazy(() =>
  import('./ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
export const AchievementsPage = lazy(() =>
  import('./AchievementsPage').then((m) => ({
    default: m.AchievementsPage,
  })),
);
export const PrivacyPage = lazy(() =>
  import('./PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
export const TermsPage = lazy(() =>
  import('./TermsPage').then((m) => ({ default: m.TermsPage })),
);
export const ServerUnavailablePage = lazy(() =>
  import('./ServerUnavailablePage').then((m) => ({
    default: m.ServerUnavailablePage,
  })),
);
