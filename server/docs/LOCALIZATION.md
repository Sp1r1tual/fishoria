# 🌍 Fishoria API: Localization System (i18n)

The Fishoria project supports multilingual content at the database and business logic levels. The primary languages are `uk` (Ukrainian) and `en` (English).

## 🚀 How It Works

The localization system is built on three layers:

### 1. Database Layer (Prisma Tables)

Instead of storing text directly in the main tables, we use dedicated translation tables:

- `QuestTranslation` (title, description) — linked to `Quest` via `questId + language` unique key.
- `AchievementTranslation` (title, description) — linked to `Achievement` via `achievementId + language` unique key.
- `NewsTranslation` (title, content) — linked to `News` via `newsId + language` unique key.

This allows adding any number of languages without changing the structure of core game entities.

### 2. User Layer

Every `User` has a `language` field (default: `en`). This language is set during registration or via `POST /player/language` and takes priority for all requests made by that user.

Supported values: `en` | `uk` (validated by `UpdateLanguageDto`).

### 3. Mapping Layer (`PlayerMapper` / `mapLocalized`)

This is the heart of the system. When a client requests data, the mapper:

1. Retrieves translations from the database, pre-filtered by the user's language at the query level (`where: { language }`).
2. Selects the first available translation from the result set.
3. If no translation exists for that language — returns empty strings (for profile mapper) or falls back to English (`en`) where applicable.
4. Flattens the structure: instead of a `translations: [...]` array, the frontend receives direct `title` and `description` fields.

This approach is used consistently across all modules:

| Module       | Mapper Method          | Translates                     |
| :----------- | :--------------------- | :----------------------------- |
| Player       | `mapPlayerProfile`     | Quest titles, conditions, achievement titles |
| Quest        | `getPlayerQuests`      | Quest title, description, condition labels |
| News         | `mapLocalized`         | News title, content            |
| Achievements | `mapLocalized`         | Achievement title, description |

## 🛠 Technical Details

### Special Fields (JSON)

For complex structures such as quest conditions (`conditions`), we use JSON fields where labels are stored in both languages at once:

```json
{
  "label": {
    "uk": "Вилови Коропа",
    "en": "Catch a Carp"
  }
}
```

The mapper automatically unpacks such JSON and returns the string in the required language. If the user's language is not found in the object, the system falls back to `en`.

### Error Localization

The server does not return raw error text. Instead, it returns i18n keys (e.g., `landing.auth.errors.incorrectPassword`). This allows the frontend to display messages independently using its local JSON dictionaries.

Known error keys:

- `landing.auth.errors.userNotFound`
- `landing.auth.errors.googleAccount` (password login attempted on Google-only account)
- `landing.auth.errors.incorrectPassword`
- `landing.auth.errors.emailNotActivated`
- `landing.auth.errors.accountBanned`
- `landing.auth.errors.userAlreadyExists`
- `landing.auth.errors.invalidActivationLink`
- `landing.auth.errors.invalidResetToken`
- `auth.resetLinkSent`
- `auth.passwordUpdated`

### Email Localization

Email subjects and templates are localized using a simple check:

```typescript
const isUa = lang === 'ua'; // Note: uses 'ua' code for Ukrainian in emails
```

Both activation and password reset emails have Ukrainian and English versions of subjects and template content.

## 📡 How to Change the Language?

The language is changed via `POST /player/language` with body `{ "language": "uk" }` or `{ "language": "en" }`. This updates the `language` field in the `User` table. All subsequent profile and quest calls will automatically return data in the new language.

The language is also passed as part of the JWT payload (`language` claim), enabling decorators like `@GetUser('language')` to extract it without an additional database query.

## 💡 Developer Tip

When adding new quests or achievements to the database (via seeders), always create the corresponding records in the relevant `Translation` tables — otherwise the frontend will receive empty strings.

For news, the `?lang=` query parameter can override the language for public endpoints without requiring authentication.
