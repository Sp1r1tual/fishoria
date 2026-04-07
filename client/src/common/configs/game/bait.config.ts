import type { IBaitConfig } from '../../types';

import wormIcon from '@/assets/ui/worm.webp';
import maggotIcon from '@/assets/ui/maggot.webp';
import breadIcon from '@/assets/ui/bread.webp';
import cornIcon from '@/assets/ui/corn.webp';
import doughIcon from '@/assets/ui/dough.webp';
import liveBaitIcon from '@/assets/ui/live_bait.webp';

export const BAIT_IDS = [
  'worm',
  'maggot',
  'bread',
  'corn',
  'dough',
  'live_bait',
] as const;

export const BAITS: Record<string, IBaitConfig> = {
  worm: {
    id: 'worm',
    name: 'Worm',
    description: 'Classic and reliable. Good for many fish.',
    price: 2,
    icon: wormIcon,
  },
  maggot: {
    id: 'maggot',
    name: 'Maggots',
    description: 'Excellent for roach and small fish.',
    price: 3,
    icon: maggotIcon,
  },
  bread: {
    id: 'bread',
    name: 'Bread',
    description: 'Simple bait for crucian and carp.',
    price: 1,
    icon: breadIcon,
  },
  corn: {
    id: 'corn',
    name: 'Sweetcorn',
    description: 'Attracts larger carp and grass carp.',
    price: 7,
    icon: cornIcon,
  },
  dough: {
    id: 'dough',
    name: 'Dough Ball',
    description: 'Soft bait, fish love to nibble it.',
    price: 3,
    icon: doughIcon,
  },
  live_bait: {
    id: 'live_bait',
    name: 'Live Bait',
    description: 'Small fish, attracts predators like pike.',
    price: 20,
    icon: liveBaitIcon,
  },
};
