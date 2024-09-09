// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

dotenv.config();

async function configureApp(app: any): Promise<void> {
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  setupSwagger(app);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await configureApp(app);

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(
      `${process.env.API_NAME || 'API'}, rodando na porta ${port} e processo ${process.pid}`
    );
  });
}

bootstrap();
