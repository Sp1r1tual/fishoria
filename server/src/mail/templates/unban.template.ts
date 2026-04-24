export const getUnbanTemplate = (projectName: string, lang: string = 'en') => {
  const isUa = lang === 'ua';

  const title = isUa ? 'АКАУНТ РОЗБЛОКОВАНО' : 'ACCOUNT UNBANNED';
  const message = isUa
    ? `Ваш акаунт на ${projectName} було розблоковано.`
    : `Your account on ${projectName} has been unbanned.`;
  const subMessage = isUa
    ? `Тепер ви можете знову користуватись своїм акаунтом та грати у гру.`
    : `You can now use your account and play the game again.`;

  const footerText = isUa
    ? `© ${new Date().getFullYear()} ${projectName}. Всі права захищено.`
    : `© ${new Date().getFullYear()} ${projectName}. All rights reserved.`;

  return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; border: 1px solid #f1f8e9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
              .content { padding: 40px; background-color: #ffffff; text-align: center; }
              .content p { font-size: 18px; margin-bottom: 20px; }
              .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${title}</h1>
              </div>
              <div class="content">
                  <p>${message}</p>
                  <p>${subMessage}</p>
              </div>
              <div class="footer">
                  ${footerText}
              </div>
          </div>
      </body>
      </html>
    `;
};
