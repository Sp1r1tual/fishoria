# 🗄 Fishoria API: Database Architecture

The project uses **PostgreSQL** and **Prisma ORM**. The architecture is designed for high performance under a large volume of game transactions.

## 🚀 Core Principles

### 1. Decentralization of Game Data

The database does not contain models for "static" game data, such as a full list of fish species or lake descriptions.

- **Why?** This keeps the frontend flexible and frees the server from validating every name. Data is stored on a "catch it, record it" basis.
- **Result**: Fewer JOIN queries and a simpler database structure.

### 2. Indexing for Analytics

The `fish_catches` table is the most heavily loaded. To keep statistics and leaderboards fast, indexes are added on:

- `profileId` (searching catches by a specific player);
- `speciesId` (analytics by fish species);
- `lakeId` (location statistics);
- `caughtAt` (time-based filtering).

Additional indexes across other tables:

- `users`: `createdAt`, `role`.
- `user_bans`: `userId`, `bannedById`, composite `userId + expiresAt`.
- `gear_items`: `profileId`, `itemType`, `itemId`.
- `news`: composite `isPublished + createdAt`.
- `quests`, `achievements`: `order`.
- `player_quests`: `questId`.
- `player_achievements`: `achievementId`.

### 3. Integrity & Transactions

All financial and game operations use row-level locking (via `$executeRaw` and `FOR UPDATE`). This guarantees:

- No duplicate rewards.
- Correct XP calculation during concurrent actions.
- Inventory integrity during equip/unequip operations.
- Safe money operations during purchases and sales.

### 4. Multilingual Support (Translation Tables)

For entities where text is controlled by the server (`News`, `Quest`, `Achievement`), separate translation tables are used with a unique composite key `{entityId, language}`:

- `NewsTranslation` (`newsId`, `language`) → `title`, `content`
- `QuestTranslation` (`questId`, `language`) → `title`, `description`
- `AchievementTranslation` (`achievementId`, `language`) → `title`, `description`

## 🛠 Data Models

### Core Models

| Model              | Table                  | Description                                    |
| :----------------- | :--------------------- | :--------------------------------------------- |
| `User`             | `users`                | Authentication, role, language, profile link    |
| `PlayerProfile`    | `player_profiles`      | Game progress, equipment, currency             |
| `RefreshToken`     | `refresh_tokens`       | JWT refresh tokens with rotation and revocation |
| `PasswordResetToken`| `password_reset_tokens`| Password reset tokens with expiration           |
| `UserBan`          | `user_bans`            | Ban records with reason, issuer, and optional expiration |

### Game Models

| Model              | Table                  | Description                                    |
| :----------------- | :--------------------- | :--------------------------------------------- |
| `GearItem`         | `gear_items`           | Unique items (rod, reel, line, hook, repair_kit) with condition/meters |
| `ConsumableItem`   | `consumable_items`     | Stackable items (bait, groundbait) with quantity |
| `FishCatch`        | `fish_catches`         | Catch records with species, weight, length, lake, method, bait |
| `LakeStatistic`    | `lake_statistics`      | Per-lake stats with JSON fields for records, counts, weights |

### Content Models

| Model              | Table                  | Description                                    |
| :----------------- | :--------------------- | :--------------------------------------------- |
| `News`             | `news`                 | Game announcements with publish status         |
| `Quest`            | `quests`               | Quest definitions with conditions (JSON) and rewards |
| `Achievement`      | `achievements`         | Achievement definitions with unique codes      |
| `PlayerQuest`      | `player_quests`        | Player quest progress (JSON) and completion status |
| `PlayerAchievement`| `player_achievements`  | Earned achievements per player                 |

### Enums

- **`UserRole`**: `PLAYER` | `MODERATOR`

## 🛠 Relationship Schema

```
User (1) <-> (1) PlayerProfile (Central node)
User (1) <-> (N) RefreshToken
User (1) <-> (N) PasswordResetToken
User (1) <-> (N) UserBan (as banned user)
User (1) <-> (N) UserBan (as moderator who issued ban)

PlayerProfile <-> (N) GearItem
PlayerProfile <-> (N) ConsumableItem
PlayerProfile <-> (N) FishCatch
PlayerProfile <-> (N) LakeStatistic
PlayerProfile <-> (N) PlayerQuest
PlayerProfile <-> (N) PlayerAchievement

Quest (1) <-> (N) QuestTranslation
Quest (1) <-> (N) PlayerQuest
News (1) <-> (N) NewsTranslation
Achievement (1) <-> (N) AchievementTranslation
Achievement (1) <-> (N) PlayerAchievement
```

### Key JSON Fields

- **`LakeStatistic.records`**: `{ speciesId: maxWeight }` — per-species max weight records.
- **`LakeStatistic.minWeights`**: `{ speciesId: minWeight }` — per-species min weight.
- **`LakeStatistic.speciesCounts`**: `{ speciesId: count }` — per-species catch count.
- **`LakeStatistic.speciesWeights`**: `{ speciesId: totalWeight }` — per-species cumulative weight.
- **`Quest.conditions`**: `IQuestCondition[]` — array of condition objects defining quest requirements.
- **`PlayerQuest.progress`**: `{ conditionId: currentCount }` — per-condition progress tracker.

### Key Constraints

- `ConsumableItem`: unique `[profileId, itemId]` — only one stack per item type per player.
- `LakeStatistic`: unique `[profileId, lakeId]` — one stats object per lake per player.
- `PlayerQuest`: unique `[profileId, questId]` — one quest assignment per player.
- `PlayerAchievement`: unique `[profileId, achievementId]` — one achievement per player.
- `NewsTranslation`: unique `[newsId, language]`.
- `QuestTranslation`: unique `[questId, language]`.
- `AchievementTranslation`: unique `[achievementId, language]`.

## 💡 Developer Tip

All models support `onDelete: Cascade`. To delete a player, simply remove the record from the `User` table — all associated game data will be cleaned up automatically at the database level.

The `FishCatch` model stores both `speciesId` and `speciesName`, and both `lakeId` and `lakeName`. This denormalization is intentional to avoid JOINs and keep queries fast, since species/lake definitions live on the client.
