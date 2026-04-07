# Fishoria: a fishing simulator

**Fishoria** is not just another browser game. It is a highly interactive, state-of-the-art web-based fishing simulator, blending mesmerizing WebGL graphics with uncompromised gameplay realism.

Feel the adrenaline rush of fighting a trophy catch, carefully select your tackle, and adapt to changing weather conditions. Fishoria is designed to deliver a genuine fishing experience directly in your browser. No compromises on quality or mechanics!

---

![Fishoria](https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/marketing/fishoria_collage.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL21hcmtldGluZy9maXNob3JpYV9jb2xsYWdlLnBuZyIsImlhdCI6MTc3NTU5MDQ5NSwiZXhwIjo0ODk3NjU0NDk1fQ.aMFBQtMbMo_aVJi9cA8ZKxtbAdVYF1DOJMrAlsuDkPs)

---

## Why will Fishoria hook you from the first minute?

🌊 **Living Ecosystem & Advanced Fish AI**
Forget boring, predictable algorithms. The fish in Fishoria have their own distinct behaviors! They migrate, seek comfortable depths, react differently to the time of day, and get spooked by the sound of a splash. Outsmarting each one is a true challenge.

🎣 **The Ultimate Reeling Thrill**
This isn't just "click-to-catch". Our reeling mini-game calculates line tension physics, fish fatigue, and the durability of every single piece of your tackle. Pull too hard? Say goodbye to your favorite lure and the trophy.

🎯 **Three Distinct Fishing Styles**
Float, feeder, or spinning? Each fishing method features unique physics and behavior. Watch the micro-dips of the float, observe the tension on the feeder quiver tip, or experiment with various spinning retrieval techniques.

⛈️ **A Dynamic, Breathing World**
Sun setting and the sky getting cloudy? Brace for rain! The weather completely alters ecosystem behavior, predator activity, sonar effective radius, and creates a unique atmosphere accompanied by dynamic audio.

🛍️ **Deep Economy & Progression**
Start with a basic float rod, but as you progress—gain experience ($XP$), complete quests, earn in-game currency, and purchase professional gear in the shop. Don't forget maintenance: every epic struggle with a monster fish progressively wears down your arsenal!

📦 **Ecosystem Surprises**
Rewarding experiences are sometimes purely unexpected. Instead of a trophy carp, you might reel in an old boot or snag on an underwater branch. A complex quest system encourages you to explore every single corner of the lake.

🤝 **Global Community**
Fast and secure registration (including Google OAuth), cloud saving for your profile, and detailed statistics. Compete against others, break your own personal records, and build a collection of the rarest fish species.

✨ **Full Immersion: Visuals & Audio**
We have polished every single detail: water droplets streaming down your screen, the iconic sound of the reel drag screaming when a fish pulls, and even meteor showers lighting up the night sky. The ambient sounds dynamically adapt to the weather.

---

## Architecture Without Compromises

Fishoria is also a technical masterpiece. We've combined the latest cutting-edge technologies to ensure maximum performance and reliability:

### Client Side ([/client](./client))

- **Responsive UI/UX:** React 19 + Vite 6 guarantee instant feedback and blazing-fast load times.
- **Rendering Magic:** Pixi.js 8 (WebGL) draws smooth graphics and creates an irreplaceable atmosphere.
- **Zero-Lag Data Management:** Redux Toolkit + TanStack Query v5 eliminate network lag and state drops.
- **Routing:** React Router 7 provides seamless navigation and fast transitions between game screens.
- **Globalization:** i18next makes the game accessible and understandable for players worldwide, supporting multiple languages.
- **Optimization & Touch Interface:** Thanks to Object Pooling and async fish spawning, the game maintains a stable 60 FPS, while universal Pointer-Events allow for flawless gameplay on tablets and mobile phones!

### Server Side ([/server](./server))

- **Bulletproof Core:** NestJS 11 + Prisma 7 handle complex game logic at incredibly high speeds.
- **Reliable DB & Cache:** PostgreSQL (Supabase) + Redis (Upstash) keep thousands of player records absolutely secure.
- **Security & Notifications:** Passport.js (JWT and Google OAuth2) securely protects accounts, while Nodemailer automates email verification.
- **Efficiency:** Zod validation and built-in rate limiting keep the server stable even during massive player spikes.
- **For Administrators:** A built-in In-Game Terminal (Debug Shell v1.05) with role-based access to manage the game world seamlessly from the browser.

---

## Explore the Depths of Code

- **`/client`** — the game client. Look under the hood of our game engine and UI in the [Client README](./client/README.md).
- **`/server`** — the backend. Discover how the security and APIs are structured in the [Server README](./server/README.md).
- **`/docs`** — the sacred texts. Read up on tension formulas, AI behaviors, and ecosystem mathematics in [GAME_MECHANICS.md](./docs/GAME_MECHANICS.md).

---

## License

This project is licensed under the MIT License – see the [LICENCE.md](./LICENCE.md) file for details.
