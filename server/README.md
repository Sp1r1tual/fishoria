# Fishoria — API Server

**The robust backend engine powering the Fishoria interactive fishing simulator.** Built with NestJS 11 and Prisma 7 for high performance, scalability, and type-safe database interactions.

---

## About the API

This repository contains the server-side code for Fishoria. It manages game state, player progression, authentication, and provides a secure RESTful API for the frontend client. The architecture is designed to be modular and scalable, ensuring a smooth experience even as the player base grows.

The server also features a built-in **Admin Dashboard** at the root URL with real-time player statistics and an integrated Internal Wiki that renders documentation from the `docs/` directory.

---

## Features

- 🔐 **Secure Authentication** — multi-strategy auth including Google OAuth 2.0, JWT with refresh token rotation, and Local login with email activation
- 🛡️ **CSRF Protection** — automatic CSRF token middleware + guard for cookie-based clients, bypassed for Bearer token (mobile)
- 👤 **Player Management** — comprehensive profile handling, auto-generated starter kits, catch statistics, and XP-based level progression
- 🎣 **Game Logic Engine** — authoritative handling of fishing results, gear durability, bait consumption, lake diary, and trophy detection
- 🎒 **Inventory System** — management of rods, reels, lines, hooks, lures, repair kits, bait, and groundbait with batch equip support
- 🛒 **In-Game Economy** — shop for purchasing gear/consumables and selling fish with species-specific price multipliers
- 🏆 **Progression Tracking** — achievements (automatic awarding) and quests system (3 condition types) with atomic reward distribution
- 🌍 **Localization (i18n)** — full multilingual support (Ukrainian / English) at the database level via translation tables
- 🛡️ **Security & Optimization** — rate limiting (Throttler), password hashing (bcrypt), Redis ban cache, row-level locking for all transactions
- 📧 **Communication** — automated email notifications (activation, password reset) via Nodemailer with localized HTML templates
- 📰 **Content Management** — news system with draft/publish status, localized content, and role-based creation (Moderator)
- 📊 **Admin Dashboard** — server-rendered HTML dashboard with player stats, internal wiki, and Swagger API explorer link

---

## Tech Stack

