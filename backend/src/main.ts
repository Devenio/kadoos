import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './common/config/env.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(env.PORT);
}

await bootstrap();
