import type {
  IRodConfig,
  IHookConfig,
  ILineConfig,
  IReelConfig,
  IGadgetConfig,
} from '../../types';

import vLure from '@/assets/ui/vibrating_lure.webp';
import sLure from '@/assets/ui/spoon_lure.webp';
import wLure from '@/assets/ui/wobbler_lure.webp';

import rodClassic from '@/assets/ui/casting_rod.webp';
import rodSpinning from '@/assets/ui/spinning_rod.webp';
import reelIcon from '@/assets/ui/reel.webp';
import hookIcon from '@/assets/ui/fishing_hook.webp';
import feederIcon from '@/assets/ui/feeder.webp';
import lineIcon from '@/assets/ui/fishing_line.webp';

import echoSounderIcon from '@/assets/ui/echo_sounder.webp';
import repairKitIcon from '@/assets/ui/repair_kit.webp';

export const SHOP_RODS: IRodConfig[] = [
  {
    id: 'rod_starter',
    name: 'Bamboo Stick',
    description: 'A sturdy but basic bamboo rod.',
    price: 0,
    maxWeight: 4.5,
    rodCategory: 'float',
    icon: rodClassic,
  },
  {
    id: 'rod_basic',
    name: 'Fiberglass Rod',
    description: 'Decent beginner rod with some flex.',
    price: 650,
    maxWeight: 12.0,
    rodCategory: 'float',
    icon: rodClassic,
  },
  {
    id: 'rod_pro',
    name: 'Carbon Fiber Rod',
    description: 'Strong, lightweight, professional grade.',
    price: 3500,
    maxWeight: 28.0,
    rodCategory: 'float',
    icon: rodClassic,
  },
  {
    id: 'rod_titanium',
    name: 'Titanium Beast',
    description: 'Unbreakable rod for monster fish.',
    price: 15000,
    maxWeight: 65.0,
    rodCategory: 'float',
    icon: rodClassic,
  },
  {
    id: 'rod_spinning_basic',
    name: 'Basic Spinning',
    description: 'Lightweight rod designed for active lure work.',
    price: 0,
    maxWeight: 5.0,
    rodCategory: 'spinning',
    icon: rodSpinning,
  },
  {
    id: 'rod_spinning_pro',
    name: 'Graphite Master',
    description: 'Excellent sensitivity for feeling every nibble.',
    price: 4200,
    maxWeight: 22.0,
    rodCategory: 'spinning',
    icon: rodSpinning,
  },
  {
    id: 'rod_spinning_ultra',
    name: 'Nano-Carbon Spin',
    description: 'The peak of spinning technology.',
    price: 18000,
    maxWeight: 60.0,
    rodCategory: 'spinning',
    icon: rodSpinning,
  },
];