| Category       | Technology                                                                     |
| :------------- | :----------------------------------------------------------------------------- |
| **Framework**  | [NestJS 11](https://nestjs.com/)                                               |
| **ORM**        | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`                   |
| **Database**   | [PostgreSQL (Supabase)](https://supabase.com/)                                 |
| **Caching**    | [Redis (Upstash)](https://upstash.com/) — REST-based                           |
| **Validation** | [Zod 4](https://zod.dev/) & [nestjs-zod](https://github.com/risen7/nestjs-zod) |
| **Auth**       | [Passport.js](https://www.passportjs.org/) — JWT, Google OAuth, Local          |
| **Mailing**    | [Nodemailer](https://nodemailer.com/) — Gmail SMTP                             |
| **Docs**       | [Swagger / OpenAPI](https://swagger.io/) via `@nestjs/swagger`                 |
| **Markdown**   | [marked](https://marked.js.org/) — for admin wiki rendering                    |
| **Language**   | TypeScript 5                                                                   |

---

## Getting Started

### 1. Installation

```bash
cd server
yarn install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Configure all required variables — see `.env.example` for descriptions. Key groups:

| Group        | Variables                                                                                                                     |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Server**   | `PORT`, `NODE_ENV`                                                                                                            |
| **URLs**     | `API_URL`, `CLIENT_URL`, `COOKIE_DOMAIN`                                                                                      |
| **Database** | `DATABASE_URL`, `POOLER_DATABASE_URL`                                                                                         |
| **Redis**    | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                                                                          |
| **Google**   | `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET`, `GOOGLE_CALLBACK_URL`                                                                    |
| **JWT**      | `JWT_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`, `JWT_RESET_SECRET`, `JWT_RESET_TOKEN_EXPIRATION` |
| **Mail**     | `SMTP_USER`, `SMTP_PASSWORD`                                                                                                  |

> All variables are validated on startup via Zod. The server will refuse to start if any required variable is missing or invalid.

### 3. Database Setup

```bash
# Apply migrations
yarn prisma:migrate

# Generate Prisma client
yarn prisma:generate

# Seed the database (news, quests, achievements)
yarn prisma:seed
```

### 4. Development Mode

```bash
yarn dev
```

The API will be available at `http://localhost:5000`.

---

## Available Scripts

| Command                | Description                              |
| :--------------------- | :--------------------------------------- |
| `yarn dev`             | Start in watch mode                      |
| `yarn build`           | Lint + compile TypeScript + NestJS build |
| `yarn start:prod`      | Run production build                     |
| `yarn lint`            | Run ESLint                               |
| `yarn lint:fix`        | Run ESLint with auto-fix                 |
| `yarn format`          | Format code with Prettier                |
| `yarn prisma:generate` | Generate Prisma client                   |
| `yarn prisma:migrate`  | Run database migrations                  |
| `yarn prisma:push`     | Push schema to DB (no migration)         |
| `yarn prisma:studio`   | Open Prisma Studio GUI                   |
| `yarn prisma:seed`     | Seed database with initial data          |
| `yarn test`            | Run Jest tests                           |
| `yarn knip`            | Check for unused dependencies/exports    |

---

## Architecture Highlights

### Modular Design

Each game feature is encapsulated in its own NestJS module following a consistent pattern:

```
module/
├── module.module.ts       # Module definition & DI registration
├── module.controller.ts   # HTTP endpoints (thin layer)
├── module.service.ts      # Business logic
├── entities/              # Database operations (Prisma queries)
└── dto/                   # Request/response schemas (Zod)
```

### Transaction Safety

All financial and game-critical operations use **row-level locking** (`SELECT ... FOR UPDATE`) within Prisma `$transaction` blocks. This prevents:

- Duplicate rewards from concurrent requests
- Race conditions during purchases/sales
- Inventory corruption during equip/repair operations

### Security Layers

```
Request → ThrottlerGuard → CsrfMiddleware → CsrfGuard → JwtAuthGuard → RolesGuard → Controller
```

1. **ThrottlerGuard** — 100 req/min global, tighter on auth endpoints (5-10 req/min)
2. **CsrfMiddleware** — generates `XSRF-TOKEN` cookie on first request
3. **CsrfGuard** — validates `x-xsrf-token` header (skipped for Bearer / GET / public routes)
4. **JwtAuthGuard** — validates JWT from Cookie or Bearer header, checks Redis ban status
5. **RolesGuard** — validates `UserRole` (PLAYER / MODERATOR) when `@Roles()` is applied

---

## Documentation

Detailed module documentation is available in the `docs/` directory and via the Admin Dashboard:

| Document                                                  | Description                       |
| :-------------------------------------------------------- | :-------------------------------- |
| [AUTH_MODULE.md](docs/AUTH_MODULE.md)                     | Authentication & authorization    |
| [PLAYER_MODULE.md](docs/PLAYER_MODULE.md)                 | Player profiles & progression     |
| [GAME_MODULE.md](docs/GAME_MODULE.md)                     | Fishing mechanics & transactions  |
| [INVENTORY_MODULE.md](docs/INVENTORY_MODULE.md)           | Equipment & consumable management |
| [SHOP_MODULE.md](docs/SHOP_MODULE.md)                     | In-game economy                   |
| [QUEST_MODULE.md](docs/QUEST_MODULE.md)                   | Quest system & rewards            |
| [ACHIEVEMENTS_MODULE.md](docs/ACHIEVEMENTS_MODULE.md)     | Achievement system                |
| [NEWS_MODULE.md](docs/NEWS_MODULE.md)                     | News & announcements              |
| [MAIL_MODULE.md](docs/MAIL_MODULE.md)                     | Email services                    |
| [LOCALIZATION.md](docs/LOCALIZATION.md)                   | i18n system                       |
| [COMMON_INFRASTRUCTURE.md](docs/COMMON_INFRASTRUCTURE.md) | Shared services & configs         |
| [DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md) | Database design & models          |

---

## License

This project is licensed under the License – see the [LICENCE](../LICENCE) file for details.
