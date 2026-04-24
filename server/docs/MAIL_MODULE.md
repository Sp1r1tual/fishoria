# 📧 Fishoria API: Mail Module

The Mail module handles sending system messages to players via email (SMTP).

## 🚀 Key Features

- **Transactional emails**: Sending registration confirmations and password reset requests.
- **Localization**: Email subjects and bodies are automatically adapted to the user's language (`uk`/`en`).
- **Styled templates**: HTML templates are used to produce professional-looking emails.
- **Error logging**: Every failed send attempt is recorded in the server's system logs with full stack traces.
- **Error propagation**: Failed sends throw `InternalServerErrorException` to notify the calling code.

## 🛠 Technical Details

### 1. Transport (`Nodemailer`)

The service uses `Nodemailer` configured for **Gmail**. Authentication credentials (`SMTP_USER`, `SMTP_PASSWORD`) are loaded from the environment via `ConfigService`.

```typescript
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: configService.get('SMTP_USER'),
    pass: configService.get('SMTP_PASSWORD'),
  },
});
```

### 2. Templating

The email body is not hardcoded in the service. Instead, template functions from the `src/mail/templates` folder are used:

- `getActivationTemplate(link, projectName, lang)` – styled HTML for account activation.
- `getPasswordResetTemplate(link, projectName, lang)` – styled HTML for password reset.

This makes it easy to update email designs without touching the business logic.

### 3. Language Handling

Each send method includes a language check:

```typescript
const isUa = lang === 'ua'; // Uses 'ua' code for subject selection
```

The email subject is selected dynamically based on the language:

| Email Type     | English Subject                    | Ukrainian Subject               |
| :------------- | :--------------------------------- | :------------------------------ |
| Activation     | `Activate your account - Fishoria` | `Активація акаунту - Fishoria`  |
| Password Reset | `Password Reset - Fishoria`        | `Відновлення паролю - Fishoria` |

The language parameter is also passed through to the template function for body localization.

### 4. Error Handling

Both send methods wrap the `transporter.sendMail` call in a try/catch:

- **Logging**: Uses NestJS `Logger.error()` with the full error stack trace.
- **Exception**: Throws `InternalServerErrorException('Failed to send email')` so that the calling service (Auth) can handle the failure.

## 📡 Service Methods

| Method                  | Parameters       | Description                                         |
| :---------------------- | :--------------- | :-------------------------------------------------- |
| `sendActivationMail`    | `to, link, lang` | Email for confirming an address after registration. |
| `sendPasswordResetMail` | `to, link, lang` | Email with a link to set a new password.            |

### Integration Points

- **`sendActivationMail`** is called from `AuthService.register()` with the activation link: `{API_URL}/auth/activate/{activationLink}`.
- **`sendPasswordResetMail`** is called from `AuthService.requestPasswordReset()` with the reset link: `{CLIENT_URL}/reset-password?token={token}`.

## 📦 Dependencies

- `nodemailer`: Core library for SMTP communication.
- `@nestjs/config`: For secure storage of mail credentials.

## 💡 Developer Tip

When deploying to production, make sure "App Passwords" is enabled in your Google account settings if you are using Gmail as the SMTP server.

Note: The language code for Ukrainian in email subjects uses `'ua'` (not `'uk'` as in the rest of the system). If you add new email types, keep this convention consistent or refactor to use the standard `'uk'` code.
