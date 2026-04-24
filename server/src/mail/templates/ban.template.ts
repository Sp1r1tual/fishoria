export const getBanTemplate = (
  reason: string,
  projectName: string,
  lang: string = 'en',
) => {
  const isUa = lang === 'ua';

  const title = isUa ? 'БЛОКУВАННЯ АКАУНТУ' : 'ACCOUNT SUSPENSION';
  const message = isUa
    ? `Ваш акаунт на ${projectName} було заблоковано модератором.`
    : `Your account on ${projectName} has been suspended by a moderator.`;
  const reasonText = isUa ? 'Причина блокування:' : 'Reason for suspension:';
  const appealMessage = isUa
    ? 'Якщо ви вважаєте, що це сталося помилково, або хочете оскаржити блокування, надішліть апеляцію у вигляді відповіді на цей лист.'
    : 'If you believe this was a mistake or wish to appeal the suspension, please reply directly to this email.';

  const footerText = isUa
    ? `© ${new Date().getFullYear()} ${projectName}. Всі права захищено.`
    : `© ${new Date().getFullYear()} ${projectName}. All rights reserved.`;

  return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; border: 1px solid #ffebee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #c62828 0%, #ef5350 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
              .content { padding: 40px; background-color: #ffffff; text-align: center; }
              .content p { font-size: 18px; margin-bottom: 20px; }
              .reason-box { background-color: #ffebee; border-left: 4px solid #c62828; padding: 15px; margin: 20px 0; text-align: left; }
              .reason-box strong { display: block; color: #c62828; margin-bottom: 5px; }
              .appeal-text { font-size: 14px; margin-top: 30px; color: #555; background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: left; border: 1px solid #eee; }
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
                  <div class="reason-box">
                      <strong>${reasonText}</strong>
                      ${reason || 'Не вказано / Not provided'}
                  </div>
                  <div class="appeal-text">
                      ${appealMessage}
                  </div>
              </div>
              <div class="footer">
                  ${footerText}
              </div>
          </div>
      </body>
      </html>
    `;
};
