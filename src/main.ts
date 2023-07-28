import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import migrate from 'node-pg-migrate';
import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors();
  app.use(helmet());
  app.use(compression());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('An API scaffolded with NestJS')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
      },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync(
    path.join(__dirname, '../swagger.json'),
    JSON.stringify(document),
  );

  if (process.env.NODE_ENV === 'development') {
    SwaggerModule.setup('api/docs', app, document);
  }

  await migrate({
    checkOrder: true,
    direction: 'up',
    databaseUrl: process.env.DATABASE_URL,
    migrationsTable: 'migrations',
    dir: path.join(__dirname, 'db', 'migrations'),
    log: (msg) => console.log(msg),
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
