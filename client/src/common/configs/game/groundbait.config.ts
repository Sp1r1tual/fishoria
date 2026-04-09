import type { IGroundbaitConfig } from '../../types';

import vanillinIcon from '@/assets/ui/vanillin_mix.webp';
import peasIcon from '@/assets/ui/crushed_peas.webp';
import bloodIcon from '@/assets/ui/dried_blood.webp';

export const GROUNDBAITS: Record<string, IGroundbaitConfig> = {
  vanillin: {
    id: 'vanillin',
    name: 'Vanillin Mix',
    description:
      'Sweet aroma that quickly attracts small schooling fish like roach and crucian.',
    price: 45,
    icon: vanillinIcon,
    attractionRadiusScale: 4,
    fishedSpeciesMultiplier: { roach: 1.6, crucian: 1.6, ruffe: 1.2 },
  },

  peas: {
    id: 'peas',
    name: 'Crushed Peas',
    description:
      'Heavy mix that stays on the bottom. Excellent for carp and grass carp.',
    price: 99,
    icon: peasIcon,
    attractionRadiusScale: 4,
    fishedSpeciesMultiplier: { carp: 1.8, grass_carp: 1.7, crucian: 1.2 },
  },

  dried_blood: {
    id: 'dried_blood',
    name: 'Dried Blood',
    description:
      'Strong trailing scent. Drives predators like perch, pike, and catfish crazy.',
    price: 150,
    icon: bloodIcon,
    attractionRadiusScale: 4,
    fishedSpeciesMultiplier: {
      perch: 1.3,
      catfish: 1.2,
      zander: 1.4,
    },
  },
};

export const GROUNDBAIT_IDS = Object.keys(GROUNDBAITS);
