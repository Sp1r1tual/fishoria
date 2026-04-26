import type { TFunction } from 'i18next';

import keepnetIcon from '@/assets/ui/keepnet.webp';
import equipmentIcon from '@/assets/ui/equipment.webp';
import shopIcon from '@/assets/ui/shop.webp';
import settingsIcon from '@/assets/ui/settings.webp';
import statisticsIcon from '@/assets/ui/statistics.webp';
import guideIcon from '@/assets/ui/guide.webp';
import questsIcon from '@/assets/ui/quests.webp';
import helpIcon from '@/assets/ui/help.webp';
import achievementsIcon from '@/assets/ui/achievements.webp';

export const getMenuActions = (t: TFunction) => [
  {
    id: 'btn-inventory',
    icon: keepnetIcon,
    label: t('mainMenu.keepnet'),
    path: '/keepnet',
  },
  {
    id: 'btn-gear',
    icon: equipmentIcon,
    label: t('mainMenu.equipment'),
    path: '/equipment',
  },
  {
    id: 'btn-shop',
    icon: shopIcon,
    label: t('mainMenu.shop'),
    path: '/marketplace',
  },
  {
    id: 'btn-stats',
    icon: statisticsIcon,
    label: t('mainMenu.statistics'),
    path: '/statistics',
  },
  {
    id: 'btn-quests',
    icon: questsIcon,
    label: t('mainMenu.quests'),
    path: '/quests',
  },
  {
    id: 'btn-achievements',
    icon: achievementsIcon,
    label: t('mainMenu.achievements', 'Achievements'),
    path: '/achievements',
  },
  {
    id: 'btn-guide',
    icon: guideIcon,
    label: t('mainMenu.guide'),
    path: '/guide',
  },
  {
    id: 'btn-help',
    icon: helpIcon,
    label: t('mainMenu.help'),
    path: '/help',
  },
  {
    id: 'btn-settings',
    icon: settingsIcon,
    label: t('mainMenu.settings'),
    path: '/settings',
  },
];
