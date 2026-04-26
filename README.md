# Fishoria – A Fishing Simulator in Your Browser

**Fishoria** is not just another browser game. It is a highly interactive, state-of-the-art web-based fishing simulator, blending mesmerizing WebGL graphics with uncompromised gameplay realism.

Feel the adrenaline rush of fighting a trophy catch, carefully select your tackle, and adapt to changing weather conditions. Fishoria is designed to deliver a genuine fishing experience directly in your browser.

---

<p align="center">
  <img src="https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/marketing/fishoria_collage.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL21hcmtldGluZy9maXNob3JpYV9jb2xsYWdlLnBuZyIsImlhdCI6MTc3NTU5MDQ5NSwiZXhwIjo0ODk3NjU0NDk1fQ.aMFBQtMbMo_aVJi9cA8ZKxtbAdVYF1DOJMrAlsuDkPs" alt="Fishoria" />
</p>

---

## Why Will Fishoria Hook You From the First Minute?

**Living Ecosystem & Advanced Fish AI**
Forget boring, predictable algorithms. The fish in Fishoria have unique behavior profiles-varying in aggression, curiosity, and mobility. They adapt to environmental shifts: seeking preferred depths, reacting to weather changes, and following strict time-of-day activity cycles. Outsmarting each species requires the right strategy and perfect timing.

**The Ultimate Reeling Thrill**
This isn't just "click-to-catch". Our reeling mini-game calculates line tension physics, dynamic fish struggle forces, and the durability of every single piece of your tackle. Experience the depth of spinning where realistic retrieval techniques-jigging, stop-and-go, or steady pulling-directly dictate your success with predators. Pull too hard? Say goodbye to your favorite lure and the trophy.

**Three Distinct Fishing Styles**
Float, feeder, or spinning? Each fishing method features unique physics and behavior. Watch the micro-dips of the float, observe the tension on the feeder quiver tip, or experiment with various spinning retrieval techniques.

**A Dynamic, Breathing World**
Sun setting and the sky getting cloudy? Brace for rain! The weather completely alters ecosystem behavior, predator activity, and bite probabilities, creating a unique atmosphere accompanied by dynamic audio.

**Deep Economy & Progression**
Start with a basic float rod, but as you progress-gain experience ($XP$), complete quests, earn in-game currency, and purchase professional gear in the shop. Don't forget maintenance: every epic struggle with a monster fish progressively wears down your arsenal!

**Ecosystem Surprises**
Rewarding experiences are sometimes purely unexpected. Instead of a trophy carp, you might reel in an old boot or snag on an underwater branch. A complex quest system encourages you to explore every single corner of the lake.

**Global Community & Personalization**
Fast and secure registration (including Google OAuth), cloud saving for your profile with custom avatar uploads (Supabase Storage), and detailed statistics. Compete against others, break your own personal records, and build a collection of the rarest fish species.

**Full Immersion: Visuals & Audio**
We have polished every single detail: water droplets streaming down your screen, the iconic sound of the reel drag screaming when a fish pulls, and even meteor showers lighting up the night sky. The ambient sounds dynamically adapt to the weather.

---

## Tech Stack

### Client – Frontend Engine

