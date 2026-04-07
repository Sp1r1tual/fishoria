import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

const setMetaDescription = (content: string) => {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export const TitleManager = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  useEffect(() => {
    const path = location.pathname;

    interface RouteConfig {
      title: string;
      description: string;
    }

    const routeMap: Record<string, RouteConfig> = {
      '/welcome': {
        title: t('landing.title'),
        description:
          'Join Fishoria — a free browser fishing simulator. Cast your line, catch rare fish and upgrade your gear.',
      },
      '/privacy': {
        title: `Fishoria | ${t('privacy.title')}`,
        description:
          'Read the Fishoria Privacy Policy to understand how we handle your personal data.',
      },
      '/terms': {
        title: `Fishoria | ${t('terms.title')}`,
        description: 'Review the Fishoria Terms of Service before playing.',
      },
      '/reset-password': {
        title: `Fishoria | ${t('landing.resetPassword.title')}`,
        description: 'Reset your Fishoria account password securely.',
      },
      '/': {
        title: `Fishoria`,
        description:
          'Welcome back, angler! Select a lake and start fishing in Fishoria.',
      },
      '/marketplace': {
        title: `Fishoria | ${t('shop.title')}`,
        description:
          'Browse the Fishoria marketplace. Buy rods, lures, and upgrades to improve your fishing.',
      },
      '/keepnet': {
        title: `Fishoria | ${t('inventory.title')}`,
        description: 'View your caught fish and inventory in Fishoria.',
      },
      '/equipment': {
        title: `Fishoria | ${t('gear.title')}`,
        description: 'Manage your fishing rods, reels and tackle in Fishoria.',
      },
      '/statistics': {
        title: `Fishoria | ${t('statistics.title')}`,
        description:
          'Track your fishing statistics, catch records and progression in Fishoria.',
      },
      '/settings': {
        title: `Fishoria | ${t('settings.title')}`,
        description:
          'Configure your Fishoria game settings, language and audio preferences.',
      },
      '/guide': {
        title: `Fishoria | ${t('guide.title')}`,
        description:
          'Learn how to fish in Fishoria with our complete beginner and advanced guides.',
      },
      '/quests': {
        title: `Fishoria | ${t('quests.title')}`,
        description: 'Complete fishing quests and earn rewards in Fishoria.',
      },
      '/help': {
        title: `Fishoria | ${t('help.title')}`,
        description:
          'Get help and support for Fishoria. Find answers to common questions.',
      },
      '/news': {
        title: `Fishoria | ${t('news.title')}`,
        description: 'Latest news, updates and patch notes for Fishoria.',
      },
      '/achievements': {
        title: `Fishoria | ${t('achievements.title')}`,
        description:
          'View your unlocked achievements and milestones in Fishoria.',
      },
    };

    const config = routeMap[path];
    document.title = config?.title ?? 'Fishoria';
    setMetaDescription(
      config?.description ??
        'Fishoria is a free browser-based fishing simulator. Catch fish, upgrade gear and compete with anglers worldwide.',
    );
  }, [location.pathname, t, i18n.language]);

  return null;
};
