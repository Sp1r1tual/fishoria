import type { ILakeConfig } from '../../types';

import forestDayImg from '@/assets/locations/01_forest_lake_day.webp';
import forestNightImg from '@/assets/locations/01_forest_lake_night.webp';
import canalDayImg from '@/assets/locations/02_pasture_canal_day.webp';
import canalNightImg from '@/assets/locations/02_pasture_canal_night.webp';
import farmDayImg from '@/assets/locations/03_reservoir_day.webp';
import farmNightImg from '@/assets/locations/03_reservoir_night.webp';
import cityDayImg from '@/assets/locations/04_city_lake_day.webp';
import cityNightImg from '@/assets/locations/04_city_lake_night.webp';
import mountainDayImg from '@/assets/locations/05_mountain_river_day.webp';
import mountainNightImg from '@/assets/locations/05_mountain_river_night.webp';
import seaDayImg from '@/assets/locations/06_black_sea_day.webp';
import seaNightImg from '@/assets/locations/06_black_sea_night.webp';

export const LAKES: ILakeConfig[] = [
  {
    id: 'forest_lake',
    name: 'Forest Lake',
    description:
      'A natural secluded lake surrounded by ancient trees. Uneven depths, rich vegetation, diverse wildlife.',
    backgroundColor: 0x122a1e,
    depthMap: {
      type: 'grid',
      minDepth: 0.5,
      maxDepth: 2.7,
      data: [
        [0.1, 0.1, 0, 0.1, 0, 0.1, 0, 0],
        [0.1, 0.2, 0.3, 0.4, 0.8, 0.3, 0.4, 0.2],
        [0.3, 0.6, 0.8, 0.7, 1.0, 0.7, 0.8, 0.3],
        [0.5, 0.9, 1.0, 0.6, 0.8, 0.7, 1.0, 0.5],
        [0.4, 0.8, 0.9, 0.4, 0.2, 0.5, 0.9, 0.4],
        [0.2, 0.4, 0.6, 0.3, 0.1, 0.3, 0.5, 0.3],
        [0.1, 0.3, 0.4, 0.4, 0.35, 0.4, 0.3, 0.1],
        [0.0, 0.1, 0.2, 0.4, 0.4, 0.35, 0.1, 0.0],
        [0.1, 0.1, 0, 0.1, 0, 0.1, 0, 0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 0.2, max: 2.2 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'pike',
          preferredDepthRange: { min: 0.2, max: 2.5 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.3, max: 1.45 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 1, max: 2.3 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'tench',
          preferredDepthRange: { min: 0.5, max: 1.8 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'ruffe',
          preferredDepthRange: { min: 0.75, max: 2.7 },
          baseCatchChance: 0.03,
        },
        {
          speciesId: 'weatherfish',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.03,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.54 },
        { x: 0.99, y: 0.54 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x1e5c42,

        bgImageUrl: forestDayImg,
      },
      day: {
        waterColor: 0x1e6b8a,

        bgImageUrl: forestDayImg,
      },
      evening: {
        waterColor: 0x1a3a4a,

        bgImageUrl: forestDayImg,
      },
      night: {
        waterColor: 0x0a1a12,

        bgImageUrl: forestNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.55,
      waterRippleScale: 6,
    },
    trashChance: 0.08,
    unlockLevel: 1,
  },
  {
    id: 'pasture_canal',
    name: 'Pasture Canal',
    description:
      'A long irrigation canal passing through lush green pastures. Steady current and steep grassy banks.',
    backgroundColor: 0x1a3a3a,
    depthMap: {
      type: 'grid',
      minDepth: 0.2,
      maxDepth: 2,
      data: [
        [0.0, 0.05, 0.0, 0.05, 0.0, 0.05, 0.0, 0.05],
        [0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25],
        [0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6],
        [0.8, 0.9, 0.8, 0.9, 0.8, 0.9, 0.8, 0.9],
        [1.0, 1.0, 1.0, 0.9, 1.0, 1.0, 1.0, 0.9],
        [1.0, 0.9, 1.0, 1.0, 1.0, 0.9, 1.0, 1.0],
        [0.9, 0.95, 0.9, 0.95, 0.9, 0.95, 0.9, 0.95],
        [0.8, 0.85, 0.8, 0.85, 0.8, 0.85, 0.8, 0.85],
        [0.7, 0.75, 0.7, 0.75, 0.7, 0.75, 0.7, 0.75],
        [0.6, 0.65, 0.6, 0.65, 0.6, 0.65, 0.6, 0.65],
        [0.5, 0.55, 0.5, 0.55, 0.5, 0.55, 0.5, 0.55],
        [0.4, 0.45, 0.4, 0.45, 0.4, 0.45, 0.4, 0.45],
        [0.3, 0.35, 0.3, 0.35, 0.3, 0.35, 0.3, 0.35],
        [0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25],
        [0.1, 0.15, 0.1, 0.15, 0.1, 0.15, 0.1, 0.15],
        [0.0, 0.05, 0.0, 0.05, 0.0, 0.05, 0.0, 0.05],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'asp',
          preferredDepthRange: { min: 0.4, max: 1.2 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 0.8, max: 2.0 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'american_catfish',
          preferredDepthRange: { min: 0.5, max: 2.0 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'eel',
          preferredDepthRange: { min: 1.0, max: 2.0 },
          baseCatchChance: 0.017,
        },
        {
          speciesId: 'gudgeon',
          preferredDepthRange: { min: 0.2, max: 1.0 },
          baseCatchChance: 0.03,
        },
        {
          speciesId: 'crayfish',
          preferredDepthRange: { min: 0.2, max: 1.2 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'pike',
          preferredDepthRange: { min: 0.4, max: 1.8 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 0.3, max: 1.5 },
          baseCatchChance: 0.045,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.3, max: 1.2 },
          baseCatchChance: 0.049,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.045,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.59 },
        { x: 0.99, y: 0.6 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x2a5a5a,
        bgImageUrl: canalDayImg,
      },
      day: {
        waterColor: 0x2e6b6b,
        bgImageUrl: canalDayImg,
      },
      evening: {
        waterColor: 0x1a3a3a,
        bgImageUrl: canalDayImg,
      },
      night: {
        waterColor: 0x0a1a1a,
        bgImageUrl: canalNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.48,
      waterRippleScale: 6,
    },
    trashChance: 0.05,
    unlockLevel: 2,
  },
  {
    id: 'fish_farm',
    name: 'Fish Farm Reservoir',
    description:
      'An artificial reservoir managed for fish farming. Flat bottom, clear water, high fish density.',
    backgroundColor: 0x0d2e4a,
    depthMap: {
      type: 'grid',
      minDepth: 0.3,
      maxDepth: 4.0,
      data: [
        [0.3, 0.4, 0.7, 1.0, 1.0, 0.7, 0.4, 0.3],
        [0.25, 0.6, 0.85, 1.0, 1.0, 0.85, 0.45, 0.25],
        [0.2, 0.4, 0.8, 1.0, 1.0, 0.8, 0.65, 0.2],
        [0.15, 0.55, 0.7, 0.95, 1.0, 0.7, 0.4, 0.15],
        [0.1, 0.3, 0.5, 0.8, 0.85, 0.5, 0.55, 0.1],
        [0.08, 0.45, 0.3, 0.5, 0.55, 0.3, 0.3, 0.08],
        [0.08, 0.1, 0.15, 0.2, 0.25, 0.15, 0.1, 0.08],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'carp',
          preferredDepthRange: { min: 2.2, max: 4.0 },
          baseCatchChance: 0.049,
        },
        {
          speciesId: 'grass_carp',
          preferredDepthRange: { min: 1.0, max: 2.5 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.045,
        },
        {
          speciesId: 'zander',
          preferredDepthRange: { min: 2, max: 4.0 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'catfish',
          preferredDepthRange: { min: 3, max: 4.0 },
          baseCatchChance: 0.026,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.5, max: 2 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 1, max: 3 },
          baseCatchChance: 0.045,
        },
        {
          speciesId: 'silver_carp',
          preferredDepthRange: { min: 0.5, max: 2.5 },
          baseCatchChance: 0.036,
        },
        {
          speciesId: 'crayfish',
          preferredDepthRange: { min: 0.5, max: 3.5 },
          baseCatchChance: 0.017,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 2.5, max: 4.0 },
          baseCatchChance: 0.034,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.52 },
        { x: 0.25, y: 0.49 },
        { x: 0.5, y: 0.475 },
        { x: 0.75, y: 0.49 },
        { x: 0.99, y: 0.52 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x1a5a7a,

        bgImageUrl: farmDayImg,
      },
      day: {
        waterColor: 0x1e7fb0,

        bgImageUrl: farmDayImg,
      },
      evening: {
        waterColor: 0x124560,

        bgImageUrl: farmDayImg,
      },
      night: {
        waterColor: 0x071828,

        bgImageUrl: farmNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.46,
      waterRippleScale: 6,
    },
    trashChance: 0.02,
    unlockLevel: 2,
  },
  {
    id: 'city_lake',
    name: 'City Lake',
    description:
      'A scenic urban lake located in the heart of a bustling city park. Home to various fish species accustomed to the city noise.',
    backgroundColor: 0x1f3c3d,
    depthMap: {
      type: 'grid',
      minDepth: 1.0,
      maxDepth: 3.5,
      data: [
        [0.6, 0.65, 0.5, 0.45, 0.45, 0.5, 0.6, 0.65],
        [0.85, 0.85, 0.8, 0.7, 0.7, 0.75, 0.85, 0.85],
        [0.9, 0.9, 0.9, 1, 1.0, 0.9, 1.0, 1.0],
        [1.0, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 0.95, 1.0, 1.0, 0.7, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0, 1.0, 0.85, 0.95, 1.0],
        [1.0, 0.9, 0.8, 1.0, 1.0, 1.0, 0.9, 0.9],
        [0.9, 0.9, 0.8, 1.0, 1.0, 1.0, 1.0, 0.9],
        [0.9, 1.0, 0.9, 1.0, 1.0, 0.9, 1.0, 0.9],
        [0.9, 0.9, 1.0, 1.0, 0.9, 0.9, 1.0, 0.9],
        [0.85, 0.85, 0.85, 0.85, 0.85, 1.0, 0.85, 0.85],
        [0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
        [0.6, 0.7, 0.7, 0.5, 0.45, 0.5, 0.7, 0.7],
        [0.4, 0.5, 0.5, 0.3, 0.25, 0.3, 0.5, 0.5],
        [0.2, 0.3, 0.3, 0.1, 0.05, 0.1, 0.3, 0.3],
        [0.0, 0.1, 0.1, 0.0, 0.0, 0.0, 0.1, 0.1],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 0.5, max: 2.5 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.8, max: 2.0 },
          baseCatchChance: 0.04,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 1.0, max: 2.8 },
          baseCatchChance: 0.045,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 1.2, max: 3.2 },
          baseCatchChance: 0.03,
        },
        {
          speciesId: 'carp',
          preferredDepthRange: { min: 1.5, max: 3.5 },
          baseCatchChance: 0.032,
        },
        {
          speciesId: 'tench',
          preferredDepthRange: { min: 1.0, max: 2.5 },
          baseCatchChance: 0.025,
        },
        {
          speciesId: 'silver_carp',
          preferredDepthRange: { min: 1.5, max: 3.5 },
          baseCatchChance: 0.028,
        },
        {
          speciesId: 'rotan',
          preferredDepthRange: { min: 0.8, max: 1.8 },
          baseCatchChance: 0.042,
        },
        {
          speciesId: 'chub',
          preferredDepthRange: { min: 0.8, max: 2.0 },
          baseCatchChance: 0.03,
        },
        {
          speciesId: 'pond_turtle',
          preferredDepthRange: { min: 0.8, max: 2.2 },
          baseCatchChance: 0.015,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.56 },
        { x: 0.99, y: 0.56 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x1f5c6a,
        bgImageUrl: cityDayImg,
      },
      day: {
        waterColor: 0x226b80,
        bgImageUrl: cityDayImg,
      },
      evening: {
        waterColor: 0x184252,
        bgImageUrl: cityDayImg,
      },
      night: {
        waterColor: 0x081520,
        bgImageUrl: cityNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.55,
      waterRippleScale: 6,
    },
    trashChance: 0.12,
    unlockLevel: 3,
  },
  {
    id: 'mountain_river',
    name: 'Mountain River',
    description:
      'A crystal clear, fast-flowing mountain river. Its deep pools hidden behind massive boulders are home to cautious and energetic fish.',
    backgroundColor: 0x102f4a,
    depthMap: {
      type: 'grid',
      minDepth: 0.4,
      maxDepth: 3.2,
      data: [
        [0.1, 0.2, 0.35, 0.5, 1.0, 0.35, 0.2, 0.1],
        [0.2, 0.4, 0.6, 0.75, 1.0, 0.6, 0.4, 0.2],
        [0.25, 0.55, 0.8, 0.85, 1.0, 0.75, 0.5, 0.25],
        [0.3, 0.6, 0.9, 1.0, 1.0, 0.8, 0.55, 0.3],
        [0.3, 0.55, 0.85, 1.0, 1.0, 0.85, 0.55, 0.3],
        [0.2, 0.3, 0.55, 1.0, 0.9, 0.8, 0.5, 0.2],
        [0.15, 0.35, 0.7, 1.0, 1.0, 0.95, 0.55, 0.15],
        [0.1, 0.25, 1.0, 1.0, 1.0, 0.95, 0.6, 0.1],
        [0.05, 0.15, 0.9, 0.9, 1.0, 0.9, 0.6, 0.05],
        [0.05, 0.1, 0.6, 0.7, 0.7, 0.75, 0.45, 0.05],
        [0.0, 0.05, 0.3, 0.45, 0.5, 0.45, 0.2, 0.0],
        [0.0, 0.0, 0.05, 0.15, 0.2, 0.15, 0.05, 0.0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'asp',
          preferredDepthRange: { min: 0.4, max: 1.8 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'weatherfish',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.03,
        },
        {
          speciesId: 'brown_trout',
          preferredDepthRange: { min: 0.4, max: 2.0 },
          baseCatchChance: 0.04,
        },
        {
          speciesId: 'grayling',
          preferredDepthRange: { min: 0.4, max: 1.5 },
          baseCatchChance: 0.032,
        },
        {
          speciesId: 'barbel',
          preferredDepthRange: { min: 1.0, max: 3.0 },
          baseCatchChance: 0.026,
        },
        {
          speciesId: 'danube_salmon',
          preferredDepthRange: { min: 1.2, max: 3.0 },
          baseCatchChance: 0.012,
        },
        {
          speciesId: 'pike',
          preferredDepthRange: { min: 0.6, max: 2.2 },
          baseCatchChance: 0.024,
        },
        {
          speciesId: 'catfish',
          preferredDepthRange: { min: 1.5, max: 3.0 },
          baseCatchChance: 0.015,
        },
        {
          speciesId: 'gudgeon',
          preferredDepthRange: { min: 0.4, max: 1.2 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 1.2, max: 2.8 },
          baseCatchChance: 0.028,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.57 },
        { x: 0.2, y: 0.52 },
        { x: 0.4, y: 0.49 },
        { x: 0.6, y: 0.48 },
        { x: 0.8, y: 0.5 },
        { x: 0.99, y: 0.55 },
        { x: 0.99, y: 1.0 },
        { x: 0.24, y: 1.0 },
        { x: 0.15, y: 0.91 },
        { x: 0.13, y: 0.86 },
        { x: 0.08, y: 0.83 },
        { x: 0.01, y: 0.82 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x1c4d6b,
        bgImageUrl: mountainDayImg,
      },
      day: {
        waterColor: 0x225c80,
        bgImageUrl: mountainDayImg,
      },
      evening: {
        waterColor: 0x143c57,
        bgImageUrl: mountainDayImg,
      },
      night: {
        waterColor: 0x051a2e,
        bgImageUrl: mountainNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.52,
      waterRippleScale: 7,
    },
    trashChance: 0.04,
    unlockLevel: 4,
  },
  {
    id: 'black_sea',
    name: 'Black Sea',
    description:
      'A vast saltwater expance. Extremely deep water, powerful waves, and a home to unique and strong marine giants.',
    backgroundColor: 0x091c30,
    depthMap: {
      type: 'grid',
      minDepth: 2.0,
      maxDepth: 12.0,
      data: [
        [1.0, 1.0, 1.0, 0.85, 0.75, 0.6, 0.35, 0.05],
        [1.0, 1.0, 1.0, 0.95, 0.85, 0.65, 0.4, 0.08],
        [1.0, 1.0, 1.0, 0.95, 0.85, 0.7, 0.45, 0.12],
        [1.0, 1.0, 1.0, 0.9, 0.8, 0.65, 0.45, 0.15],
        [0.85, 0.9, 0.9, 0.85, 0.75, 0.6, 0.4, 0.18],
        [0.75, 0.8, 0.8, 0.75, 0.65, 0.55, 0.35, 0.2],
        [0.6, 0.65, 0.65, 0.6, 0.55, 0.45, 0.3, 0.22],
        [0.45, 0.5, 0.5, 0.45, 0.4, 0.35, 0.25, 0.22],
        [0.3, 0.35, 0.35, 0.3, 0.25, 0.22, 0.18, 0.15],
        [0.15, 0.2, 0.2, 0.18, 0.15, 0.12, 0.1, 0.08],
        [0.05, 0.08, 0.08, 0.05, 0.05, 0.02, 0.01, 0.0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'zander',
          preferredDepthRange: { min: 3.0, max: 9.0 },
          baseCatchChance: 0.032,
        },
        {
          speciesId: 'eel',
          preferredDepthRange: { min: 3.0, max: 10.0 },
          baseCatchChance: 0.025,
        },
        {
          speciesId: 'spiny_dogfish',
          preferredDepthRange: { min: 6.0, max: 12.0 },
          baseCatchChance: 0.015,
        },
        {
          speciesId: 'turbot',
          preferredDepthRange: { min: 5.0, max: 12.0 },
          baseCatchChance: 0.02,
        },
        {
          speciesId: 'red_mullet',
          preferredDepthRange: { min: 2.0, max: 6.0 },
          baseCatchChance: 0.045,
        },
        {
          speciesId: 'garfish',
          preferredDepthRange: { min: 2.0, max: 5.0 },
          baseCatchChance: 0.032,
        },
        {
          speciesId: 'goby',
          preferredDepthRange: { min: 3.0, max: 12.0 },
          baseCatchChance: 0.06,
        },
        {
          speciesId: 'annular_seabream',
          preferredDepthRange: { min: 2.0, max: 7.0 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'horse_mackerel',
          preferredDepthRange: { min: 2.0, max: 8.0 },
          baseCatchChance: 0.055,
        },
        {
          speciesId: 'mullet',
          preferredDepthRange: { min: 2.0, max: 6.0 },
          baseCatchChance: 0.035,
        },
        {
          speciesId: 'beluga',
          preferredDepthRange: { min: 6.0, max: 12.0 },
          baseCatchChance: 0.006,
        },
        {
          speciesId: 'bonito',
          preferredDepthRange: { min: 2.0, max: 8.0 },
          baseCatchChance: 0.012,
        },
        {
          speciesId: 'hake',
          preferredDepthRange: { min: 4.0, max: 12.0 },
          baseCatchChance: 0.024,
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.53 },
        { x: 0.7, y: 0.53 },
        { x: 0.8, y: 0.54 },
        { x: 0.9, y: 0.555 },
        { x: 0.99, y: 0.57 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        waterColor: 0x0f3652,
        bgImageUrl: seaDayImg,
      },
      day: {
        waterColor: 0x124263,
        bgImageUrl: seaDayImg,
      },
      evening: {
        waterColor: 0x0a2d45,
        bgImageUrl: seaDayImg,
      },
      night: {
        waterColor: 0x031524,
        bgImageUrl: seaNightImg,
      },
    },
    environment: {
      waterBoundaryY: 0.5,
      waterRippleScale: 8,
    },
    trashChance: 0.06,
    unlockLevel: 7,
  },
];

export const getLakeById = (id: string): ILakeConfig | undefined =>
  LAKES.find((l) => l.id === id);
