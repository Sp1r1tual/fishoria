## Fishoria - Client

**The frontend application for the interactive web-based fishing simulator.** Built with React 19 and Pixi.js 8 for a smooth and engaging fishing experience directly in your browser.

---

## About the Client

This repository contains the client-side code for Fishoria. It handles high-performance game rendering, complex state management for inventory and progression, and provides a polished, responsive user interface for players to interact with.

---

## Features

- 🚣 **Dynamic Game World** – high-performance rendering of lakes and environments via Pixi.js
- 🎣 **Realistic Fishing Mechanics** – interactive bite detection, tension mechanics, and catch results
- 🛒 **Inventory & Shop UI** – seamless management of fishing gear and items
- 📊 **User Dashboard** – tracking of fishing statistics, achievements, and quest progress
- 🎨 **Premium UI/UX** – modern, responsive design with smooth transitions and theme support
- 🌐 **Multi-language Support** – localization via i18next for a global player base

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Game Engine**: [Pixi.js 8](https://pixijs.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **Validation**: [React Hook Form](https://react-hook-form.com/)
- **Content**: [React Markdown](https://github.com/remarkjs/react-markdown)
- **Procedural Logic**: [Simplex Noise](https://github.com/jwagner/simplex-noise.js)

---

## Getting Started

### 1. Installation

Navigate to the client directory and install the necessary dependencies:

```bash
cd client
yarn install
```

### 2. Environment Variables

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

And configure your local API URL:

```dotenv
VITE_API_URL=http://localhost:5000
```

### 3. Development Mode

Start the development server with Hot Module Replacement (HMR):

```bash
yarn dev
```

The application will be available at `http://localhost:5173`.

### 4. Production Build

To create a production-optimized build:

```bash
yarn build
```

---

## License

All rights reserved by the author.
Permission is required for modification or distribution.

**Author**: Atmosphoria Software
