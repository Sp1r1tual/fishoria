# 👤 Fishoria API: Player Module

The Player module is responsible for managing the player's profile, progress (XP, level-up), language preferences, and preparing data for display.

## 🚀 Key Features

- **Player profile**: Returns complete game data (inventory, quests, achievements, catches, lake stats) in a single request.
- **Starter Kit**: Automatically creates a profile for new players with starting capital and gear, including auto-equip.
- **Auto-equip**: The system automatically equips new players with a starter set (first rod, reel, line, hook) on first login.
- **Quest synchronization**: Automatically adds new global quests to the player's list when the profile is viewed.
- **Progress system**: Experience calculation and automatic level-up with progressive thresholds.
- **Mapping & localization**: Smart transformation of database data (translations, quest conditions) based on the user's language.
- **Profile updates**: Avatar and nickname changes with validation.
- **Language switching**: Dedicated endpoint for changing the user's display language.
- **Profile reset**: Full profile deletion and recreation for testing/debugging.
- **Moderator tools**: Money injection endpoint restricted to `MODERATOR` role.

## 🛠 Technical Details

### 1. XP & Level Mechanics

The level calculation logic is encapsulated in `player-experience.util.ts`:

```typescript
// XP required for next level:
const xpNeeded = Math.floor(100 * Math.pow(level, 1.5));
```

Examples: Level 1 → 100 XP, Level 5 → 1118 XP, Level 10 → 3162 XP.

When experience is added (via `addXp`), the system loops: if XP exceeds the threshold, the level is incremented and the remaining XP carries over. This supports **multi-level jumps** — if a single catch or quest reward earns enough XP for multiple levels, all are applied.

### 2. Profile Creation & Starter Kit

On first `getProfile` call, if no profile exists:

1. A new `PlayerProfile` is created with starting values from `starter-kit.ts` (100 gold, Level 1, 0 XP).
2. All starter gear and consumables are attached.
3. The first rod, reel, line, and hook are automatically equipped.
4. **Race condition handling**: If a `P2002` (unique constraint) error occurs during creation (concurrent requests), the existing profile is fetched instead.

### 3. Mapper (`mapPlayerProfile`)

This is the core part of the module. The mapper handles the following:

- Selects the correct translation for quests and achievements based on the user's language.
- Processes quest conditions (`conditions`), substituting localized labels from JSON `{ uk: "...", en: "..." }` objects.
- Falls back to English (`en`) when the user's language translation is missing.
- Transforms complex Prisma structures into flat objects suitable for the frontend — direct `title` and `description` fields instead of `translations: [...]` arrays.

### 4. Automatic Synchronization (`syncQuests`)

Every time `getProfile` is called, the server:

1. Counts all available quests in the database.
2. Compares against the number of quests the player has.
3. If new quests have appeared that the player doesn't have yet, they are assigned automatically via `createMany` with `skipDuplicates: true`.

### 5. Query Optimization (`FULL_PROFILE_INCLUDE`)

A single constant `FULL_PROFILE_INCLUDE` is used to fetch all profile data in one query:

- `gearItems`, `consumables`, `fishCatches`, `lakeStats`
- `playerQuests` (with `quest` → `translations`)
- `playerAchievements` (with `achievement` → `translations`)
- `user` (selected fields: `id`, `email`, `username`, `avatar`, `role`, `isActivated`, `language`)

### 6. Profile Response Enrichment

The `GET /player/profile` endpoint appends `expiresIn` (JWT access token TTL in milliseconds) to the response, enabling the frontend to schedule token refresh.

## 📡 Endpoints

| Method | Path               | Description                                       | Access    |
| :----- | :----------------- | :------------------------------------------------ | :-------- |
| `GET`  | `/player/profile`  | Retrieve the full player profile (with expiresIn) | User      |
| `POST` | `/player/update`   | Update profile data (username, avatar)            | User      |
| `POST` | `/player/language` | Change the user's display language                | User      |
| `POST` | `/player/reset`    | Delete and recreate the player profile            | User      |
| `POST` | `/player/add-money`| Add currency to a player's balance                | Moderator |

All endpoints return the updated profile or operation result.

## 📦 Schemas & DTOs

- **PlayerProfileResponseDto** (Zod): Describes the full profile structure — includes gear items, consumables, fish catches, lake stats, player quests (with localized conditions), player achievements (with localized text), and user info.
- **UpdateProfileDto**: `username?` (string, 3-20 chars), `avatar?` (string URL).
- **UpdateLanguageDto**: `language` (enum: `en` | `uk`).
- **AddMoneyDto**: `targetUserId?` (UUID, optional — defaults to the moderator's own account), `amount` (integer, 1–1,000,000).

## 💡 Developer Notes

When adding new relations to the `User` or `PlayerProfile` model in Prisma, always update `FULL_PROFILE_INCLUDE` in `player.constants.ts` and the corresponding schema in `profile-response.dto.ts`.

The profile reset endpoint (`POST /player/reset`) deletes the entire profile and recreates it with the starter kit — all catches, stats, quests, and achievements are lost. Use with caution.
