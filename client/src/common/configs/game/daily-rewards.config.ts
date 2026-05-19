export interface DailyReward {
  day: number;
  money?: number;
  consumables?: { itemType: string; itemId: string; quantity: number }[];
  gearItems?: { itemType: string; itemId: string; quantity?: number }[];
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, money: 100 },
  { day: 2, money: 200 },
  {
    day: 3,
    consumables: [
      { itemType: 'bait', itemId: 'worm', quantity: 5 },
      { itemType: 'bait', itemId: 'maggot', quantity: 5 },
      { itemType: 'bait', itemId: 'bread', quantity: 5 },
      { itemType: 'bait', itemId: 'corn', quantity: 5 },
      { itemType: 'bait', itemId: 'dough', quantity: 5 },
      { itemType: 'bait', itemId: 'live_bait', quantity: 5 },
    ],
  },
  { day: 4, money: 350 },
  {
    day: 5,
    consumables: [
      { itemType: 'groundbait', itemId: 'vanillin', quantity: 3 },
      { itemType: 'groundbait', itemId: 'peas', quantity: 3 },
      { itemType: 'groundbait', itemId: 'dried_blood', quantity: 3 },
    ],
  },
  { day: 6, money: 600 },
  {
    day: 7,
    gearItems: [
      { itemType: 'hook', itemId: 'lure_vibrotail' },
      { itemType: 'hook', itemId: 'lure_spoon' },
      { itemType: 'hook', itemId: 'lure_wobbler' },
    ],
  },
];
