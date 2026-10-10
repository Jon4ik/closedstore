# 🔧 Решение ошибки "Cannot find module '/app/dist/main'"

## Проблема

```
Error: Cannot find module '/app/dist/main'
```

Эта ошибка означает, что backend не может найти скомпилированный код после сборки.

## Причина

Проблема может быть вызвана:
1. Сборка не прошла успешно
2. Файлы не были скопированы в Docker контейнер
3. Multi-stage build не работает корректно
4. NestJS CLI не настроен правильно

## Решение

### Шаг 1: Пересобрать backend контейнер

```bash
# Сделать скрипт исполняемым
chmod +x rebuild-backend.sh

# Запустить пересборку
./rebuild-backend.sh
```

### Шаг 2: Проверить логи

```bash
# Просмотреть логи backend
docker compose logs -f backend
```

Вы должны увидеть:
```
Starting application...
total 1234
drwxr-xr-x ... main.js
...
Build successful
```

### Шаг 3: Если проблема сохраняется

#### Вариант 1: Полная очистка и пересборка

```bash
# Остановить все контейнеры
docker compose down

# Удалить все образы
docker compose down --rmi all

# Очистить кэш Docker
docker system prune -a

# Пересобрать
docker compose build --no-cache
docker compose up -d
```

#### Вариант 2: Проверить сборку вручную

```bash
# Войти в контейнер backend
docker compose exec backend sh

# Проверить наличие файлов
ls -la /app/
ls -la /app/dist/

# Проверить наличие main.js
ls -la /app/dist/main.js

# Выйти
exit
```

#### Вариант 3: Локальная сборка

Если Docker сборка не работает, попробуйте собрать локально:

```bash
cd backend

# Установить зависимости
npm install

# Сгенерировать Prisma client
npx prisma generate

# Собрать проект
npm run build

# Проверить наличие dist/
ls -la dist/

# Запустить локально
npm run start:prod

cd ..
```

## Что было исправлено

### 1. Упрощен Dockerfile

**Было:** Multi-stage build (builder + production)
**Стало:** Single-stage build (проще и надежнее)

### 2. Добавлена отладка

Dockerfile теперь:
- Выводит содержимое `dist/` после сборки
- Проверяет наличие файлов перед запуском
- Показывает подробные логи при старте

### 3. Улучшена совместимость

- Используется `node:20-bookworm-slim` (Debian-based)
- Установлены все необходимые зависимости (OpenSSL, curl)
- Prisma client генерируется правильно

## Проверка успешной сборки

После пересборки проверьте:

```bash
# 1. Проверить статус контейнера
docker compose ps backend

# Должно быть: Up (healthy) или Up

# 2. Проверить логи
docker compose logs backend | grep "Build successful"

# Должно быть: Build successful

# 3. Проверить API
curl http://localhost:4000/api/health

# Должно вернуть: {"status":"ok","timestamp":"..."}
```

## Структура проекта в контейнере

После успешной сборки структура должна быть:

```
/app/
├── node_modules/
│   ├── .prisma/
│   └── @prisma/
├── dist/
│   ├── main.js          ← Главный файл
│   ├── app.module.js
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── ...
```

## Частые проблемы

### Проблема: "dist/ directory not found"

**Решение:**
```bash
# Пересобрать без кэша
docker compose build --no-cache backend
```

### Проблема: "main.js not found in dist/"

**Решение:**
```bash
# Проверить tsconfig.json
cat backend/tsconfig.json

# Должно быть: "outDir": "./dist"

# Пересобрать
docker compose build --no-cache backend
```

### Проблема: "Prisma client not generated"

**Решение:**
```bash
# Войти в контейнер
docker compose exec backend sh

# Сгенерировать Prisma client
npx prisma generate

# Выйти
exit

# Перезапустить backend
docker compose restart backend
```

### Проблема: "Migration failed"

**Решение:**
```bash
# Применить миграции вручную
docker compose exec backend npx prisma migrate deploy

# Или создать baseline
./baseline-migration.sh
```

## Альтернативное решение: Использовать локальный backend

Если Docker backend не работает, запустите backend локально:

```bash
# Остановить Docker backend
docker compose stop backend

# Запустить локальный backend
cd backend
npm install
npx prisma generate
npm run build
npm run start:prod

# В другом терминале запустить frontend
cd ..
npm run dev
```

## Проверка работоспособности

### 1. Проверить backend

```bash
# Health check
curl http://localhost:4000/api/health

# Swagger docs
curl http://localhost:4000/api/docs
```

### 2. Проверить frontend

```bash
# Frontend должен быть доступен
curl http://localhost:5001
```

### 3. Проверить базу данных

```bash
# Подключиться к PostgreSQL
psql -h localhost -p 5432 -U your_user -d your_database

# Проверить таблицы
\dt

# Должны быть: roles, users, tus, store_projects, comments, audit_logs, _prisma_migrations
```

## Дополнительные команды

```bash
# Пересобрать все сервисы
docker compose build --no-cache

# Перезапустить все сервисы
docker compose restart

# Просмотреть логи всех сервисов
docker compose logs -f

# Остановить все сервисы
docker compose down

# Запустить все сервисы
docker compose up -d
```

## Полезные ссылки

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Обновлено:** 2024  
**Версия:** 1.1.0
