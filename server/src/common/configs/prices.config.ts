/**
 * Server-side price registry.
 * Must stay in sync with client configs (gear.config.ts, bait.config.ts, groundbait.config.ts).
 */

const ITEM_PRICES: Record<string, number> = {
  // Rods (Float - 8 Items)
  rod_starter: 0,
  rod_basic: 650,
  rod_amateur: 1500,
  rod_pro: 3500,
  rod_advanced: 8000,
  rod_titanium: 15000,
  rod_nanotube: 26000,
  rod_kraken: 48000,

  // Rods (Spinning - 8 Items)
  rod_spinning_basic: 0,
  rod_spinning_amateur: 750,
  rod_spinning_classic: 1800,
  rod_spinning_pro: 4200,
  rod_spinning_advanced: 9000,
  rod_spinning_ultra: 18000,
  rod_spinning_ocean: 30000,
  rod_spinning_leviathan: 50000,

  // Reels (8 Items)
  reel_handmade: 0,
  reel_basic: 550,
  reel_amateur: 1400,
  reel_multi: 3200,
  reel_advanced: 7500,
  reel_electric: 16000,
  reel_marine: 26000,
  reel_poseidon: 48000,

  // Lines (8 Items)
  line_thread: 0,
  line_mono: 180,
  line_fluorocarbon_basic: 600,
  line_fluoro: 1200,
  line_braid_light: 2500,
  line_braid: 4500,
  line_tungsten: 7000,
  line_nanofiber: 12000,

  // Hooks (float)
  hook_rusted: 0,
  hook_iron: 80,
  hook_steel: 400,
  hook_barbed: 1800,
  hook_tungsten: 2800,
  hook_kraken: 5000,

  // Hooks (feeder)
  hook_feeder_basic: 150,
  hook_feeder_pro: 1400,
  hook_feeder_heavy: 2200,
  hook_feeder_titan: 4500,

  // Lures (spinning)
  lure_vibrotail: 120,
  lure_spoon: 350,
  lure_wobbler: 1600,
  lure_spoon_heavy: 2500,
  lure_wobbler_titan: 4800,

  // Baits
  worm: 2,
  maggot: 2,
  bread: 1,
  corn: 5,
  dough: 2,
  live_bait: 15,

  // Groundbaits
  vanillin: 30,
  peas: 65,
  dried_blood: 100,

  // Gadgets
  echo_sounder: 5000,
  repair_kit: 800,
};

/** Fish base sell price multiplier: total = weight * FISH_SELL_MULTIPLIER * speciesMultiplier */
const FISH_SELL_MULTIPLIER = 7;

/** Species-specific multipliers to match client fish.config.ts */
export const FISH_SPECIES_MULTIPLIERS: Record<string, number> = {
  perch: 1.1,
  pike: 1.9,
  carp: 1.6,
  crucian: 1.0,
  roach: 1.0,
  zander: 2.1,
  ruffe: 0.75,
  catfish: 2.5,
  grass_carp: 1.7,
  american_catfish: 0.7,
  asp: 2.4,
  bream: 1.3,
  crayfish: 1.5,
  eel: 3.5,
  gudgeon: 0.8,
  silver_carp: 1.4,
  tench: 2.0,
  weatherfish: 0.9,
};

export function getItemPrice(itemId: string): number {
  const price = ITEM_PRICES[itemId];

  if (price === undefined) {
    throw new Error(`Unknown item ID: ${itemId}`);
  }

  return price;
}

export function getFishSellPrice(speciesId: string, weight: number): number {
  const multiplier = FISH_SPECIES_MULTIPLIERS[speciesId] || 1.0;
  return Math.ceil(weight * FISH_SELL_MULTIPLIER * multiplier);
}