| Category          | Technology                                                                           |
| :---------------- | :----------------------------------------------------------------------------------- |
| **UI Framework**  | [React 19](https://react.dev/) with React Compiler (auto-memoization)                |
| **Bundler**       | [Vite 8](https://vite.dev/)                                                          |
| **Rendering**     | [PixiJS 8](https://pixijs.com/) – WebGL 2D graphics, particle systems                |
| **State**         | [Redux Toolkit](https://redux-toolkit.js.org/) – global game state                   |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query) – server state, caching              |
| **Routing**       | [React Router 7](https://reactrouter.com/)                                           |
| **i18n**          | [i18next](https://www.i18next.com/)                                                  |
| **Forms**         | [React Hook Form](https://react-hook-form.com/)                                      |
| **Math**          | [simplex-noise](https://github.com/jwagner/simplex-noise.js) – procedural generation |
| **Language**      | TypeScript 5                                                                         |

### Server – Backend Core

| Category       | Technology                                                                     |
| :------------- | :----------------------------------------------------------------------------- |
| **Framework**  | [NestJS 11](https://nestjs.com/)                                               |
| **ORM**        | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`                   |
| **Database**   | [PostgreSQL (Supabase)](https://supabase.com/)                                 |
| **Caching**    | [Redis (Upstash)](https://upstash.com/) – REST-based                           |
| **Validation** | [Zod 4](https://zod.dev/) & [nestjs-zod](https://github.com/risen7/nestjs-zod) |
| **Auth**       | [Passport.js](https://www.passportjs.org/) – JWT, Google OAuth, Local          |
| **Mailing**    | [Nodemailer](https://nodemailer.com/) – Gmail SMTP                             |
| **Language**   | TypeScript 5                                                                   |

### DevOps & Quality

| Category        | Technology                                                                      |
| :-------------- | :------------------------------------------------------------------------------ |
| **Hosting**     | [Vercel](https://vercel.com/) – client & server deployments                     |
| **Git Hooks**   | [Husky](https://typicode.github.io/husky/) – pre-commit automation              |
| **Lint Staged** | [lint-staged](https://github.com/lint-staged/lint-staged) – incremental linting |
| **Linting**     | ESLint 9 + Prettier                                                             |
| **Unused Code** | [Knip](https://knip.dev/) – dead export & dependency detection                  |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Yarn** (package manager)
- **PostgreSQL** database (or [Supabase](https://supabase.com/) account)
- **Redis** instance (or [Upstash](https://upstash.com/) account)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/fishoria.git
cd fishoria

# Install root dependencies (Husky, lint-staged)
yarn install

# Install client dependencies
cd client && yarn install && cd ..

# Install server dependencies
cd server && yarn install && cd ..
```

### 2. Configure Environment

```bash
# Client
cp client/.env.example client/.env

# Server
cp server/.env.example server/.env
```

Edit both `.env` files with your credentials. See each directory's README for details.

### 3. Database Setup

```bash
cd server

# Apply migrations
yarn prisma:migrate

# Generate Prisma client
yarn prisma:generate

# Seed initial data (news, quests, achievements)
yarn prisma:seed
```

### 4. Run in Development

```bash
# Terminal 1 – Start the API server (port 5000)
cd server && yarn dev

# Terminal 2 – Start the client dev server (port 5173)
cd client && yarn dev
```

Open `http://localhost:5173` in your browser and start fishing!

---

## Available Scripts

### Root (Monorepo)

| Command                   | Description                     |
| :------------------------ | :------------------------------ |
| `yarn translations:check` | Check i18n translation coverage |
| `yarn prepare`            | Install Husky git hooks         |

### Client (`/client`)

| Command                  | Description                       |
| :----------------------- | :-------------------------------- |
| `yarn dev`               | Start Vite dev server             |
| `yarn build`             | Lint + compile + production build |
| `yarn preview`           | Preview production build locally  |
| `yarn lint` / `lint:fix` | ESLint check / auto-fix           |
| `yarn format`            | Format with Prettier              |
| `yarn convert`           | Convert images to WebP            |
| `yarn knip`              | Detect unused code                |

### Server (`/server`)

| Command                  | Description                   |
| :----------------------- | :---------------------------- |
| `yarn dev`               | Start in watch mode           |
| `yarn build`             | Lint + compile + NestJS build |
| `yarn start:prod`        | Run production build          |
| `yarn lint` / `lint:fix` | ESLint check / auto-fix       |
| `yarn format`            | Format with Prettier          |
| `yarn prisma:migrate`    | Run database migrations       |
| `yarn prisma:generate`   | Generate Prisma client        |
| `yarn prisma:seed`       | Seed database                 |
| `yarn prisma:studio`     | Open Prisma Studio GUI        |
| `yarn knip`              | Detect unused code            |

---

## Documentation

| Document                                                                | Description                                |
| :---------------------------------------------------------------------- | :----------------------------------------- |
| [Client README](./client/README.md)                                     | Frontend architecture, game engine, UI     |
| [Server README](./server/README.md)                                     | Backend API, all endpoints, setup          |
| [In-Game Terminal Commands](./docs/CLIENT_IN_GAME_TERMINAL_COMMANDS.md) | Debug shell commands reference             |
| [Server Internal Wiki](./server/docs/)                                  | 12 detailed module docs (auth, game, etc.) |

---

## License

This project is licensed under the License – see the [LICENCE](./LICENCE) file for details.
