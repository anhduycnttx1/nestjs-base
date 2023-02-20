import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.setGlobalPrefix('/api/posi/v1');
  app.useGlobalPipes(new ValidationPipe());
  // Allow access to static file
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/api/posi/v1/public' });

  await app.listen(8000);
}
bootstrap();
