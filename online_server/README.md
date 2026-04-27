# Fishoria Online Server (Socket.IO)

Real-time WebSocket server for **Fishoria**. Handles live chat, game events, and server status tracking with cross-service synchronization.

---

## Features

- **Live Multi-room Chat** – Isolated chat rooms for each lake with message persistence (last 50 messages) via Redis.
- **Real-time Game Events** – Instant broadcasting of fish catches and other player activities across the lake.
- **Server Status Tracking** – Multi-phase boot tracking (`starting` → `db_connect` → `redis_connect` → `online`) with live updates for clients (essential for Render cold-starts).
- **Advanced Security** – JWT-based socket authentication, identity verification, and real-time ban checks using the shared Redis ban cache.
- **Performance Optimized** – Built on Socket.io with Redis-backed state management for low-latency interactions.

---

## Tech Stack

| Category       | Technology                                                                     |
| :------------- | :----------------------------------------------------------------------------- |
| **Framework**  | [NestJS 11](https://nestjs.com/)                                               |
| **Real-time**  | [Socket.io](https://socket.io/)                                                |
| **ORM**        | [Prisma 7](https://www.prisma.io/)                                             |
| **Database**   | [PostgreSQL (Supabase)](https://supabase.com/)                                 |
| **Caching**    | [Redis (Upstash)](https://upstash.com/)                                        |
| **Validation** | [Zod 4](https://zod.dev/) & [nestjs-zod](https://github.com/risen7/nestjs-zod) |
| **Auth**       | [Passport.js](https://www.passportjs.org/) – JWT                               |
| **Language**   | TypeScript 5                                                                   |

---

## Getting Started

### 1. Installation

```bash
cd online_server
yarn install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

| Variable       | Description                        |
| :------------- | :--------------------------------- |
| `PORT`         | Server port (default: `5001`)      |
| `CLIENT_URL`   | Allowed CORS origin                |
| `DATABASE_URL` | Main PostgreSQL connection         |
| `REDIS_URL`    | Redis connection string            |
| `JWT_SECRET`   | Shared secret for token validation |

### 3. Database Setup

```bash
# Generate Prisma client based on shared schema
yarn prisma:generate
```

### 4. Run Development

```bash
yarn dev
```

The server will be available at `ws://localhost:5001`.

---

## Socket Events Reference

### Namespace: `/chat`

| Event               | Type | Payload                   | Description                      |
| :------------------ | :--- | :------------------------ | :------------------------------- |
| `chat:join`         | In   | `JoinDto`                 | Join a lake room (requires JWT)  |
| `chat:send_message` | In   | `SendMessageDto`          | Send message to current lake     |
| `chat:history`      | Out  | `IChatMessage[]`          | Last 50 messages (on join)       |
| `chat:message`      | Out  | `IChatMessage`            | New message broadcast            |
| `chat:room_state`   | Out  | `{ onlineCount: number }` | Online users in the current lake |

### Namespace: `/status`

| Event           | Type | Description                        |
| :-------------- | :--- | :--------------------------------- |
| `status:check`  | In   | Request current server boot status |
| `status:update` | Out  | Broadcast of boot phase changes    |

---

## Architecture

```
src/
├── auth/           # JWT Validation & WsAuthGuard
├── chat/           # Room logic, messaging & Redis history
├── status/         # Boot phase tracking & status gateway
├── common/         # Redis & Prisma shared services
└── main.ts         # Server entry point with status triggers
```

### Authorization Flow

1. Client connects to `/chat`.
2. Client emits `chat:join` with a JWT `token`.
3. `WsAuthGuard` verifies the token and checks the **Redis Ban Cache**.
4. If valid, the user is joined to the lake room and receives chat history.

---

## License

This project is licensed under the License – see the [LICENCE](../LICENCE) file for details.
