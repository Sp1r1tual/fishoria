# 🎣 Fishoria API: Game Module

The Game module is the heart of the gameplay. It combines fish catching mechanics, gear degradation, experience gain, and quest progress into a single transactional flow.

## 🚀 Key Features

- **Anti-cheat protection**: Duplicate catch prevention (anti-spam) and fish parameter validation.
- **Transactional catching**: The entire catch process (XP gain, gear wear, quest updates, lake stats, bait consumption, achievements) happens atomically. If any part fails, the database rolls back.
- **Smart consumption**: Bait is only consumed for classic tackle. Spinning lures (`lure_*`) are not spent.
- **Dynamic wear**: Rods and reels lose durability based on `rodDamage` and `reelDamage` values sent by the client.
- **Auto-unequip**: If gear breaks during a catch (condition reaches 0), the system automatically removes it from the player's equipped slots.
- **Fish release**: Caught fish can be marked with `isReleased: true`, which excludes them from being sold later.

## 🛠 Technical Details

### 1. Duplicate Protection & Anti-spam

Before processing a catch, the server checks for an identical catch within the last **5 seconds** (same `profileId`, `speciesId`, `weight`, `length`, `lakeId`). If a duplicate is found, the server returns the current profile without re-processing.

### 2. XP Calculation

Experience formula:

```typescript
const xpGain = Math.ceil(weight * 25 * FISH_SPECIES_MULTIPLIERS[speciesId]);
```

Species-specific multipliers are defined in `prices.config.ts`:

| Species      | Multiplier |
| :----------- | :--------- |
| `perch`      | 1.1        |
| `pike`       | 1.8        |
| `carp`       | 1.6        |
| `crucian`    | 1.0        |
| `roach`      | 1.0        |
| `zander`     | 1.7        |
| `ruffe`      | 0.75       |
| `catfish`    | 2.5        |
| `grass_carp` | 1.7        |

Unknown species default to `1.0`.

### 3. Lake Statistics (Lake Diary)

Every catch updates the global location statistics for the player's profile:

- **Records**: Maximum weight for each fish species (`records` JSON).
- **Minimum weights**: Minimum weight for each fish species (`minWeights` JSON).
- **Cumulative stats**: Total catch count (`speciesCounts`) and total weight (`speciesWeights`) per fish species.
- **Global totals**: `totalCaught` and `totalWeight` per lake.

### 4. Trophy Logic

A fish is considered a trophy if:

- `sizeRank === 'trophy'` (sent by the client), **or**
- `weight >= maxWeight * 0.75` (where `maxWeight` is the maximum possible weight for that species).

Trophy catches trigger the `sportsman_fisher` achievement check.

### 5. Catch Transaction Lifecycle

1. **Locking (`FOR UPDATE`)**: Protection against concurrent profile modifications.
2. **Fish record**: The catch is stored in `fish_catches` table with all details.
3. **Quest progress**: All active quests matching the catch criteria are updated.
4. **Bait consumption**: Non-lure bait is decremented by 1 from consumables.
5. **XP award**: Experience is added with automatic level-up checking.
6. **Gear wear**: Rod and reel durability is reduced. At 0%, they are marked `isBroken` and auto-unequipped.
7. **Lake stats update**: Create or update `LakeStatistic` record with new data.
8. **Achievement check**: Trophy catches trigger `sportsman_fisher` check.

### 6. Break & Snap Mechanics (`breakGear`)

The break system handles five types of gear failure:

| Break Type | Effects                                                                                                                                                 |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rod`      | Rod set to broken/0%, auto-unequipped. Reckless achievement checked.                                                                                    |
| `reel`     | Reel set to broken/0%, auto-unequipped. Reckless achievement checked.                                                                                   |
| `line`     | Line loses `lostMeters`. If <10m remaining, line is deleted + unequipped. Hook is deleted + auto-replaced. Bait consumed. Reckless achievement checked. |
| `hook`     | Hook is deleted from inventory. Auto-replacement with same `itemId` from inventory. Bait consumed. Reckless achievement checked.                        |
| `bait`     | Bait consumed (1 unit decremented).                                                                                                                     |

**Collateral damage during break**: When break type is NOT `rod`/`reel`, any `rodDamage`/`reelDamage` values are still applied to the equipped rod/reel respectively (they take wear from the failed attempt).

**Auto hook replacement**: When a hook is lost (break types `line` or `hook`), the system automatically searches the inventory for another hook with the same `itemId` and equips it.

### 7. Fishing Methods

Three fishing methods are supported:

- `FLOAT` – Classic float fishing.
- `SPINNING` – Spinning rod fishing (uses lures).
- `FEEDER` – Feeder fishing method.

## 📡 Endpoints

| Method | Path          | Description                                    | Access |
| :----- | :------------ | :--------------------------------------------- | :----- |
| `POST` | `/game/catch` | Register a successful fish catch               | User   |
| `POST` | `/game/break` | Register a gear break (when the fish got away) | User   |

Both endpoints return the updated full player profile.

## 🛡 Security & Validation

- **Rate Limiting**: To prevent bot usage, a `@Throttle` limit is set – a maximum of 100 game actions per minute per user.
- **Zod Validation**: All incoming data (weight, fish ID, method) goes through strict typing and validation via `ZodValidationPipe`. If the client sends invalid data (e.g., a negative weight), the server rejects the request before touching the database.

## 📦 Schemas

- **CatchDto**: `speciesId`, `speciesName`, `weight`, `length`, `lakeId`, `lakeName`, `baitUsed`, `method` (FLOAT/SPINNING/FEEDER), `rodDamage?`, `reelDamage?`, `maxWeight?`, `sizeRank?` (small/good/trophy), `isReleased?`.
- **BreakDto**: `type` (rod/reel/line/hook/bait), `baitId?`, `lostMeters?`, `rodDamage?`, `reelDamage?`.

## 💡 Developer Tip

The client is responsible for calculating wear values (`rodDamage`, `reelDamage`) based on the in-game situation, but the server always verifies that the data is realistic. Gear breakage automatically clears the corresponding `equipped*Uid` fields in the player's profile.

Both endpoints return a fully mapped player profile (with localized quests and achievements) to keep the client in sync.
