# 🛒 Fishoria API: Shop Module

The Shop module manages the in-game economy, allowing players to purchase gear and sell their caught fish.

## 🚀 Key Features

- **Gear purchasing**: Buying rods, reels, lines, hooks, and lures.
- **Consumables**: A stacked purchasing system for bait and groundbait (with quantity support).
- **Catch selling**: Sell all non-released fish from the keepnet at market price.
- **Unique items**: Purchase mechanics for special tools (e.g., Echo Sounder) with duplicate checking.
- **Gadgets**: Support for repair kits and echo sounder purchases.
- **Atomicity**: All monetary operations are protected by database transactions with row-level locking.

## 🛠 Technical Details

### 1. Pricing System

- **Items**: Gear prices are loaded from `prices.config.ts` via `getItemPrice(itemId)`. Throws an error if the item ID is unknown.
- **Fish catch**: The sell price is calculated dynamically:

```typescript
sellPrice = Math.ceil(weight * 15 * FISH_SPECIES_MULTIPLIERS[speciesId]);
```

Species multipliers (examples): `catfish` 2.5×, `pike` 1.8×, `zander` 1.7×, `carp` 1.6×, `roach` 1.0×, `ruffe` 0.75×.

### 2. Item Purchase Types

| Item Type    | Category   | Behavior                                                   |
| :----------- | :--------- | :--------------------------------------------------------- |
| `rod`        | Gear       | Created with `condition: 100`                              |
| `reel`       | Gear       | Created with `condition: 100`                              |
| `line`       | Gear       | Created with `meters: 300`                                 |
| `hook`       | Gear       | Created without condition                                  |
| `bait`       | Consumable | Stacked: increments existing or creates new                |
| `groundbait` | Consumable | Stacked: increments existing or creates new                |
| `repair_kit` | Gear       | Created with `condition: 100`, type forced to `repair_kit` |
| `gadget`     | Special    | Echo Sounder: sets `hasEchoSounder: true` flag             |

### 3. Consumable Stacking

When buying bait or groundbait:

1. The system checks for an existing `ConsumableItem` with the same `profileId`, `itemId`, and `itemType`.
2. If found – the `quantity` is incremented by the purchased amount.
3. If not found – a new consumable record is created.

### 4. Transaction Security

The following mechanisms protect the economy from manipulation:

- **Row-level locking**: Every purchase or sale begins with `SELECT ... FOR UPDATE`, locking the player's profile at the database level until the operation is complete.
- **Double balance check**: After locking, the balance is re-verified inside the transaction to prevent race conditions.
- **Pre-purchase verification**: Checks for sufficient funds and ownership of unique items (echo sounder) before the transaction begins.

### 5. Fish Selling

Selling fish via `POST /shop/sell`:

1. Fetches all `FishCatch` records where `isReleased: false` (released fish cannot be sold).
2. Calculates total revenue using `getFishSellPrice()` per catch.
3. Deletes all non-released fish catch records.
4. Increments the player's `money` by the total.
5. Returns the updated profile.

## 📡 Endpoints

| Method | Path         | Description                           | Access |
| :----- | :----------- | :------------------------------------ | :----- |
| `POST` | `/shop/buy`  | Purchase an item (gear or consumable) | User   |
| `POST` | `/shop/sell` | Sell all non-released fish            | User   |

Both endpoints return the updated full player profile.

## 📦 Schemas & DTOs

- **BuyDto** (Zod): `itemId` (string), `itemType` (enum: `rod`, `reel`, `line`, `hook`, `bait`, `groundbait`, `gadget`, `repair_kit`), `quantity?` (positive integer, defaults to 1).

## 💡 Developer Tip

When adding new item categories to `prices.config.ts`, always verify that:

1. The item ID has a price entry in `ITEM_PRICES`.
2. The item type matches the allowed `itemType` values in `BuyDto`.
3. If the item needs special handling (like `echo_sounder`), add the logic in `ShopEntity.executeBuyGearTx`.
