import type { ILakeConfig } from '../../types';

import forestDayImg from '@/assets/locations/01_forest_lake_day.webp';
import forestNightImg from '@/assets/locations/01_forest_lake_night.webp';
import canalDayImg from '@/assets/locations/02_pasture_canal_day.webp';
import canalNightImg from '@/assets/locations/02_pasture_canal_night.webp';
import farmDayImg from '@/assets/locations/03_reservoir_day.webp';
import farmNightImg from '@/assets/locations/03_reservoir_night.webp';

//! The configuration allows you to override the weight range for fish using the property weightRange: { min: 0.1, max: 10 },

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
        [0.1, 0.2, 0.3, 0.4, 0.8, 0.3, 0.4, 0.2],
        [0.3, 0.6, 0.8, 0.7, 1.0, 0.7, 0.8, 0.3],
        [0.5, 0.9, 1.0, 0.6, 0.8, 0.7, 1.0, 0.5],
        [0.4, 0.8, 0.9, 0.4, 0.2, 0.5, 0.9, 0.4],
        [0.2, 0.4, 0.6, 0.3, 0.1, 0.3, 0.5, 0.3],
        [0.1, 0.3, 0.4, 0.4, 0.35, 0.4, 0.3, 0.1],
        [0.0, 0.1, 0.2, 0.4, 0.4, 0.35, 0.1, 0.0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 0.2, max: 2.2 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'pike',
          preferredDepthRange: { min: 0.2, max: 2.5 },
          baseCatchChance: 0.0238,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.3, max: 1.45 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 1, max: 2.3 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'tench',
          preferredDepthRange: { min: 0.5, max: 1.8 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'ruffe',
          preferredDepthRange: { min: 0.75, max: 2.7 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'weatherfish',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.038,
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
        [0.0, 0.1, 0.05, 0.1, 0.0, 0.0, 0.1, 0.05],
        [0.3, 0.5, 0.4, 0.6, 0.3, 0.4, 0.6, 0.5],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        [0.3, 0.5, 0.4, 0.6, 0.3, 0.4, 0.6, 0.5],
        [0.1, 0.0, 0.1, 0.05, 0.1, 0.0, 0.1, 0.0],
      ],
    },
    fishSpawns: {
      species: [
        {
          speciesId: 'asp',
          preferredDepthRange: { min: 0.4, max: 1.2 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 0.8, max: 2.0 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'american_catfish',
          preferredDepthRange: { min: 0.5, max: 2.0 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'eel',
          preferredDepthRange: { min: 1.0, max: 2.0 },
          baseCatchChance: 0.0142,
        },
        {
          speciesId: 'gudgeon',
          preferredDepthRange: { min: 0.2, max: 1.0 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'crayfish',
          preferredDepthRange: { min: 0.2, max: 1.2 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'pike',
          preferredDepthRange: { min: 0.4, max: 1.8 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 0.3, max: 1.5 },
          baseCatchChance: 0.0714,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.3, max: 1.2 },
          baseCatchChance: 0.0856,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.0714,
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
          baseCatchChance: 0.0856,
        },
        {
          speciesId: 'grass_carp',
          preferredDepthRange: { min: 1.0, max: 2.5 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'crucian',
          preferredDepthRange: { min: 0.5, max: 1.5 },
          baseCatchChance: 0.0714,
        },
        {
          speciesId: 'zander',
          preferredDepthRange: { min: 2, max: 4.0 },
          baseCatchChance: 0.0286,
        },
        {
          speciesId: 'catfish',
          preferredDepthRange: { min: 3, max: 4.0 },
          baseCatchChance: 0.0238,
        },
        {
          speciesId: 'roach',
          preferredDepthRange: { min: 0.5, max: 2 },
          baseCatchChance: 0.0572,
        },
        {
          speciesId: 'perch',
          preferredDepthRange: { min: 1, max: 3 },
          baseCatchChance: 0.0714,
        },
        {
          speciesId: 'silver_carp',
          preferredDepthRange: { min: 0.5, max: 2.5 },
          baseCatchChance: 0.038,
        },
        {
          speciesId: 'crayfish',
          preferredDepthRange: { min: 0.5, max: 3.5 },
          baseCatchChance: 0.0142,
        },
        {
          speciesId: 'bream',
          preferredDepthRange: { min: 2.5, max: 4.0 },
          baseCatchChance: 0.0476,
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
    },
    trashChance: 0.02,
    unlockLevel: 2,
  },
];

export const getLakeById = (id: string): ILakeConfig | undefined =>
  LAKES.find((l) => l.id === id);
