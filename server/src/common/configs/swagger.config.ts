import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Fishoria API')
    .setDescription('The Fishoria Game API documentation')
    .setVersion('1.0')
    .addCookieAuth(
      'Authentication',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'Authentication',
        description: 'JWT Authentication Cookie',
      },
      'Authentication',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-xsrf-token',
        in: 'header',
        description: 'Provide CSRF token from XSRF-TOKEN cookie',
      },
      'XSRF',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
