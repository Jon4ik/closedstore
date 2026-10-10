# 🚀 Быстрый запуск в Docker

## Что нужно сделать на сервере:

### 1. Скопируйте файлы на сервер

На вашем локальном компьютере:
```bash
git add .
git commit -m "Fix: Docker backend with ts-node"
git push
```

На сервере:
```bash
cd ~/store-reconstruction
git pull
```

### 2. Проверьте .env файл

Убедитесь, что в `.env` есть все настройки:

```env
DB_HOST=10.2.0.252
DB_PORT=5432
DB_NAME=mydatabase
DB_USER=your_user
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_at_least_32_characters
DOMAIN=localhost
```

### 3. Остановите локальный backend

Если backend запущен локально, остановите его:
```bash
# В терминале, где запущен backend, нажмите Ctrl+C
```

### 4. Пересоберите и запустите Docker

```bash
cd ~/store-reconstruction

# Остановить все контейнеры
docker compose down

# Пересобрать backend
docker compose build --no-cache backend

# Запустить все
docker compose up -d

# Проверить статус
docker compose ps

# Посмотреть логи backend
docker compose logs -f backend
```

### 5. Проверьте работоспособность

```bash
# Проверить backend
curl http://localhost:4000/api/health

# Проверить frontend
curl http://localhost:5001

# Открыть в браузере
# http://localhost:5001
```

---

## Что изменилось:

✅ **Backend снова в Docker** - использует ts-node (без компиляции)  
✅ **DATABASE_URL передается** - из .env в контейнер  
✅ **Nginx подключается к backend:4000** - через Docker сеть  
✅ **Все в одном месте** - не нужно запускать backend локально  

---

## Если возникнут проблемы:

### Backend не запускается

```bash
# Посмотреть логи
docker compose logs backend

# Пересобрать
docker compose build --no-cache backend
docker compose up -d backend
```

### Ошибка DATABASE_URL

Проверьте .env файл:
```bash
cat .env | grep DB_
```

Убедитесь, что все переменные установлены.

### Frontend не открывается

```bash
# Пересобрать frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## Структура:

```
Браузер → localhost:5001 → Nginx (frontend) → backend:4000 → PostgreSQL
```

Все работает в Docker контейнерах!

---

**Время запуска:** ~2 минуты  
**Команды:** `docker compose down && docker compose build --no-cache && docker compose up -d`
