# Fishoria — Client

**The frontend application for the interactive web-based fishing simulator.** Built with React 19 and PixiJS 8 for a smooth and engaging fishing experience directly in your browser.

---

## About the Client

This repository contains the client-side code for Fishoria. It combines a custom WebGL game engine (built on PixiJS) with a modern React UI to deliver high-fidelity fishing gameplay. The architecture separates the game engine (rendering, physics, AI) from the application layer (state, routing, API), enabling both to evolve independently.

---

## Features

- 🚣 **Dynamic Game World** — real-time WebGL rendering of lakes, weather effects, and underwater ecosystems via PixiJS 8
- 🎣 **Realistic Fishing Mechanics** — interactive bite detection, line tension physics, reeling simulation, snag mechanics, and catch results
- 🐟 **Advanced Fish AI** — steering behaviors, depth preferences, migration, bait attraction, and species-specific activity patterns
- ⛈️ **Dynamic Weather** — rain, clouds, wind, and day/night cycles that affect gameplay and audio atmosphere
- 🛒 **Full Economy UI** — shop, inventory, equipment, and keepnet management with real-time updates
- 📊 **Player Dashboard** — statistics, achievements, quest progress, and lake diary
- 🎵 **Immersive Audio** — Web Audio API with ambient tracks, SFX, and volume control (iOS-compatible via GainNodes)
- 🎨 **Premium UI/UX** — responsive design with smooth CSS transitions, skeleton loading, and scroll-reveal animations
- 🌐 **Multi-language Support** — full localization (Ukrainian / English) via i18next with dynamic language switching
- 📱 **Touch-Friendly** — universal Pointer Events for seamless gameplay on tablets and mobile devices
- 🔧 **Debug Terminal** — in-game command shell for testing and moderation

---

## Tech Stack

| Category          | Technology                                                                           |
| :---------------- | :----------------------------------------------------------------------------------- |
| **UI Framework**  | [React 19](https://react.dev/) with React Compiler (auto-memoization)                |
| **Bundler**       | [Vite 8](https://vite.dev/) with Rolldown                                            |
| **Rendering**     | [PixiJS 8](https://pixijs.com/) — WebGL 2D graphics engine                           |
| **State**         | [Redux Toolkit](https://redux-toolkit.js.org/) — global game state                   |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query) — server state, caching, mutations   |
| **Routing**       | [React Router 7](https://reactrouter.com/)                                           |
| **i18n**          | [i18next](https://www.i18next.com/) + react-i18next                                  |
| **Forms**         | [React Hook Form](https://react-hook-form.com/)                                      |
| **Math**          | [simplex-noise](https://github.com/jwagner/simplex-noise.js) — procedural generation |
| **Content**       | [React Markdown](https://github.com/remarkjs/react-markdown) — rich text rendering   |
| **Analytics**     | [Vercel Analytics](https://vercel.com/analytics)                                     |
| **Language**      | TypeScript 5                                                                         |

---

## State Management

### Redux Slices (Global UI State)

| Slice           | Responsibilities                                         |
| :-------------- | :------------------------------------------------------- |
| `authSlice`     | Authentication state, tokens, login status               |
| `gameSlice`     | Active lake, fishing state, cast position, current catch |
| `settingsSlice` | Audio volume, language preference, UI preferences        |
| `uiSlice`       | Modal visibility, active panel, navigation state         |
| `newsSlice`     | Cached news items, read status                           |

### TanStack Query (Server State)

All server interactions go through `queries/` hooks which handle:

- **Optimistic updates** — inventory and catch results update the UI instantly before the server confirms
- **Automatic retry** — failed requests are retried with exponential backoff
- **Cache invalidation** — mutations automatically refetch affected queries
- **Loading states** — skeleton loaders powered by `react-loading-skeleton`

---

## Game Configuration

All game parameters are defined in `common/configs/game/`:

| Config File            | Contains                                          |
| :--------------------- | :------------------------------------------------ |
| `fish.config.ts`       | Species definitions, weights, lengths, rarity     |
| `lakes.config.ts`      | Lake definitions, available species, depth zones  |
| `gear.config.ts`       | Rod, reel, line, hook, lure specifications        |
| `physics.config.ts`    | Tension, drag, reeling force parameters           |
| `ai.config.ts`         | Fish AI: steering weights, reaction distances     |
| `detection.config.ts`  | Bite detection: probabilities, timing, float anim |
| `bait.config.ts`       | Bait types and species attraction multipliers     |
| `groundbait.config.ts` | Groundbait types and area-of-effect settings      |
| `system.config.ts`     | Engine settings: FPS, pool sizes, spawn rates     |

---

## Getting Started

### 1. Installation

```bash
cd client
yarn install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Configure the API URL:

```dotenv
VITE_API_URL=http://localhost:5000
```

### 3. Development Mode

```bash
yarn dev
```

The application will be available at `http://localhost:5173`.

### 4. Production Build

```bash
yarn build
yarn preview  # Preview locally
```

---

## Available Scripts

| Command                  | Description                       |
| :----------------------- | :-------------------------------- |
| `yarn dev`               | Start Vite dev server with HMR    |
| `yarn build`             | Lint + compile + production build |
| `yarn preview`           | Preview production build locally  |
| `yarn lint` / `lint:fix` | ESLint check / auto-fix           |
| `yarn format`            | Format with Prettier              |
| `yarn format:check`      | Check formatting without changes  |
| `yarn convert`           | Convert images to WebP (sharp)    |
| `yarn knip`              | Detect unused code & dependencies |

---

## License

This project is licensed under the License – see the [LICENCE](../LICENCE) file for details.
