# 📰 Fishoria API: News Module

The News module is designed for managing game announcements, news, and updates.

## 🚀 Key Features

- **Multilingual support**: Each news item can have translations in multiple languages (`uk`, `en`). The system automatically returns the correct version based on the requested language.
- **Publication status**: Draft support via the `isPublished` field. Players only see published news.
- **Media**: Image support for each news item via `imageUrl`.
- **Automatic flattening**: The server flattens the translation structure before sending it to the client.
- **Language query parameter**: Language can be specified via `?lang=` query parameter.
- **Role-based creation**: Only users with the `MODERATOR` role can create news.

## 🛠 Technical Details

### 1. Localization (`mapLocalized`)

Like other modules, news items use a `NewsTranslation` table.
The module's distinctive feature is the `mapLocalized` method, which:

1. Takes the first available translation from the result set (already filtered by language at the database query level).
2. Substitutes empty strings if no translation is found, so the frontend doesn't break.
3. Returns a flat object with direct `title` and `content` fields instead of `translations: [...]`.

### 2. Language Filtering

News endpoints support language selection via query parameter:

- `GET /news?lang=uk` — returns news with Ukrainian translations.
- `GET /news?lang=en` — returns news with English translations.
- If no `lang` parameter is provided, defaults to `en`.

### 3. Creating News

When creating a news item via `POST /news`, the system accepts objects with translations:

```json
{
  "title": { "uk": "Заголовок", "en": "Title" },
  "content": { "uk": "Текст", "en": "Text" },
  "imageUrl": "https://...",
  "isPublished": true
}
```

This allows creating a news item for all language versions of the site in a single request. The system iterates over all keys in the `title` object to determine the available languages and creates a `NewsTranslation` record for each.

### 4. Ordering

Published news is returned sorted by `createdAt` in descending order (newest first).

## 📡 Endpoints

| Method | Path        | Description                      | Access    |
| :----- | :---------- | :------------------------------- | :-------- |
| `GET`  | `/news`     | List of all published news items | Public    |
| `GET`  | `/news/:id` | Details of a specific news item  | Public    |
| `POST` | `/news`     | Create a new news item           | Moderator |

### Query Parameters

- `lang` (optional, string) — Language code for translations (e.g., `uk`, `en`). Defaults to `en`.

## 📦 Schemas

- **NewsResponseDto**: Describes a news object with localized `title` and `content` fields, plus `id`, `imageUrl`, `isPublished`, `createdAt`, `updatedAt`.

## 💡 Developer Tip

When creating news through the admin panel, always provide both languages (`uk`, `en`) to ensure the best experience for all players. The news creation requires the `MODERATOR` role — use `@Roles('MODERATOR')` decorator with `RolesGuard`.
