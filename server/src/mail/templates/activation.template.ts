export const getActivationTemplate = (
  link: string,
  projectName: string,
  lang: string = 'en',
) => {
  const isUa = lang === 'ua';

  const title = isUa ? 'ПІДТВЕРДЖЕННЯ РЕЄСТРАЦІЇ' : 'ACCOUNT ACTIVATION';
  const message = isUa
    ? `Дякуємо за реєстрацію на ${projectName}. <br> Будь ласка, активуйте свій акаунт, натиснувши кнопку нижче.`
    : `Thank you for registering on ${projectName}. <br> Please activate your account by clicking the button below.`;
  const buttonText = isUa ? 'АКТИВУВАТИ АКАУНТ' : 'ACTIVATE ACCOUNT';
  const orCopy = isUa ? 'Або скопіюйте це посилання:' : 'Or copy this link:';
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
              .header { background: linear-gradient(135deg, #0288d1 0%, #26c6da 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
              .content { padding: 40px; background-color: #ffffff; text-align: center; }
              .content p { font-size: 18px; margin-bottom: 30px; }
              .btn { display: inline-block; padding: 15px 35px; background-color: #00acc1; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(0,172,193,0.3); }
              .btn:hover { background-color: #00838f; transform: translateY(-2px); }
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
              </div>
              <div class="footer">
                  ${footerText}
              </div>
          </div>
      </body>
      </html>
    `;
};
