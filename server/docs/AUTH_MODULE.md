# 🔐 Fishoria API: Auth Module

The Auth module implements a hybrid authentication system designed to work with both web clients and mobile applications.

## 🚀 Key Features

- **Hybrid authentication**: Support for `httpOnly` Cookies for web and `Bearer` tokens for mobile devices.
- **Refresh token rotation**: The system automatically invalidates the used Refresh token and issues a new pair when refreshing a session (Security Best Practice).
- **Google OAuth**: Built-in support for social authentication via Google with full OAuth2 redirect flow.
- **CSRF Protection**: Automatic protection for Cookie-based requests and bypass for clients using Bearer tokens. CSRF tokens are generated via middleware and validated by a global guard.
- **Localized errors**: The server returns i18n keys (e.g., `landing.auth.errors.*`), allowing the frontend to display errors in the user's language.
- **Instant ban (Redis)**: Every login and JWT validation checks the user's ban status via Redis, allowing immediate access revocation for blocked users across all devices.
- **Two-step activation**: Account activation system via email link with redirect to the client URL.
- **Password reset**: Full access recovery flow via email tokens with token verification step.
- **Role-based access**: `UserRole` enum (`PLAYER`, `MODERATOR`) with `@Roles` decorator and `RolesGuard` for endpoint-level authorization.

## 🛠 Technical Details

### 1. Hybrid Guard (`JwtAuthGuard` + `JwtStrategy`)

The strategy checks for a token in the following order:

1. Cookie named `Authentication` (extracted first)
2. `Authorization: Bearer <token>` header

On every successful JWT validation, the strategy queries Redis for `ban:{userId}`. If the user is banned, the request is immediately rejected with `UnauthorizedException`.

### 2. CSRF Protection (Middleware + Guard)

CSRF protection is implemented as a two-part system:

- **`CsrfMiddleware`**: Applied globally, generates a random `XSRF-TOKEN` cookie (`httpOnly: false`) on the first request so the frontend (Axios) can read it.
- **`CsrfGuard`**: A global guard that validates the `x-xsrf-token` header against the `XSRF-TOKEN` cookie for all mutating requests (`POST`, `PATCH`, `DELETE`).

CSRF validation is skipped in the following cases:

- `GET`, `HEAD`, `OPTIONS` requests.
- Requests with `Authorization: Bearer` header (mobile apps).
- Public auth routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify-reset-token`, `/auth/reset-password`, `/auth/refresh`.

### 3. Cookie Configuration

Cookies are configured differently based on the environment:

| Property   | Development | Production      |
| :--------- | :---------- | :-------------- |
| `httpOnly` | `true`      | `true`          |
| `secure`   | `false`     | `true`          |
| `sameSite` | `lax`       | `none`          |
| `domain`   | –           | `COOKIE_DOMAIN` |

Two cookies are set: `Authentication` (access token, shorter TTL) and `Refresh` (refresh token, longer TTL).

### 4. Instant Ban Mechanism

User status check logic (in `JwtStrategy.validate`):

```typescript
// On every JWT validation:
const isBanned = await this.redis.get(`ban:${payload.sub}`);
if (isBanned)
  throw new UnauthorizedException('Your account has been suspended');
```

Ban with expiration support: when banning a user, `expiresAt` can be provided. Redis TTL is calculated dynamically; if no expiration – defaults to 7 days. Banning also revokes all active refresh tokens.

### 5. Google OAuth Flow

1. `GET /auth/google` – Redirects to Google consent screen (uses `passport-google` strategy).
2. `GET /auth/google/callback` – Google redirects back; the server creates or updates the user, sets cookies, and redirects to `CLIENT_URL`.
3. Google users are auto-activated (`isActivated: true`), and their avatar + display name are populated from the Google profile.

### 6. Password Reset Flow

1. `POST /auth/forgot-password` – generates a reset token, stores it in `PasswordResetToken` table (with `userAgent`, `ip`, `expiresAt`), sends email with a link pointing to `CLIENT_URL/reset-password?token=...`.
2. `POST /auth/verify-reset-token` – verifies the token hasn't expired.
3. `POST /auth/reset-password` – validates token, hashes new password, updates the user, and deletes all reset tokens for that user in a single transaction.

### 7. Account Activation

`GET /auth/activate/:link` – looks up the user by `activationLink`, sets `isActivated: true`, clears the link, and redirects to `CLIENT_URL/welcome?activated=true`. On failure – redirects with `?activationError=true`.

## 📡 Endpoints

| Method   | Path                       | Description                              | Access      |
| :------- | :------------------------- | :--------------------------------------- | :---------- |
| `POST`   | `/auth/register`           | Register a new fisherman                 | Public      |
| `POST`   | `/auth/login`              | Login (sets Cookie + returns token)      | Public      |
| `POST`   | `/auth/logout`             | Logout (clears cookies, revokes refresh) | User        |
| `POST`   | `/auth/refresh`            | Refresh session (rotates tokens)         | Cookie/Body |
| `GET`    | `/auth/activate/:link`     | Activate email via link (redirect)       | Public      |
| `GET`    | `/auth/google`             | Initiate Google OAuth login              | Public      |
| `GET`    | `/auth/google/callback`    | Google OAuth callback (redirect)         | Public      |
| `POST`   | `/auth/forgot-password`    | Request password reset email             | Public      |
| `POST`   | `/auth/verify-reset-token` | Verify password reset token validity     | Public      |
| `POST`   | `/auth/reset-password`     | Set new password using reset token       | Public      |

> Note: banning/unbanning is handled by the **Admin module**, not the Auth controller.

See [ADMIN_MODULE.md](ADMIN_MODULE.md) for `/admin/*` endpoints (ban/unban/check-ban + dashboard/wiki).

### Rate Limits

- `/auth/forgot-password`, `/auth/reset-password`, `/auth/register`: 5 requests per minute.
- `/auth/login`, `/auth/refresh`: 10 requests per minute.

## 📦 Schemas & DTOs

- **RegisterDto**: `email` (valid email), `password` (min 8 chars), `username` (min 3 chars), `language` (optional, `en`/`uk`, defaults to `en`).
- **LoginDto**: `email`, `password`.
- **ForgotPasswordDto**: `email`, `language`.
- **ResetPasswordDto**: `token`, `password`.
- **GoogleAuthPayloadDto**: `googleId`, `email`, `displayName`, `picture`.

## 📦 Dependencies

- `@nestjs/jwt`: For token generation and validation.
- `ioredis` / `@upstash/redis`: For fast ban status checks.
- `passport-jwt`: Core authentication strategy.
- `passport-google-oauth20`: Google OAuth strategy.
- `passport-local`: Local email/password strategy.
- `bcrypt`: Password hashing (salt rounds: 10).
- `ms`: Human-readable duration parsing.
- `date-fns`: Token expiration calculation.
