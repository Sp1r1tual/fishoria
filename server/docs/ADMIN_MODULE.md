# 🛡 Fishoria API: Admin Module

The Admin module provides the server-rendered Admin Dashboard and moderator tools (ban management + internal wiki rendering).

## 🚀 Key Features

- **Admin Dashboard (HTML)**: Server-rendered dashboard UI available at `/admin`.
- **Internal Wiki**: Renders markdown documents from the server `docs/` directory.
- **Moderation tools**: Ban / unban operations with role-based access control (`MODERATOR`).
- **Ban status checks**: Query whether a user is currently banned.

## 📡 Endpoints

| Method | Path                               | Description                              | Access    |
| :----- | :--------------------------------- | :--------------------------------------- | :-------- |
| `GET`  | `/admin`                           | Admin Dashboard (HTML)                   | Public    |
| `GET`  | `/admin/api/docs-content/:filename`| Render a markdown doc file to HTML       | Public    |
| `POST` | `/admin/ban`                       | Ban a user (optional expiration)         | Moderator |
| `POST` | `/admin/unban`                     | Unban a user                             | Moderator |
| `GET`  | `/admin/check-ban/:userId`         | Check whether a user is currently banned | Moderator |

## 🛡 Security & Authorization

- `POST /admin/ban`, `POST /admin/unban`, `GET /admin/check-ban/:userId` require:
  - JWT authentication, and
  - `MODERATOR` role (via `@Roles('MODERATOR')` + `RolesGuard`).

## 📦 DTOs

- **BanUserDto**:
  - `userId` (string)
  - `reason` (string)
  - `expiresAt?` (string/date, optional) – if provided, the ban will expire automatically
- **UnbanUserDto**:
  - `userId` (string)

## 💡 Notes

- The root route (`GET /`) redirects to `/admin`.
- Wiki rendering is intended for internal use; it renders server-side markdown into HTML for display in the dashboard UI.
