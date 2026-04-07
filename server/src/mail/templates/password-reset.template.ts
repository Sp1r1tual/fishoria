export const getPasswordResetTemplate = (
  link: string,
  projectName: string,
  lang: string = 'en',
) => {
  const isUa = lang === 'ua';

  const title = isUa ? 'ВІДНОВЛЕННЯ ПАРОЛЮ' : 'PASSWORD RESET';
  const message = isUa
    ? `Ми отримали запит на скидання паролю для вашого акаунту на ${projectName}. <br> Натисніть кнопку нижче, щоб створити новий пароль.`
    : `We received a request to reset your password for your account on ${projectName}. <br> Click the button below to create a new password.`;
  const buttonText = isUa ? 'ВІДНОВИТИ ПАРОЛЬ' : 'RESET PASSWORD';
  const orCopy = isUa ? 'Або скопіюйте це посилання:' : 'Or copy this link:';
  const ignoreText = isUa
    ? 'Якщо ви не робили цей запит, проігноруйте цей електронний лист.'
    : "If you didn't request this, you can safely ignore this email.";
  const footerText = isUa
    ? `© ${new Date().getFullYear()} ${projectName}. Всі права захищено.`
    : `© ${new Date().getFullYear()} ${projectName}. All rights reserved.`;

  return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0f2f1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #fb8c00 0%, #ffb300 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
              .content { padding: 40px; background-color: #ffffff; text-align: center; }
              .content p { font-size: 18px; margin-bottom: 30px; }
              .btn { display: inline-block; padding: 15px 35px; background-color: #fb8c00; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(251,140,0,0.3); }
              .btn:hover { background-color: #f4511e; transform: translateY(-2px); }
              .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777; }
              .link-text { margin-top: 25px; font-size: 13px; color: #aaa; word-break: break-all; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${title}</h1>
              </div>
              <div class="content">
                  <p>${message}</p>
                  <a href="${link}" class="btn">${buttonText}</a>
                  <div class="link-text">
                      ${orCopy} <br>
                      ${link}
                  </div>
                  <p style="font-size: 12px; color: #999; margin-top: 20px;">${ignoreText}</p>
              </div>
              <div class="footer">
                  ${footerText}
              </div>
          </div>
      </body>
      </html>
    `;
};
