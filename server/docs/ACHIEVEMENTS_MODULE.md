# 🏆 Fishoria API: Achievements Module

The Achievements module provides a system of in-game achievements that are automatically awarded to players for specific actions or reaching certain goals.

## 🚀 Key Features

- **Automatic awarding**: Achievement checks are integrated directly into the game loop (fish catching and gear breakage).
- **Special conditions**: Support for achievements not only for catching fish, but also for "reckless" behavior or using broken equipment.
- **Localization**: Achievement names and descriptions are fetched from the database based on the user's language.
- **Backward compatibility**: Achievements are awarded atomically within the same transaction as the fish catch.
- **Dedicated listing**: Players can retrieve the full list of all available achievements with localized text via a dedicated endpoint.

## 🛠 Technical Details

### 1. Check on Catch (`checkAndAssignCatchAchievements`)

Every time a player catches a fish, `AchievementEntity` evaluates the conditions. Examples of system codes:

- `sportsman_fisher`: Awarded for catching a trophy fish. A fish is considered a trophy if `sizeRank === 'trophy'` or its weight exceeds 75% of the species' maximum weight (`maxWeight`).

### 2. Check on Break (`checkAndAssignRecklessAchievement`)

When a gear breakage event occurs (rod, reel, line, or hook), the system checks for the `reckless` achievement and awards it if the player hasn't received it yet.

### 3. Duplicate Protection

To prevent a player from receiving the same achievement more than once:

- **Unique Constraint**: A composite key `profileId_achievementId` in the `PlayerAchievement` table.
- **Pre-check**: Before creating a record, the entity checks whether the achievement already exists in the profile to avoid transaction errors.

### 4. Ordering and Images

- **Order**: The `order` field allows sorting achievements by difficulty or type.
- **ImageUrl**: Each achievement has a link to an icon displayed on the player's profile.

### 5. Localization Mapping (`mapLocalized`)

When returning achievements, the service:

1. Fetches all achievements with translations filtered by the requested language.
2. Takes the first available translation from the result set.
3. If no translation is found, returns empty strings for `title` and `description`.
4. Flattens the structure: instead of a `translations: [...]` array, the response contains direct `title` and `description` fields.

## 📡 Endpoints

| Method | Path            | Description                                   | Access |
| :----- | :-------------- | :-------------------------------------------- | :----- |
| `GET`  | `/achievements` | Retrieve all achievements with localized text | User   |

Achievements are also returned as part of the player profile via `GET /player/profile` (through the `playerAchievements` field).

## 📦 Schemas & DTOs

- **AchievementResponseDto** (Zod): Describes the response structure – `id`, `code`, `imageUrl`, `order`, `title`, `description`, `createdAt`, `updatedAt`.

## 💡 Developer Tip

All achievements are identified by a unique `code` (e.g., `sportsman_fisher`, `reckless`). When adding a new achievement to the database, make sure the code in the seeder (`seeders/achievements.ts`) matches the code you are checking in `AchievementEntity`.

Achievements do not grant in-game benefits (XP or currency) unless this is explicitly defined in the transaction logic.