export const SHOP_HOOKS: IHookConfig[] = [
  {
    id: 'hook_rusted',
    name: 'Rusted Hook',
    description: 'Dull and brittle.',
    price: 0,
    maxWeight: 4.0,
    quality: 0.85,
    rigType: 'float',
    icon: hookIcon,
  },
  {
    id: 'hook_iron',
    name: 'Iron Hook',
    description: 'Standard hook, holds okay.',
    price: 80,
    maxWeight: 11.0,
    quality: 0.92,
    rigType: 'float',
    icon: hookIcon,
  },
  {
    id: 'hook_steel',
    name: 'Carbon Steel Hook',
    description: 'Sharp and very hard to bend.',
    price: 400,
    maxWeight: 25.0,
    quality: 0.97,
    rigType: 'float',
    icon: hookIcon,
  },
  {
    id: 'hook_barbed',
    name: 'Barbed Laser-Sharpened',
    description: 'Fish rarely escape this.',
    price: 1800,
    maxWeight: 65.0,
    quality: 1.0,
    rigType: 'float',
    icon: hookIcon,
  },
  {
    id: 'hook_feeder_basic',
    name: 'Basic Feeder',
    description: 'A classic bottom rig. Always rests on the bottom.',
    price: 150,
    maxWeight: 15.0,
    quality: 0.9,
    rigType: 'feeder',
    icon: feederIcon,
  },
  {
    id: 'hook_feeder_pro',
    name: 'Pro Feeder',
    description: 'Long-distance feeder cage with a sharp hook.',
    price: 1400,
    maxWeight: 45.0,
    quality: 0.98,
    rigType: 'feeder',
    icon: feederIcon,
  },
  {
    id: 'lure_vibrotail',
    name: 'Vibrotail 3"',
    description: 'Soft plastic lure with realistic tail action. Sinks slowly.',
    price: 120,
    maxWeight: 18.0,
    quality: 0.93,
    rigType: 'spinning',
    lureType: 'vibrotail',
    icon: vLure,
  },
  {
    id: 'lure_spoon',
    name: 'Silver Spoon',
    description: 'Classic metal lure. Sinks quickly and flashes in the light.',
    price: 350,
    maxWeight: 35.0,
    quality: 0.96,
    rigType: 'spinning',
    lureType: 'spoon',
    icon: sLure,
  },
  {
    id: 'lure_wobbler',
    name: 'Deep-Diver Wobbler',
    description: 'Floats when still, but dives deep when pulled.',
    price: 1600,
    maxWeight: 65.0,
    quality: 0.98,
    rigType: 'spinning',
    lureType: 'wobbler',
    icon: wLure,
  },
];

export const SHOP_LINES: ILineConfig[] = [
  {
    id: 'line_thread',
    name: 'Cotton Thread',
    description: 'Breaks if you look at it wrong.',
    price: 0,
    maxWeight: 3.5,
    totalLength: 300,
    icon: lineIcon,
  },
  {
    id: 'line_mono',
    name: 'Monofilament 15lb',
    description: 'Standard cheap line.',
    price: 180,
    maxWeight: 10.0,
    totalLength: 300,
    icon: lineIcon,
  },
  {
    id: 'line_fluoro',
    name: 'Fluorocarbon 35lb',
    description: 'Nearly invisible underwater.',
    price: 1200,
    maxWeight: 24.0,
    totalLength: 300,
    icon: lineIcon,
  },
  {
    id: 'line_braid',
    name: 'Braided 65lb',
    description: 'Incredibly strong, but highly visible.',
    price: 4500,
    maxWeight: 58.0,
    totalLength: 300,
    icon: lineIcon,
  },
];

export const SHOP_REELS: IReelConfig[] = [
  {
    id: 'reel_handmade',
    name: 'Wooden Spool',
    description: 'Barely reels the line in.',
    price: 0,
    speed: 1.0,
    maxWeight: 4.0,
    icon: reelIcon,
  },
  {
    id: 'reel_basic',
    name: 'Basic Spinner',
    description: 'Does the job for small/medium fish.',
    price: 550,
    speed: 1.1,
    maxWeight: 12.0,
    icon: reelIcon,
  },
  {
    id: 'reel_multi',
    name: 'Multiplier Reel',
    description: 'Fast retrieval, smooth drag.',
    price: 3200,
    speed: 1.175,
    maxWeight: 28.0,
    icon: reelIcon,
  },
  {
    id: 'reel_electric',
    name: 'Power-Assist Reel',
    description: 'Winch-like power.',
    price: 16000,
    speed: 1.22,
    maxWeight: 65.0,
    icon: reelIcon,
  },
];

export const SHOP_GADGETS: IGadgetConfig[] = [
  {
    id: 'echo_sounder',
    name: 'Echo Sounder',
    description: 'Electronic device that shows fish presence and depth.',
    price: 5000,
    icon: echoSounderIcon,
  },
  {
    id: 'repair_kit',
    name: 'Repair Kit',
    description: 'Restores durability to damaged rods and reels.',
    price: 800,
    icon: repairKitIcon,
  },
];
