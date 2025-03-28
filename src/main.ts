import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join, resolve } from 'path';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Загружаем .env до всего остального
dotenv.config({ path: __dirname + '/../.env' });

const envPath = resolve(__dirname, '../.env');
console.log('Путь к .env:', envPath);

const envContent = readFileSync(envPath, 'utf-8');
console.log('Первые 50 символов .env:', envContent.slice(0, 50));

async function bootstrap() {
  console.log('Токен из .env:', process.env.TELEGRAM_BOT_TOKEN?.slice(0,5) + '...');
  const app = await NestFactory.create(AppModule);
  
  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe());
  
  // Настройка статических файлов
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  
  // Включаем CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:3000',
      'https://localhost:3000',
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
  });

  // Добавляем глобальный префикс API
  app.setGlobalPrefix('api');

  app.use('/api/telegram/webhook', (req, res, next) => {
    console.log('Webhook request received:', req.body);
    next();
  });

  await app.listen(3000, '0.0.0.0'); // Явно указываем хост
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();