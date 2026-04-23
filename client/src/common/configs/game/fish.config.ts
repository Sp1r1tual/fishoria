import type { IFishSpeciesConfig } from '../../types';

import perchImg from '@/assets/fish/perch.webp';
import pikeImg from '@/assets/fish/pike.webp';
import carpImg from '@/assets/fish/carp.webp';
import crucianImg from '@/assets/fish/crucian.webp';
import roachImg from '@/assets/fish/roach.webp';
import zanderImg from '@/assets/fish/zander.webp';
import ruffeImg from '@/assets/fish/ruffe.webp';
import catfishImg from '@/assets/fish/catfish.webp';
import grassCarpImg from '@/assets/fish/grass_carp.webp';

export const FISH_SPECIES: Record<string, IFishSpeciesConfig> = {
  perch: {
    id: 'perch',
    name: 'Perch',
    description:
      'A feisty predator with striking striped markings. Common near submerged vegetation.',
    weightRange: { min: 0.12, max: 2 },
    activityByTimeOfDay: { morning: 0.9, day: 0.7, evening: 0.8, night: 0.1 },
    activityByWeather: { clear: 0.8, cloudy: 1.0, rain: 1.1 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'dried_blood',
    baseCatchChance: 0.25,
    behavior: {
      aggression: 0.7,
      curiosity: 0.8,
      fear: 0.4,
      mobility: 0.8,
    },
    color: 0xf4a261,
    imageUrl: perchImg,
    isPredator: true,
    priceMultiplier: 1.1,
    lureMultipliers: {
      vibrotail: 1.3,
      spoon: 0.9,
      wobbler: 0.05,
    },
  },
  pike: {
    id: 'pike',
    name: 'Pike',
    description:
      'Apex freshwater predator. Prefers ambush hunting in deeper, cooler water.',
    weightRange: { min: 0.5, max: 10 },
    activityByTimeOfDay: {
      morning: 0.95,
      day: 0.5,
      evening: 0.85,
      night: 0.15,
    },
    activityByWeather: { clear: 0.8, cloudy: 1.1, rain: 1.2 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',
    baseCatchChance: 0.12,
    behavior: {
      aggression: 0.95,
      curiosity: 0.5,
      fear: 0.2,
      mobility: 0.9,
    },
    color: 0x52b788,
    imageUrl: pikeImg,
    isPredator: true,
    priceMultiplier: 1.8,
    lureMultipliers: {
      vibrotail: 1,
      spoon: 1.4,
      wobbler: 1.6,
    },
  },
  carp: {
    id: 'carp',
    name: 'Carp',
    description:
      'A powerful bottom feeder beloved for its incredible fighting spirit.',
    weightRange: { min: 1, max: 14 },
    activityByTimeOfDay: { morning: 0.7, day: 0.5, evening: 1.2, night: 1.1 },
    activityByWeather: { clear: 1.0, cloudy: 0.9, rain: 1.05 },
    preferredBaits: ['corn', 'dough'],
    preferredGroundbait: 'peas',
    baseCatchChance: 0.15,
    behavior: {
      aggression: 0.5,
      curiosity: 0.6,
      fear: 0.8,
      mobility: 0.5,
    },
    color: 0xd4a017,
    imageUrl: carpImg,
    priceMultiplier: 1.6,
  },
  crucian: {
    id: 'crucian',
    name: 'Crucian Carp',
    description:
      'A resilient little fish that survives in low-oxygen water. Bites cautiously.',
    weightRange: { min: 0.25, max: 3 },
    activityByTimeOfDay: { morning: 0.9, day: 0.4, evening: 0.8, night: 0.75 },
    activityByWeather: { clear: 0.8, cloudy: 1.0, rain: 1.1 },
    preferredBaits: ['worm', 'bread'],
    preferredGroundbait: 'vanillin',
    baseCatchChance: 0.32,
    behavior: {
      aggression: 0.2,
      curiosity: 0.6,
      fear: 0.7,
      mobility: 0.4,
    },
    color: 0xffd166,
    imageUrl: crucianImg,
    priceMultiplier: 1,
  },
  roach: {
    id: 'roach',
    name: 'Roach',
    description:
      'A shoal fish found near mid-water. Very common, great for beginners.',
    weightRange: { min: 0.15, max: 1.2 },
    activityByTimeOfDay: { morning: 0.95, day: 0.8, evening: 0.5, night: 0.1 },
    activityByWeather: { clear: 1.0, cloudy: 0.9, rain: 1.1 },
    preferredBaits: ['maggot', 'bread'],
    preferredGroundbait: 'vanillin',
    baseCatchChance: 0.2,
    behavior: {
      aggression: 0.2,
      curiosity: 0.95,
      fear: 0.75,
      mobility: 0.9,
    },
    color: 0xc0d8f0,
    imageUrl: roachImg,
    priceMultiplier: 1,
  },
  zander: {
    id: 'zander',
    name: 'Zander',
    description:
      'A sleek deep-water predator with excellent eyesight. Hunts in low-light.',
    weightRange: { min: 0.75, max: 12 },
    activityByTimeOfDay: { morning: 0.8, day: 0.2, evening: 1.1, night: 1.3 },
    activityByWeather: { clear: 0.8, cloudy: 1.0, rain: 1.05 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',
    baseCatchChance: 0.07,
    behavior: {
      aggression: 0.8,
      curiosity: 0.4,
      fear: 0.35,
      mobility: 0.85,
    },
    color: 0x6d8ea0,
    imageUrl: zanderImg,
    isPredator: true,
    priceMultiplier: 1.7,
    lureMultipliers: {
      vibrotail: 1.5,
      spoon: 0.75,
      wobbler: 1,
    },
  },
  ruffe: {
    id: 'ruffe',
    name: 'Ruffe',
    description:
      'A small spiny fish related to the prefix. Often a nuisance bite.',
    weightRange: { min: 0.08, max: 0.4 },
    activityByTimeOfDay: { morning: 0.5, day: 0.3, evening: 1.0, night: 1.2 },
    activityByWeather: { clear: 1.0, cloudy: 1.0, rain: 1.1 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'vanillin',
    baseCatchChance: 0.18,
    behavior: {
      aggression: 0.3,
      curiosity: 1,
      fear: 0.3,
      mobility: 0.6,
    },
    color: 0x8a9a5b,
    imageUrl: ruffeImg,
    priceMultiplier: 0.75,
  },
  catfish: {
    id: 'catfish',
    name: 'Catfish',
    description:
      'The king of the deep. A nocturnal monster lurking in the darkest depths.',
    weightRange: { min: 2, max: 50 },
    activityByTimeOfDay: { morning: 0.4, day: 0.15, evening: 0.9, night: 1.4 },
    activityByWeather: { clear: 0.8, cloudy: 1.0, rain: 1.2 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',
    baseCatchChance: 0.03,
    behavior: {
      aggression: 0.9,
      curiosity: 0.3,
      fear: 0.1,
      mobility: 0.5,
    },
    color: 0x4a3728,
    imageUrl: catfishImg,
    isPredator: true,
    priceMultiplier: 2.5,
    lureMultipliers: {
      vibrotail: 1.2,
      spoon: 1.2,
      wobbler: 0.2,
    },
  },
  grass_carp: {
    id: 'grass_carp',
    name: 'Grass Carp',
    description:
      'A large herbivore that feeds on aquatic plants. Fights energetically when hooked.',
    weightRange: { min: 1, max: 25 },
    activityByTimeOfDay: { morning: 0.6, day: 1, evening: 0.9, night: 0.4 },
    activityByWeather: { clear: 1.2, cloudy: 0.8, rain: 0.6 },
    preferredBaits: ['corn', 'dough', 'bread'],
    preferredGroundbait: 'peas',
    baseCatchChance: 0.08,
    behavior: {
      aggression: 0.4,
      curiosity: 0.5,
      fear: 0.85,
      mobility: 0.7,
    },
    color: 0x7fb069,
    imageUrl: grassCarpImg,
    priceMultiplier: 1.7,
  },
};
