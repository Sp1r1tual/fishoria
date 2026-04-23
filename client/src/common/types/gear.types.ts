export type BaitTypeType =
  | 'worm'
  | 'maggot'
  | 'bread'
  | 'corn'
  | 'dough'
  | 'live_bait'
  | 'lure_vibrotail'
  | 'lure_spoon'
  | 'lure_wobbler';

export interface IBaitConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export type GroundbaitTypeType = 'vanillin' | 'peas' | 'dried_blood' | 'none';

export interface IGroundbaitConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  intensityMultiplier?: number;
  fishedSpeciesMultiplier?: Record<string, number>;
}

export interface IRodConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  maxWeight: number;
  isBroken?: boolean;
  rodCategory?: 'float' | 'feeder' | 'spinning';
  icon?: string;
}

export type RigTypeType = 'float' | 'feeder' | 'spinning';
export type LureTypeType = 'vibrotail' | 'spoon' | 'wobbler' | 'none';

export interface IHookConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  maxWeight: number;
  quality: number;
  rigType?: RigTypeType;
  lureType?: LureTypeType;
  icon?: string;
}

export interface ILineConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  maxWeight: number;
  totalLength: number;
  icon?: string;
}

export interface IReelConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  speed: number;
  maxWeight: number;
  isBroken?: boolean;
  icon?: string;
}

export interface IGadgetConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export type GearItemType =
  | IRodConfig
  | IReelConfig
  | ILineConfig
  | IHookConfig
  | IGadgetConfig;
export type GearTypeType =
  | 'rod'
  | 'reel'
  | 'line'
  | 'hook'
  | 'gadget'
  | 'bait'
  | 'groundbait'
  | 'repair_kit';

export interface IGearItemBase {
  id: string;
  uid?: string;
  name?: string;
  description?: string;
  icon?: string;
  price?: number;
  condition?: number;
  meters?: number;
  totalLength?: number;
  count?: number;
  isBroken?: boolean;
  itemType?: GearTypeType;
  rigType?: RigTypeType;
  rodCategory?: 'float' | 'feeder' | 'spinning';
}

export interface IGearAction {
  targetType: 'rod' | 'reel' | 'line' | 'hook' | 'bait' | 'groundbait';
  uid?: string | null;
  targetId?: string | null;
}
