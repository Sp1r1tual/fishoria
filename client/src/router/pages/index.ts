export const LandingPage = () =>
  import('./LandingPage').then((m) => ({ Component: m.LandingPage }));

export const ShopPage = () =>
  import('./ShopPage').then((m) => ({ Component: m.ShopPage }));

export const InventoryPage = () =>
  import('./InventoryPage').then((m) => ({ Component: m.InventoryPage }));

export const GearPage = () =>
  import('./GearPage').then((m) => ({ Component: m.GearPage }));

export const StatsPage = () =>
  import('./StatsPage').then((m) => ({ Component: m.StatsPage }));

export const SettingsPage = () =>
  import('./SettingsPage').then((m) => ({ Component: m.SettingsPage }));

export const GuidePage = () =>
  import('./GuidePage').then((m) => ({ Component: m.GuidePage }));

export const QuestsPage = () =>
  import('./QuestsPage').then((m) => ({ Component: m.QuestsPage }));

export const HelpPage = () =>
  import('./HelpPage').then((m) => ({ Component: m.HelpPage }));

export const NewsPage = () =>
  import('./NewsPage').then((m) => ({ Component: m.NewsPage }));

export const ResetPasswordPage = () =>
  import('./ResetPasswordPage').then((m) => ({
    Component: m.ResetPasswordPage,
  }));

export const AchievementsPage = () =>
  import('./AchievementsPage').then((m) => ({
    Component: m.AchievementsPage,
  }));

export const PrivacyPage = () =>
  import('./PrivacyPage').then((m) => ({ Component: m.PrivacyPage }));

export const TermsPage = () =>
  import('./TermsPage').then((m) => ({ Component: m.TermsPage }));

export const ServerUnavailablePage = () =>
  import('./ServerUnavailablePage').then((m) => ({
    Component: m.ServerUnavailablePage,
  }));

export const GamePage = () =>
  import('@/components/GameScreen/GameScreen').then((m) => ({
    Component: m.GameScreen,
  }));
