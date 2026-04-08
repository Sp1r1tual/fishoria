import type { ILakeConfig } from '../../types';

import forestDayImg from '@/assets/locations/01_forest_lake_day.webp';
import forestNightImg from '@/assets/locations/01_forest_lake_night.webp';
import farmDayImg from '@/assets/locations/02_reservoir_day.webp';
import farmNightImg from '@/assets/locations/02_reservoir_night.webp';

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
      spawnRatePerSecond: 0.4,
      maxFishCount: 70,
      species: [
        {
          speciesId: 'crucian',
          weight: 37, // ~37% (Predominant in such lakes)
          preferredDepthRange: { min: 1, max: 2.3 },
        },
        {
          speciesId: 'roach',
          weight: 33,
          preferredDepthRange: { min: 0.3, max: 1.45 },
        },
        {
          speciesId: 'perch',
          weight: 15,
          preferredDepthRange: { min: 0.2, max: 2.2 },
        },
        {
          speciesId: 'pike',
          weight: 17,
          preferredDepthRange: { min: 0.2, max: 2.5 },
        },
        {
          speciesId: 'ruffle',
          weight: 8,
          preferredDepthRange: { min: 0.75, max: 2.7 },
        },
      ],
    },
    allowedCastArea: {
      type: 'polygon',
      points: [
        { x: 0.01, y: 0.55 },
        { x: 0.99, y: 0.55 },
        { x: 0.99, y: 1.0 },
        { x: 0.01, y: 1.0 },
      ],
    },
    obstacles: [],
    timeOfDayConfig: {
      morning: {
        ambientLight: 0.75,
        fishActivityMultiplier: 0.9,
        waterColor: 0x1e5c42,
        skyColor: 0xffa07a,
        bgImageUrl: forestDayImg,
      },
      day: {
        ambientLight: 1.0,
        fishActivityMultiplier: 0.6,
        waterColor: 0x1e6b8a,
        skyColor: 0x87ceeb,
        bgImageUrl: forestDayImg,
      },
      evening: {
        ambientLight: 0.6,
        fishActivityMultiplier: 0.85,
        waterColor: 0x1a3a4a,
        skyColor: 0xff6347,
        bgImageUrl: forestDayImg,
      },
      night: {
        ambientLight: 0.25,
        fishActivityMultiplier: 0.7,
        waterColor: 0x0a1a12,
        skyColor: 0x070720,
        bgImageUrl: forestNightImg,
      },
    },
    environment: {
      visibility: 0.65,
      waterBoundaryY: 0.55,
    },
    trashChance: 0.08,
    unlockLevel: 1,
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
      spawnRatePerSecond: 0.45,
      maxFishCount: 90,
      species: [
        {
          speciesId: 'carp',
          weight: 30,
          preferredDepthRange: { min: 2.2, max: 4.0 },
        },
        {
          speciesId: 'grass_carp',
          weight: 18,
          preferredDepthRange: { min: 1.0, max: 2.5 },
        },
        {
          speciesId: 'crucian',
          weight: 12,
          preferredDepthRange: { min: 0.5, max: 1.5 },
        },
        {
          speciesId: 'zander',
          weight: 11,
          preferredDepthRange: { min: 2, max: 4.0 },
        },
        {
          speciesId: 'catfish',
          weight: 7,
          preferredDepthRange: { min: 3, max: 4.0 },
        },
        {
          speciesId: 'roach',
          weight: 10,
          preferredDepthRange: { min: 0.5, max: 2 },
        },
        {
          speciesId: 'perch',
          weight: 12,
          preferredDepthRange: { min: 1, max: 3 },
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
        ambientLight: 0.8,
        fishActivityMultiplier: 0.85,
        waterColor: 0x1a5a7a,
        skyColor: 0xffc87c,
        bgImageUrl: farmDayImg,
      },
      day: {
        ambientLight: 1.0,
        fishActivityMultiplier: 0.7,
        waterColor: 0x1e7fb0,
        skyColor: 0x6db5e8,
        bgImageUrl: farmDayImg,
      },
      evening: {
        ambientLight: 0.65,
        fishActivityMultiplier: 0.9,
        waterColor: 0x124560,
        skyColor: 0xff8c65,
        bgImageUrl: farmDayImg,
      },
      night: {
        ambientLight: 0.3,
        fishActivityMultiplier: 0.5,
        waterColor: 0x071828,
        skyColor: 0x050520,
        bgImageUrl: farmNightImg,
      },
    },
    environment: {
      visibility: 0.9,
      waterBoundaryY: 0.46,
    },
    trashChance: 0.02,
    unlockLevel: 1,
  },
];

export const getLakeById = (id: string): ILakeConfig | undefined =>
  LAKES.find((l) => l.id === id);
