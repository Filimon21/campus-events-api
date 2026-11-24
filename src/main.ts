import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { LoggingInterceptor } from './common/logging/logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  // Add /api prefix to all routes
  app.setGlobalPrefix('api');

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable request timing interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Start backend server
  await app.listen(3000);

  console.log('Campus Events API running at http://localhost:3000/api');
}

bootstrap();