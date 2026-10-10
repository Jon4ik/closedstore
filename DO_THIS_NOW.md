# 🎯 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

## Ваша проблема

Backend в Docker не может найти скомпилированный код:
```
Error: Cannot find module '/app/dist/main'
```

## ✅ РЕШЕНИЕ (2 минуты)

### Шаг 1: Пересобрать backend

```bash
chmod +x rebuild-backend.sh
./rebuild-backend.sh
```

Этот скрипт:
- Остановит backend
- Удалит старый образ
- Пересоберет backend без кэша
- Запустит backend заново
- Покажет логи

### Шаг 2: Проверить результат

```bash
# Проверить статус
docker compose ps backend

# Должно быть: Up (healthy) или Up

# Проверить логи
docker compose logs --tail=20 backend

# Должны увидеть:
# Starting application...
# Build successful
# Application is running on: http://0.0.0.0:4000
```

### Шаг 3: Проверить работоспособность

```bash
# Проверить backend API
curl http://localhost:4000/api/health

# Должно вернуть:
# {"status":"ok","timestamp":"2024-..."}
```

## 🔄 Если не помогло

### Полная очистка и пересборка

```bash
# Остановить все
docker compose down

# Удалить все образы
docker compose down --rmi all

# Очистить кэш Docker
docker system prune -a --volumes

# Пересобрать все
docker compose build --no-cache

# Запустить
docker compose up -d

# Проверить логи
docker compose logs -f backend
```

## 📋 Что было исправлено

✅ **Dockerfile упрощен** - убран multi-stage build, который вызывал проблемы  
✅ **Добавлена отладка** - Dockerfile теперь проверяет наличие файлов после сборки  
✅ **Улучшена совместимость** - используется Debian-based образ вместо Alpine  
✅ **Создан скрипт пересборки** - `rebuild-backend.sh` для быстрого решения

## 📖 Документация

- **QUICK_FIX_BACKEND.md** - Быстрое решение этой проблемы
- **FIX_BACKEND_BUILD.md** - Подробная документация
- **START_HERE.md** - Общий быстрый старт

## 🆘 Если ничего не помогает

### Альтернатива: Запустить backend локально (без Docker)

```bash
# Остановить Docker backend
docker compose stop backend

# Перейти в папку backend
cd backend

# Установить зависимости
npm install

# Сгенерировать Prisma client
npx prisma generate

# Собрать проект
npm run build

# Запустить
npm run start:prod

# В другом терминале запустить frontend
cd ..
chmod +x start.sh
./start.sh
```

## ✅ Проверочный чеклист

- [ ] Выполнен `./rebuild-backend.sh`
- [ ] В логах видно "Build successful"
- [ ] В логах видно "Application is running on: http://0.0.0.0:4000"
- [ ] `curl http://localhost:4000/api/health` возвращает `{"status":"ok",...}`
- [ ] Frontend доступен на http://localhost:5001

---

**Время решения:** ~2 минуты  
**Если не помогло:** используйте полную очистку или запустите backend локально
