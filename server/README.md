## Fishoria - API

**The robust backend engine powering the Fishoria interactive fishing simulator.** Built with NestJS 11 and Prisma 7 for high performance, scalability, and type-safe database interactions.

---

## About the API

This repository contains the server-side code for Fishoria. It manages game state, player progression, authentication, and provides a secure RESTful API for the frontend client. The architecture is designed to be modular and scalable, ensuring a smooth experience even as the player base grows.

---

## Features

- 🔐 **Secure Authentication** – multi-strategy auth including Google OAuth 2.0, JWT, and Local login
- 👤 **Player Management** – comprehensive profile handling, catch statistics and level progression
- 🎣 **Game Logic Engine** – authoritative handling of fishing results, gear durability, and rewards
- 🎒 **Inventory System** – management of rods, lures, and other equipment
- 🏆 **Progression Tracking** – sophisticated achievements and quests system with automated rewarding
- 🛡️ **Security & Optimization** – built-in rate limiting (Throttling), password hashing, and Redis caching
- 📧 **Communication** – automated email notifications and verification via Nodemailer
- 📰 **Content Management** – API endpoints for game news and announcements

---

## Tech Stack

- **Framework**: [NestJS 11](https://nestjs.com/)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Database**: [PostgreSQL (Supabase)](https://supabase.com/)
- **Caching**: [Redis (Upstash)](https://upstash.com/)
- **Validation**: [Zod](https://zod.dev/) & [nestjs-zod](https://github.com/risen7/nestjs-zod)
- **Security**: [Passport.js](https://www.passportjs.org/) (JWT & Google OAuth)
- **Mailing**: [Nodemailer](https://nodemailer.com/)

---

## Getting Started

### 1. Installation

Navigate to the server directory and install the necessary dependencies:

```bash
cd server
yarn install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory by copying the example:

```bash
cp .env.example .env
```

Ensure you configure your Database URL, Redis credentials, Google OAuth keys, and JWT secret.

### 3. Database Setup

Run the following commands to initialize your database schema and seed initial data:

```bash
# Apply migrations
yarn prisma:migrate

# Generate Prisma client
yarn prisma:generate

# Seed the database
yarn prisma:seed
```

### 4. Development Mode

Start the server in watch mode:

```bash
yarn dev
```

The API will be available at `http://localhost:5000`.

---

## License

All rights reserved by the author.
Permission is required for modification or distribution.

---

**Author**: Atmosphoria Software
