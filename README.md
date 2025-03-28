# Book Reader Backend

Бэкенд для приложения чтения книг в Telegram WebApp. Позволяет читать PDF книги прямо в Telegram.

## Основные функции
- Чтение PDF файлов
- Навигация по страницам
- Сохранение прогресса чтения
- Адаптивное отображение страниц
- Поддержка Telegram WebApp

## Технологии
- Node.js
- NestJS
- TypeScript
- PDF.js
- SQLite
- TypeORM

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Сборка проекта
npm run build

# Запуск в продакшене
npm run start:prod
```

## API Endpoints

### Книги
- `GET /books` - Получить список всех книг
- `GET /books/:id` - Получить информацию о книге
- `GET /books/:id/pages` - Получить количество страниц книги
- `GET /books/:id/page/:pageNumber` - Получить конкретную страницу
- `POST /books` - Добавить новую книгу
- `DELETE /books/:id` - Удалить книгу

### Прогресс чтения
- `GET /progress/:userId/:bookId` - Получить прогресс чтения
- `POST /progress` - Сохранить прогресс чтения
- `PUT /progress/:id` - Обновить прогресс чтения

## Структура проекта
```
src/
├── books/          # Модуль работы с книгами
├── progress/       # Модуль прогресса чтения
├── telegram/       # Интеграция с Telegram
├── database/       # Конфигурация базы данных
└── main.ts         # Точка входа
```

## Переменные окружения
```env
PORT=3000
DATABASE_PATH=./data/database.sqlite
TELEGRAM_BOT_TOKEN=your_bot_token
```

## Автор
Асанов Эдем
