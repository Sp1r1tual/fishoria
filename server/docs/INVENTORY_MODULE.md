# 🎒 Fishoria API: Inventory Module

The Inventory module is responsible for managing player items, equipping gear, repairing it, consuming consumables, and deleting items.

## 🚀 Key Features

- **Equipment system**: Flexible tackle configuration (rod, reel, line, hook) with four equipment slots.
- **Batch equip**: Support for equipping multiple items in a single request via the `equips` array.
- **Compatibility validation**: Checks whether the bait matches the rod type (e.g., spinning vs. classic).
- **Gear maintenance**: Repair mechanics for restoring item durability using repair kits.
- **Condition tracking**: Prevents the use of broken items until they are repaired.
- **Bait & groundbait management**: Selecting the active bait and groundbait for the next cast.
- **Consumable consumption**: Dedicated endpoint for using up bait/groundbait quantities.
- **Safe deletion**: Auto-unequip on delete within the same transaction.

## 🛠 Technical Details

### 1. Gear Compatibility Rules

The system automatically validates combinations when attempting to equip:

- **Spinning Rods** (items containing `spinning` in `itemId`): Can only use lures (`lure_*` prefix).
- **Classic Rods**: Cannot use lures (regular bait only).
- **Lure Hook Match**: When using a lure, the equipped hook's `itemId` must exactly match the lure's `itemId` (e.g., `lure_vibrotail` hook with `lure_vibrotail` bait).
- **Broken Items**: Cannot equip any item with `isBroken: true`.

### 2. Batch Equipment (`equips` array)

The equip endpoint supports two modes:

- **Single equip**: `{ targetType, uid, targetId }` — equips or selects one item.
- **Batch equip**: `{ equips: [{ targetType, uid, targetId }, ...] }` — equips multiple items at once.

This consolidates multiple slot changes (e.g., rod + reel + hook) into a single request.

### 3. Repair Mechanics (`repairGear`)

Repair is only available for rods and reels using a `repair_kit`.

- **Efficient consumption**: The system calculates the exact percentage needed to restore the item to 100%. If the repair kit has more capacity than required, the remainder is preserved for future use.
- **Destroy on Depletion**: The repair kit is automatically deleted from the database when its `condition` reaches 0.
- **Auto-Revival**: Any repair operation (even 1%) automatically removes the `isBroken: true` flag, making the item usable again.
- **Transaction Safety**: Entire repair is executed within a `FOR UPDATE` locked transaction.

### 4. Item Condition (Durability)

Every mechanical item has a `condition` parameter (0–100%):

- If `condition` drops to 0, the item receives the `isBroken` flag.
- Item wear occurs in the `GameModule` during each catch.
- Lines use `meters` instead of `condition` (starting at 300m).

### 5. Safe Deletion & Consumption

- **Auto-unequip**: When an item is deleted via the delete endpoint, the system automatically checks whether it is currently equipped (`equippedRodUid`, `equippedReelUid`, `equippedLineUid`, `equippedHookUid`). If so, the corresponding slot in the profile is cleared (set to `null`) within the same transaction.
- **Consumption (`consumeConsumable`)**: Bait or groundbait is consumed with a strict inventory check. It is impossible to use more than what is available. The operation is protected by row-level locking.

### 6. Target Types

| Target Type   | Equip Slot             | Description           |
| :------------ | :--------------------- | :-------------------- |
| `rod`         | `equippedRodUid`       | Fishing rod           |
| `reel`        | `equippedReelUid`      | Fishing reel          |
| `line`        | `equippedLineUid`      | Fishing line          |
| `hook`        | `equippedHookUid`      | Hook or lure          |
| `bait`        | `activeBait`           | Active bait selection |
| `groundbait`  | `activeGroundbait`     | Active groundbait     |

## 📡 Endpoints

| Method | Path                | Description                                 | Access |
| :----- | :------------------ | :------------------------------------------ | :----- |
| `POST` | `/inventory/equip`  | Equip tackle or select bait (single/batch)  | User   |
| `POST` | `/inventory/repair` | Repair gear using a repair kit              | User   |
| `POST` | `/inventory/delete` | Delete (discard) an item from the inventory | User   |
| `POST` | `/inventory/consume`| Consume bait or groundbait from inventory   | User   |

All endpoints return the updated full player profile.

## 📦 Schemas & DTOs

- **EquipDto**: Supports single mode (`targetType`, `uid?`, `targetId?`) or batch mode (`equips: EquipItemSchema[]`). Target types: `rod`, `reel`, `line`, `hook`, `bait`, `groundbait`.
- **RepairDto**: `kitUid` (repair kit UID), `targetUid` (item to repair), `targetType` (`rod` | `reel`).
- **DeleteGearDto**: `uid` (unique item UID to delete).
- **ConsumeDto**: `itemId` (consumable ID), `itemType` (`bait` | `groundbait`), `quantity?` (defaults to 1, must be positive integer).

### Data Types

- **GearItem**: A unique item (rod, reel, etc.) with a unique `uid`, `condition` (0-100), `meters` (for lines), `isBroken` flag.
- **ConsumableItem**: Stackable items (bait) with a `quantity` field. Unique per `[profileId, itemId]`.

## 💡 Developer Tip

Before building the fishing interface on the frontend, always account for spinning rod restrictions to avoid letting users select incompatible bait. Use `itemId.includes('spinning')` to detect spinning rods and `itemId.startsWith('lure_')` to detect lure items.
