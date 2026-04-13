# 🛠 Fishoria API: Common & Infrastructure

The `common` section contains infrastructure solutions and utilities shared across all other modules in the system.

## 🚀 Core Components

### 1. Prisma Service (`common/prisma`)

The central node for interacting with the PostgreSQL database.

- Implements `onModuleInit` to guarantee a database connection on server startup.
- Used as a DI provider across all Entity layers.

### 2. Redis Service (`common/redis`)

Provides an ultra-fast cache for critical data.

- Used to store active user bans with configurable TTL.
- Enables instant security state synchronization across multiple server instances.
- Powered by **Upstash Redis** (REST-based), configured via `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### 3. All Exceptions Filter (`common/filters`)

A global error catcher registered via `APP_FILTER`.

- Prevents the server from crashing on unhandled exceptions.
- Formats errors into a frontend-friendly JSON response with `statusCode`, `timestamp`, `path`, and `message`.
- Handles Prisma-specific errors:
  - `P2002` (Unique constraint violation) → `409 Conflict` with target field names.
  - `P2025` (Record not found) → `404 Not Found`.
- Logs critical errors (5xx) with stack traces, warns on 4xx (except 401).

### 4. Configurations (`common/configs`)

All global settings are extracted into separate files:

- **CORS Config** (`cors.config.ts`): Origin is set to `CLIENT_URL` from env (fallback: `http://localhost:5173`). Credentials are enabled. Allowed headers: `Content-Type`, `Authorization`, `x-xsrf-token`.
- **Swagger Config** (`swagger.config.ts`): API documentation with Cookie auth, Bearer auth, and XSRF token support. Available at `/docs`.
- **Prices Config** (`prices.config.ts`): Global price registry for all items (rods, reels, lines, hooks, lures, baits, groundbaits, gadgets). Contains `getItemPrice(itemId)` and `getFishSellPrice(speciesId, weight)` functions. Also exports `FISH_SPECIES_MULTIPLIERS` — per-species XP/sell multipliers.
- **Starter Kit** (`starter-kit.ts`): Defines the default gear and consumables given to new players on profile creation:
  - Starting values: `100` gold, Level `1`, `0` XP.
  - Gear: `rod_starter`, `rod_spinning_basic`, `reel_handmade`, `line_thread` (300m), `hook_rusted`, `lure_vibrotail`, `repair_kit`.
  - Consumables: `worm` ×10, `bread` ×5.
- **Env Validation** (`env.validation.ts`): Uses Zod to validate all required environment variables on startup. If any variable is missing or invalid, the server fails fast with a descriptive error.

### 5. Environment Variables Schema (`common/schemas/env.schema.ts`)

All environment variables are strictly typed and validated via Zod:

| Variable                       | Type    | Description                           |
| :----------------------------- | :------ | :------------------------------------ |
| `NODE_ENV`                     | enum    | `development` / `production` / `test` |
| `PORT`                         | string  | Server port                           |
| `CLIENT_URL`                   | URL     | Frontend URL                          |
| `API_URL`                      | URL     | Backend URL                           |
| `COOKIE_DOMAIN`                | string? | Cookie domain (optional)              |
| `DATABASE_URL`                 | URL     | Direct Prisma connection              |
| `POOLER_DATABASE_URL`          | URL     | Connection pooler URL                 |
| `UPSTASH_REDIS_REST_URL`       | URL     | Redis REST endpoint                   |
| `UPSTASH_REDIS_REST_TOKEN`     | string  | Redis auth token                      |
| `GOOGLE_CLIENT_ID`             | string  | Google OAuth client ID                |
| `GOOGLE_SECRET`                | string  | Google OAuth secret                   |
| `GOOGLE_CALLBACK_URL`          | URL     | Google OAuth callback URL             |
| `JWT_SECRET`                   | string  | Min 32 chars                          |
| `JWT_ACCESS_TOKEN_EXPIRATION`  | string  | e.g., `15m`                           |
| `JWT_REFRESH_TOKEN_EXPIRATION` | string  | e.g., `7d`                            |
| `JWT_RESET_SECRET`             | string  | Min 32 chars                          |
| `JWT_RESET_TOKEN_EXPIRATION`   | string  | e.g., `1h`                            |
| `SMTP_USER`                    | email   | Gmail SMTP user                       |
| `SMTP_PASSWORD`                | string  | Gmail app password                    |

### 6. Admin Dashboard (`common/templates`)

The root route (`GET /`) serves a server-rendered HTML admin dashboard:

- Displays total registered player count and server version (`v0.3.0`).
- Sidebar with **Internal Wiki** — lists all `.md` files from the `docs/` directory. Clicking a file fetches its content via `GET /api/docs-content/:filename`, renders it with `marked` (Markdown → HTML), and displays in a modal.
- Link to Swagger API documentation (`/docs`).
- Styled with a dark theme, glassmorphism, Inter font, and accent glow animations.

### 7. Seeding System (`common/seeding`)

Database seeding is handled by `seed.ts` which orchestrates three seeders:

- `seeders/news.ts` — Populates initial news items with translations.
- `seeders/quests.ts` — Creates quest definitions with conditions and translations.
- `seeders/achievements.ts` — Seeds achievement definitions with translations.

Uses a separate Prisma client with `@prisma/adapter-pg` for direct PostgreSQL pool access.

## 🛠 Utilities & Decorators

- **`GetUserId`**: Custom decorator that extracts the authenticated user's `id` from the JWT payload (`req.user.id`).
- **`GetUser`**: Custom decorator that extracts any field from the authenticated user object (e.g., `@GetUser('language')`).
- **`Roles`**: Custom decorator that sets required roles metadata on a route (e.g., `@Roles('MODERATOR')`). Used with `RolesGuard`.
- **`ZodValidationPipe`**: A pipe from `nestjs-zod` for validating incoming request data against Zod schemas. Applied per-endpoint.

## 📡 Root Endpoints

| Method | Path                      | Description                   | Access |
| :----- | :------------------------ | :---------------------------- | :----- |
| `GET`  | `/`                       | Admin Dashboard (HTML)        | Public |
| `GET`  | `/api/docs-content/:file` | Rendered markdown doc content | Public |
| `GET`  | `/favicon.ico`            | Favicon redirect              | Public |

## 📡 Logging

The project uses the built-in NestJS Logger to track system state:

- Server startup and database connection.
- Email sending errors (with full stack traces).
- Critical API errors (5xx).
- CSRF validation failures (via `console.warn`).

## 💡 Developer Tip

If you are adding a new global feature (e.g., a new Guard or Interceptor), make sure to register it in `AppModule` (via `APP_GUARD` / `APP_FILTER` providers or middleware consumer) so that it is available throughout the entire project.

When adding new environment variables, always update `env.schema.ts` to include validation — the server will refuse to start if the variable is missing.
