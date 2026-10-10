# ✅ DOCKER ИСПРАВЛЕН - ВСЕ В КОНТЕЙНЕРАХ

## Что было исправлено:

1. ✅ **Backend вернулся в Docker** - использует ts-node (без компиляции)
2. ✅ **DATABASE_URL передается** - из .env в контейнер
3. ✅ **Nginx подключается к backend:4000** - через Docker сеть
4. ✅ **Убран локальный backend** - все работает в контейнерах

---

## 🎯 ЧТО ДЕЛАТЬ НА СЕРВЕРЕ:

### Шаг 1: Скопируйте файлы на сервер

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

### Шаг 2: Остановите локальный backend

Если backend запущен локально (в терминале), нажмите `Ctrl+C`

### Шаг 3: Пересоберите и запустите Docker

```bash
cd ~/store-reconstruction

# Остановить все
docker compose down

# Пересобрать backend (использует ts-node, без компиляции)
docker compose build --no-cache backend

# Запустить все
docker compose up -d

# Проверить статус
docker compose ps
```

### Шаг 4: Проверьте логи

```bash
# Логи backend
docker compose logs -f backend

# Должны увидеть:
# 🚀 Backend running on http://localhost:4000
# 📚 Swagger docs: http://localhost:4000/api/docs
```

### Шаг 5: Проверьте работоспособность

В браузере:
- **Frontend**: http://localhost:5001
- **Health check**: http://localhost:5001/api/health

---

## 📁 Что изменилось:

### backend/Dockerfile
```dockerfile
# Использует ts-node вместо компиляции
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]
```

### docker-compose.yml
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  environment:
    DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
    # ... другие переменные
```

### nginx/nginx.conf
```nginx
location /api/ {
    proxy_pass http://backend:4000/api/;
}
```

---

## 🏗 Архитектура:

```
┌─────────────────────────────────────────┐
│         Браузер (localhost:5001)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Frontend Container (Nginx:80)          │
│  - Отдает React приложение              │
│  - Проксирует /api/ → backend:4000      │
└──────────────┬──────────────────────────┘
               │ Docker сеть
               ▼
┌─────────────────────────────────────────┐
│  Backend Container (NestJS:4000)        │
│  - ts-node (без компиляции)             │
│  - Prisma client                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (внешняя БД)                │
│  - 10.2.0.252:5432                      │
└─────────────────────────────────────────┘
```

---

## ✅ Проверочный чеклист:

После выполнения команд:

- [ ] Локальный backend остановлен (Ctrl+C в терминале)
- [ ] `docker compose ps` показывает backend и frontend
- [ ] `docker compose logs backend` показывает "🚀 Backend running"
- [ ] http://localhost:5001 открывает приложение
- [ ] http://localhost:5001/api/health возвращает `{"status":"ok",...}`

---

## 🐛 Если что-то не работает:

### Backend не запускается

```bash
# Посмотреть полные логи
docker compose logs backend

# Пересобрать
docker compose build --no-cache backend
docker compose up -d backend
```

### Ошибка DATABASE_URL

```bash
# Проверить .env
cat .env | grep DB_

# Убедиться, что все переменные установлены:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

### Frontend не может подключиться к backend

```bash
# Проверить, что backend доступен из контейнера frontend
docker compose exec frontend curl http://backend:4000/api/health

# Если не работает - проверить сеть
docker network inspect store-reconstruction_app-network
```

---

## 📝 Преимущества этого решения:

✅ **Все в Docker** - не нужно запускать backend локально  
✅ **ts-node** - не требует компиляции (избегаем проблем с dist/)  
✅ **DATABASE_URL** - передается из .env в контейнер  
✅ **Docker сеть** - nginx подключается к backend через имя сервиса  
✅ **Просто** - одна команда `docker compose up -d`  

---

## 🔄 Команды для управления:

```bash
# Запустить все
docker compose up -d

# Остановить все
docker compose down

# Перезапустить backend
docker compose restart backend

# Посмотреть логи
docker compose logs -f backend
docker compose logs -f frontend

# Пересобрать после изменений
docker compose build --no-cache
docker compose up -d

# Проверить статус
docker compose ps
```

---

## 📚 Документация:

- **DOCKER_QUICKSTART.md** - Быстрый старт
- **FINAL_INSTRUCTION.md** - Полная инструкция
- **README.md** - Основная документация

---

**Время запуска:** ~2 минуты  
**Команды:** `docker compose down && docker compose build --no-cache && docker compose up -d`
