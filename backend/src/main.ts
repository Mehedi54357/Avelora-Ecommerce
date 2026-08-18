import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParserRaw from 'cookie-parser';
const cookieParser = cookieParserRaw.default || cookieParserRaw;
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(3001);
}
bootstrap();
