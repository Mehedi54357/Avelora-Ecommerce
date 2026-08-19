import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParserRaw from 'cookie-parser';
const cookieParser = cookieParserRaw.default || cookieParserRaw;
import { ValidationPipe, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  // Support large base64 image uploads (up to 50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Dynamic CORS Configuration
  const frontendEnv = process.env.FRONTEND_URL || 'http://localhost:3000';
  const configuredOrigins = frontendEnv
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOriginsSet = new Set<string>(configuredOrigins);
  allowedOriginsSet.add('http://localhost:3000');
  allowedOriginsSet.add('http://127.0.0.1:3000');

  for (const origin of configuredOrigins) {
    if (origin.startsWith('https://') && !origin.includes('localhost')) {
      if (origin.startsWith('https://www.')) {
        allowedOriginsSet.add(origin.replace('https://www.', 'https://'));
      } else {
        allowedOriginsSet.add(origin.replace('https://', 'https://www.'));
      }
    }
  }

  const allowedOrigins = Array.from(allowedOriginsSet);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (such as server-side fetches, curl, or health checks)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      try {
        const originUrl = new URL(origin);
        for (const allowed of allowedOrigins) {
          if (allowed.startsWith('https://')) {
            const allowedUrl = new URL(allowed);
            if (originUrl.hostname === allowedUrl.hostname || originUrl.hostname.endsWith(`.${allowedUrl.hostname}`)) {
              return callback(null, true);
            }
          }
        }
      } catch {}

      logger.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  });

  // Global prefix for all API routes, excluding canonical health check
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`AVELORA Backend API listening on port ${port}`);
}
bootstrap();

