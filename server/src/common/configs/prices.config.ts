/**
 * Server-side price registry.
 * Must stay in sync with client configs (gear.config.ts, bait.config.ts, groundbait.config.ts).
 */

const ITEM_PRICES: Record<string, number> = {
  // ─── Float Rods ───────────────────────────────────────────────────
  rod_starter: 0,
  rod_basic: 500,
  rod_amateur: 1500,
  rod_pro: 4000,
  rod_advanced: 9000,
  rod_titanium: 17000,
  rod_nanotube: 30000,
  rod_kraken: 52000,

  // ─── Spinning Rods ───────────────────────────────────────────────
  rod_spinning_basic: 0,
  rod_spinning_amateur: 600,
  rod_spinning_classic: 1800,
  rod_spinning_pro: 4500,
  rod_spinning_advanced: 10000,
  rod_spinning_ultra: 20000,
  rod_spinning_ocean: 34000,
  rod_spinning_leviathan: 55000,

  // ─── Reels ───────────────────────────────────────────────────────
  reel_handmade: 0,
  reel_basic: 400,
  reel_amateur: 1200,
  reel_multi: 3000,
  reel_advanced: 7000,
  reel_electric: 16000,
  reel_marine: 28000,
  reel_poseidon: 52000,

  // ─── Lines ──────────────────────────────
  line_thread: 0,
  line_mono: 150,
  line_fluorocarbon_basic: 500,
  line_fluoro: 1000,
  line_braid_light: 2000,
  line_braid: 4000,
  line_tungsten: 6500,
  line_nanofiber: 11000,

  // ─── Hooks float ──────────────────────────────
  hook_rusted: 0,
  hook_iron: 60,
  hook_steel: 200,
  hook_barbed: 650,
  hook_tungsten: 2000,
  hook_kraken: 4500,

  // ─── Hooks feeder ────────────────────────────────────────────────
  hook_feeder_basic: 120,
  hook_feeder_pro: 1200,
  hook_feeder_heavy: 2200,
  hook_feeder_titan: 4500,

  // ─── Lures spinning ─────────────────────────
  lure_vibrotail: 100,
  lure_spoon: 300,
  lure_wobbler: 1500,
  lure_spoon_heavy: 2500,
  lure_wobbler_titan: 5000,

  // ─── Baits ───────────────────────────
  worm: 2,
  maggot: 2,
  bread: 1,
  corn: 5,
  dough: 2,
  live_bait: 15,

  // ─── Groundbaits ─────────────────────────────────────────────────────────
  vanillin: 30,
  peas: 65,
  dried_blood: 100,

  // ─── Gadgets ─────────────────────────────────────────────────────────────
  echo_sounder: 5000,
  repair_kit: 600,
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
