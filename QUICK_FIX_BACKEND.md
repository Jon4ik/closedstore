# ⚡ Быстрое решение ошибки "Cannot find module '/app/dist/main'"

## Проблема

Backend не может найти скомпилированный код после сборки в Docker.

## Решение (2 минуты)

### Шаг 1: Пересобрать backend

```bash
chmod +x rebuild-backend.sh
./rebuild-backend.sh
```

### Шаг 2: Проверить логи

```bash
docker compose logs -f backend
```

Вы должны увидеть:
```
Starting application...
total 1234
-rw-r--r-- ... main.js
...
Build successful
```

### Шаг 3: Проверить работоспособность

```bash
# Проверить backend
curl http://localhost:4000/api/health

# Должно вернуть: {"status":"ok",...}
```

## Если не помогло

### Полная очистка и пересборка

```bash
# Остановить все
docker compose down

# Удалить образы
docker compose down --rmi all

# Очистить кэш
docker system prune -a

# Пересобрать
docker compose build --no-cache
docker compose up -d
```

### Альтернатива: Запустить backend локально

```bash
# Остановить Docker backend
docker compose stop backend

# Запустить локально
cd backend
npm install
npx prisma generate
npm run build
npm run start:prod
```

## Что было исправлено

✅ Упрощен Dockerfile (single-stage вместо multi-stage)  
✅ Добавлена отладка (проверка файлов после сборки)  
✅ Улучшена совместимость с Prisma  
✅ Добавлены проверки наличия файлов

## Документация

- 📖 [FIX_BACKEND_BUILD.md](FIX_BACKEND_BUILD.md) - Подробная документация
- 📖 [START_HERE.md](START_HERE.md) - Общий быстрый старт
- 📖 [README_NO_DOCKER.md](README_NO_DOCKER.md) - Запуск без Docker

---

**Время решения:** ~2 минуты
