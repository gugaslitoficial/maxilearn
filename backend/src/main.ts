import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(require('express').json({ limit: '2mb' }));
  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
