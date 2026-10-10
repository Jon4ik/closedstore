# 🎯 ФИНАЛЬНОЕ РЕШЕНИЕ - ЗАПУСК BACKEND ЛОКАЛЬНО

## Проблема

Docker контейнер backend не может скомпилировать код:
```
Error: Cannot find module '/app/dist/main.js'
```

## ✅ РЕШЕНИЕ: Запустить backend БЕЗ DOCKER

Это самый надежный способ. Backend будет работать локально на сервере.

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### Шаг 1: Скопируйте обновленные файлы на сервер

На вашем локальном компьютере выполните:

```bash
# Если используете git
git add .
git commit -m "Fix: switch to local backend"
git push

# На сервере
cd ~/store-reconstruction
git pull
```

Или скопируйте файлы вручную:
- `docker-compose.yml`
- `nginx/nginx.conf`
- `setup-local-backend.sh`

### Шаг 2: Запустите скрипт настройки

```bash
cd ~/store-reconstruction
chmod +x setup-local-backend.sh
./setup-local-backend.sh
```

Этот скрипт:
- Остановит Docker backend
- Установит зависимости backend
- Обновит Prisma
- Пересоберет frontend контейнер
- Запустит frontend

### Шаг 3: Запустите backend локально

**В НОВОМ терминале** (не закрывайте текущий):

```bash
cd ~/store-reconstruction/backend
npm run start:dev
```

Дождитесь сообщения:
```
🚀 Backend running on http://localhost:4000
📚 Swagger docs: http://localhost:4000/api/docs
```

### Шаг 4: Проверьте работоспособность

В браузере откройте:
- **Frontend**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health
- **Swagger**: http://localhost:5001/api/docs

Должны увидеть:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## 🔄 Как это работает

```
┌─────────────────────────────────────────┐
│         Браузер (localhost:5001)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Frontend Container (Nginx:80)          │
│  - Отдает React приложение              │
│  - Проксирует /api/ → host:4000         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend (локально на хосте:4000)       │
│  - NestJS приложение                    │
│  - Запущено через npm run start:dev     │
└─────────────────────────────────────────┘
```

---

## 📊 Что изменилось

### docker-compose.yml
- ✅ Backend сервис закомментирован (не запускается в Docker)
- ✅ Frontend использует `host.docker.internal` для подключения к локальному backend
- ✅ Добавлен `extra_hosts` для доступа к хосту из контейнера

### nginx/nginx.conf
- ✅ `proxy_pass` изменен с `http://backend:4000` на `http://host.docker.internal:4000`
- ✅ Nginx теперь подключается к backend на хосте, а не в контейнере

---

## 🛠 Управление

### Запуск backend

```bash
cd ~/store-reconstruction/backend

# Режим разработки (с автоперезагрузкой)
npm run start:dev

# Или production режим
npm run build
npm run start:prod
```

### Остановка backend

В терминале, где запущен backend, нажмите `Ctrl+C`

### Перезапуск frontend

```bash
docker compose restart frontend
```

### Просмотр логов

```bash
# Frontend (nginx)
docker compose logs -f frontend

# Backend (локальный) - смотрите в терминал, где запущен backend
```

---

## ✅ Проверочный чеклист

После выполнения всех шагов:

- [ ] Docker backend остановлен: `docker compose ps` не показывает backend
- [ ] Backend запущен локально: `npm run start:dev` работает
- [ ] Frontend контейнер запущен: `docker compose ps` показывает frontend
- [ ] http://localhost:5001 открывает приложение
- [ ] http://localhost:5001/api/health возвращает `{"status":"ok",...}`
- [ ] http://localhost:5001/api/docs открывает Swagger

---

## 🐛 Решение проблем

### Ошибка: "Cannot find module '@prisma/client'"

```bash
cd ~/store-reconstruction/backend
npm install @prisma/client@latest
npx prisma generate
```

### Ошибка: "EADDRINUSE: port 4000 already in use"

```bash
# Найти процесс
lsof -i:4000

# Остановить
kill <PID>
```

### Frontend не может подключиться к backend

Проверьте, что backend запущен:
```bash
curl http://localhost:4000/api/health
```

Если не работает, перезапустите backend:
```bash
cd ~/store-reconstruction/backend
npm run start:dev
```

### Nginx возвращает 502 Bad Gateway

Это значит, что nginx не может подключиться к backend. Проверьте:

1. Backend запущен?
   ```bash
   curl http://localhost:4000/api/health
   ```

2. Frontend контейнер пересобран?
   ```bash
   docker compose build --no-cache frontend
   docker compose up -d frontend
   ```

---

## 📝 Преимущества этого решения

✅ **Надежно** - не зависит от Docker сборки  
✅ **Быстро** - hot reload при изменении кода  
✅ **Просто** - легко отлаживать  
✅ **Гибко** - можно запускать в разных режимах  

---

## 🔄 Альтернатива: Вернуться к Docker

Если хотите вернуться к Docker backend:

1. Раскомментируйте backend сервис в `docker-compose.yml`
2. Измените `proxy_pass` в `nginx/nginx.conf` обратно на `http://backend:4000`
3. Используйте `Dockerfile.tsnode` вместо обычного Dockerfile
4. Пересоберите: `docker compose up -d --build backend`

Но **рекомендуется использовать локальный backend** - это надежнее.

---

## 📚 Документация

- [FINAL_SOLUTION.md](FINAL_SOLUTION.md) - Полное объяснение проблемы
- [FIX_PORTS_AND_TITLE.md](FIX_PORTS_AND_TITLE.md) - Исправление портов
- [README_NO_DOCKER.md](README_NO_DOCKER.md) - Запуск без Docker

---

**Время настройки:** ~5 минут  
**Команда:** `chmod +x setup-local-backend.sh && ./setup-local-backend.sh`
