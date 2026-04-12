# 📜 Fishoria API: Quest Module

The Quest module manages the full lifecycle of quests: from progress tracking to reward distribution.

## 🚀 Key Features

- **Dynamic conditions**: Support for various condition types (catching a specific fish, catch count, fishing method) via the `IQuestCondition` interface.
- **Progress tracking**: Progress is stored as a JSON object in the database, enabling multi-step quests with per-condition counters.
- **Atomic rewards**: Experience and currency are awarded within a single database transaction with row-level locking.
- **Built-in localization**: The endpoint returns quest names and descriptions already in the user's language. Translation filtering happens at the database query level, reducing the amount of data transferred.
- **Label localization**: Dynamic generation of condition descriptions (e.g., "Catch a Carp") based on the user's language, supporting both plain strings and `{ uk: "...", en: "..." }` JSON objects.
- **Auto-completion**: Quests are automatically marked as completed when all conditions reach their targets.

## 🛠 Technical Details

### 1. Game Condition Types (`IQuestCondition`)

The system supports three core task types, automatically tracked during each catch:

- `CATCH_METHOD`: Catching fish using a specific method (value matches: `FLOAT`, `SPINNING`, `FEEDER`).
- `CATCH_SPECIES`: Catching a specific fish species by its ID (value matches `speciesId`).
- `CATCH_SPECIES_ON_LAKE`: Catching a specific fish species on a strictly defined lake (value matches `speciesId` AND `lakeId` matches `cond.lakeId`).

### Condition Interface

```typescript
interface IQuestCondition {
  id: string;                                    // Unique condition ID within the quest
  type: string;                                  // CATCH_METHOD | CATCH_SPECIES | CATCH_SPECIES_ON_LAKE
  value: string;                                 // Value to match (method name or species ID)
  target: number;                                // Required count to complete
  label: string | { uk: string; en: string };    // Display label (localizable)
  lakeId?: string;                               // Required lake for CATCH_SPECIES_ON_LAKE
}
```

### 2. Progress Calculation

- **Unit counter**: Each caught fish that meets the conditions adds `+1` to the progress of the corresponding condition (`progress[conditionId]`). Currently, the system does not support conditions based on total weight or fish length.
- **Cross-quest progress**: If a single catch qualifies for multiple active quests, progress is updated in all of them simultaneously within the same transaction.
- **Auto-completion**: As soon as all quest conditions satisfy `progress[condId] >= target`, the quest is marked as `isCompleted: true`.
- **Incomplete quests only**: Progress updates only run for quests where `isCompleted: false`.

### 3. Rewards & Level-Up

When `executeClaimRewardTx` is executed:

- **Atomicity**: Currency (`moneyReward`) and XP (`xpReward`) are credited in a single transaction with profile locking (`FOR UPDATE`).
- **Double validation**: Inside the transaction, the system re-checks that the quest is completed and not yet claimed to prevent duplicate rewards.
- **Race condition protection**: `SELECT ... FOR UPDATE` locks the player's profile at the database level until the reward is fully distributed.
- **Multi-level scaling**: If the XP from a quest is enough to advance multiple levels at once, the system calculates each level sequentially using `getXpNeededForLevel(level) = Math.floor(100 * Math.pow(level, 1.5))`, accounting for the increasing XP threshold at each level.

### 4. Localization Mapping

The `getPlayerQuests` service method:

1. Fetches player quests with quest translations filtered by language.
2. For each quest, extracts `title` and `description` from the first available translation (empty strings if none found).
3. For each condition, resolves the `label` — if it's a JSON object `{ uk: "...", en: "..." }`, picks the label matching the user's language with English fallback.
4. Returns flattened quest objects with direct `title`, `description`, and localized `conditions`.

## 📡 Endpoints

| Method | Path            | Description                            | Access |
| :----- | :-------------- | :------------------------------------- | :----- |
| `GET`  | `/quests`       | List of the user's quests with progress | User   |
| `POST` | `/quests/claim` | Claim the reward for a completed quest | User   |

Both endpoints require JWT authentication. The claim endpoint accepts `playerQuestId` in the request body and returns the updated full player profile.

## 📦 Schemas & DTOs

- **PlayerQuestResponseDto** (Zod): Returns quest details along with the player's current progress — includes `id`, `profileId`, `questId`, `progress`, `isCompleted`, `isClaimed`, and nested `quest` object with localized `title`, `description`, `conditions`, `xpReward`, `moneyReward`, `imageUrl`.
- **PlayerProfileResponseDto**: Returned by the claim endpoint — full profile with updated XP, level, and money.

## 💡 Developer Tip

When creating new quest types in the database, make sure:

1. The `value` in the condition JSON exactly matches the fish species ID or method name you are tracking in `GameEntity`.
2. Each condition has a unique `id` — this ID is used as the key in the `progress` JSON object.
3. The `label` field should be a `{ uk: "...", en: "..." }` object for proper localization on both languages.
4. For `CATCH_SPECIES_ON_LAKE` conditions, always include the `lakeId` field.
