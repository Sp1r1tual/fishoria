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
import americanCatfishImg from '@/assets/fish/american_catfish.webp';
import aspImg from '@/assets/fish/asp.webp';
import breamImg from '@/assets/fish/bream.webp';
import crayfishImg from '@/assets/fish/crayfish.webp';
import eelImg from '@/assets/fish/eel.webp';
import gudgeonImg from '@/assets/fish/gudgeon.webp';
import silverCarpImg from '@/assets/fish/silver_carp.webp';
import tenchImg from '@/assets/fish/tench.webp';
import weatherfishImg from '@/assets/fish/weatherfish.webp';

export const FISH_SPECIES: Record<string, IFishSpeciesConfig> = {
  perch: {
    id: 'perch',
    name: 'Perch',
    description:
      'A feisty predator with striking striped markings. Common near submerged vegetation.',
    weightRange: { min: 0.12, max: 2 },
    activityByTimeOfDay: { morning: 1.1, day: 0.7, evening: 0.9, night: 0.25 },
    activityByWeather: { clear: 0.8, cloudy: 1.2, rain: 1.4 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'dried_blood',

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
      morning: 1.2,
      day: 0.85,
      evening: 1.1,
      night: 0.35,
    },
    activityByWeather: { clear: 0.9, cloudy: 1.2, rain: 1.3 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',

    behavior: {
      aggression: 0.95,
      curiosity: 0.5,
      fear: 0.2,
      mobility: 0.9,
    },
    color: 0x52b788,
    imageUrl: pikeImg,
    isPredator: true,
    priceMultiplier: 1.9,
    lureMultipliers: {
      vibrotail: 1.2,
      spoon: 1.4,
      wobbler: 1.7,
    },
  },
  carp: {
    id: 'carp',
    name: 'Carp',
    description:
      'A powerful bottom feeder beloved for its incredible fighting spirit.',
    weightRange: { min: 1, max: 14 },
    activityByTimeOfDay: { morning: 1.1, day: 0.6, evening: 1.3, night: 1.2 },
    activityByWeather: { clear: 1.0, cloudy: 1.1, rain: 1.2 },
    preferredBaits: ['corn', 'dough'],
    preferredGroundbait: 'peas',

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
    activityByTimeOfDay: { morning: 1.1, day: 0.75, evening: 1.1, night: 0.6 },
    activityByWeather: { clear: 0.9, cloudy: 1.1, rain: 1.0 },
    preferredBaits: ['worm', 'bread'],
    preferredGroundbait: 'vanillin',

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
    activityByTimeOfDay: { morning: 1.1, day: 0.9, evening: 1.0, night: 0.3 },
    activityByWeather: { clear: 1.0, cloudy: 1.1, rain: 0.9 },
    preferredBaits: ['maggot', 'bread'],
    preferredGroundbait: 'vanillin',

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
    activityByTimeOfDay: { morning: 0.8, day: 0.65, evening: 1.3, night: 1.5 },
    activityByWeather: { clear: 0.8, cloudy: 1.2, rain: 1.4 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',

    behavior: {
      aggression: 0.8,
      curiosity: 0.4,
      fear: 0.35,
      mobility: 0.85,
    },
    color: 0x6d8ea0,
    imageUrl: zanderImg,
    isPredator: true,
    priceMultiplier: 2.1,
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
    activityByTimeOfDay: { morning: 0.8, day: 0.75, evening: 1.1, night: 1.4 },
    activityByWeather: { clear: 0.9, cloudy: 1.1, rain: 1.3 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'vanillin',

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
    activityByTimeOfDay: { morning: 0.4, day: 0.45, evening: 1.0, night: 1.7 },
    activityByWeather: { clear: 0.8, cloudy: 1.1, rain: 1.5 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',

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
    activityByTimeOfDay: { morning: 0.4, day: 1.3, evening: 0.7, night: 0.45 },
    activityByWeather: { clear: 1.5, cloudy: 0.8, rain: 0.6 },
    preferredBaits: ['corn', 'dough', 'bread'],
    preferredGroundbait: 'peas',

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
  american_catfish: {
    id: 'american_catfish',
    name: 'American Catfish',
    description:
      'A small but extremely active and curious bottom dweller. Often bites in groups.',
    weightRange: { min: 0.1, max: 2.5 },
    activityByTimeOfDay: { morning: 0.8, day: 0.7, evening: 1.2, night: 1.5 },
    activityByWeather: { clear: 0.85, cloudy: 1.2, rain: 1.5 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'dried_blood',

    behavior: {
      aggression: 0.6,
      curiosity: 1.0,
      fear: 0.1,
      mobility: 0.4,
    },
    color: 0x5a4a3a,
    imageUrl: americanCatfishImg,
    isPredator: true,
    priceMultiplier: 0.7,
    lureMultipliers: {
      vibrotail: 1.1,
      spoon: 0.5,
      wobbler: 0.1,
    },
  },
  asp: {
    id: 'asp',
    name: 'Asp',
    description:
      'A lightning-fast predator of the upper water layers. Known for powerful surface strikes.',
    weightRange: { min: 0.5, max: 7.0 },
    activityByTimeOfDay: { morning: 1.4, day: 1.5, evening: 0.8, night: 0.3 },
    activityByWeather: { clear: 1.5, cloudy: 0.9, rain: 0.7 },
    preferredBaits: ['live_bait'],
    preferredGroundbait: 'dried_blood',

    behavior: {
      aggression: 0.9,
      curiosity: 0.6,
      fear: 0.6,
      mobility: 1.0,
    },
    color: 0xe0e0e0,
    imageUrl: aspImg,
    isPredator: true,
    priceMultiplier: 2.4,
    lureMultipliers: {
      vibrotail: 0.6,
      spoon: 1.8,
      wobbler: 1.5,
    },
  },
  bream: {
    id: 'bream',
    name: 'Bream',
    description:
      'A flat-bodied bottom dweller. Very cautious and prefers deep, quiet areas.',
    weightRange: { min: 0.4, max: 6.0 },
    activityByTimeOfDay: { morning: 1.1, day: 0.7, evening: 1.2, night: 1.4 },
    activityByWeather: { clear: 0.8, cloudy: 1.3, rain: 1.1 },
    preferredBaits: ['maggot', 'worm', 'dough'],
    preferredGroundbait: 'vanillin',

    behavior: {
      aggression: 0.3,
      curiosity: 0.5,
      fear: 0.9,
      mobility: 0.3,
    },
    color: 0xc0c0c0,
    imageUrl: breamImg,
    priceMultiplier: 1.3,
  },
  crayfish: {
    id: 'crayfish',
    name: 'Crayfish',
    description: 'A bottom-dwelling crustacean. Usually a sign of clean water.',
    weightRange: { min: 0.05, max: 0.35 },
    activityByTimeOfDay: { morning: 0.4, day: 0.3, evening: 1.1, night: 1.8 },
    activityByWeather: { clear: 0.8, cloudy: 1.2, rain: 1.6 },
    preferredBaits: ['worm', 'bread'],
    preferredGroundbait: 'none',

    behavior: {
      aggression: 0.2,
      curiosity: 0.9,
      fear: 0.5,
      mobility: 0.1,
    },
    color: 0x4b3621,
    imageUrl: crayfishImg,
    priceMultiplier: 1.5,
  },
  eel: {
    id: 'eel',
    name: 'Eel',
    description:
      'A mysterious, snake-like fish. Strictly nocturnal and very strong.',
    weightRange: { min: 0.4, max: 4.5 },
    activityByTimeOfDay: { morning: 0.3, day: 0.25, evening: 0.7, night: 2.0 },
    activityByWeather: { clear: 0.7, cloudy: 1.3, rain: 1.8 },
    preferredBaits: ['worm', 'live_bait'],
    preferredGroundbait: 'dried_blood',

    behavior: {
      aggression: 0.8,
      curiosity: 0.3,
      fear: 0.3,
      mobility: 0.4,
    },
    color: 0x2f4f4f,
    imageUrl: eelImg,
    isPredator: true,
    priceMultiplier: 3.5,
  },
  gudgeon: {
    id: 'gudgeon',
    name: 'Gudgeon',
    description:
      'A small, schooling fish that loves sandy bottoms and clear water.',
    weightRange: { min: 0.02, max: 0.15 },
    activityByTimeOfDay: { morning: 1.3, day: 1.4, evening: 0.6, night: 0.3 },
    activityByWeather: { clear: 1.5, cloudy: 0.9, rain: 0.8 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'vanillin',

    behavior: {
      aggression: 0.2,
      curiosity: 1.0,
      fear: 0.4,
      mobility: 0.7,
    },
    color: 0x8b4513,
    imageUrl: gudgeonImg,
    priceMultiplier: 0.8,
  },
  silver_carp: {
    id: 'silver_carp',
    name: 'Silver Carp',
    description:
      'A huge plankton eater. Can jump out of the water when startled.',
    weightRange: { min: 2.0, max: 35.0 },
    activityByTimeOfDay: { morning: 0.5, day: 1.5, evening: 0.7, night: 0.4 },
    activityByWeather: { clear: 1.6, cloudy: 0.8, rain: 0.6 },
    preferredBaits: ['bread', 'dough'],
    preferredGroundbait: 'peas',

    behavior: {
      aggression: 0.4,
      curiosity: 0.4,
      fear: 0.9,
      mobility: 0.6,
    },
    color: 0xe5e5e5,
    imageUrl: silverCarpImg,
    priceMultiplier: 1.4,
  },
  tench: {
    id: 'tench',
    name: 'Tench',
    description:
      'The "doctor" fish of the reservoir. Very shy and lives in thick weeds.',
    weightRange: { min: 0.3, max: 4.5 },
    activityByTimeOfDay: { morning: 1.5, day: 0.7, evening: 1.6, night: 0.5 },
    activityByWeather: { clear: 0.7, cloudy: 1.6, rain: 1.4 },
    preferredBaits: ['worm', 'maggot'],
    preferredGroundbait: 'vanillin',

    behavior: {
      aggression: 0.3,
      curiosity: 0.3,
      fear: 1.0,
      mobility: 0.2,
    },
    color: 0x3d5229,
    imageUrl: tenchImg,
    priceMultiplier: 2.0,
  },
  weatherfish: {
    id: 'weatherfish',
    name: 'Weatherfish',
    description:
      'Can predict weather changes. Becomes very active before a storm.',
    weightRange: { min: 0.05, max: 0.3 },
    activityByTimeOfDay: { morning: 0.45, day: 0.6, evening: 1.2, night: 1.8 },
    activityByWeather: { clear: 0.6, cloudy: 1.2, rain: 2.2 },
    preferredBaits: ['worm'],
    preferredGroundbait: 'vanillin',

    behavior: {
      aggression: 0.2,
      curiosity: 0.8,
      fear: 0.3,
      mobility: 0.5,
    },
    color: 0x5c4033,
    imageUrl: weatherfishImg,
    priceMultiplier: 0.9,
  },
};
