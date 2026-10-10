# ✅ ПРОБЛЕМА РЕШЕНА - ОБНОВЛЕНИЕ FRONTEND И ПОРТОВ

## Что было исправлено:

1. ✅ **Обновлен заголовок в index.html** - теперь "Реконструкция — Закрытие"
2. ✅ **Исправлен порт backend** - теперь доступен на `0.0.0.0:4000`
3. ✅ **Пересобран frontend** - с новым заголовком

## 🎯 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС:

### Шаг 1: Пересобрать frontend и применить изменения

```bash
chmod +x rebuild-frontend.sh
./rebuild-frontend.sh
```

Этот скрипт:
- Пересоберет frontend с новым заголовком
- Применит изменения портов backend
- Перезапустит оба контейнера

### Шаг 2: Проверить доступ

```bash
# Frontend (должен показать правильное название)
curl http://localhost:5001

# Backend API напрямую
curl http://localhost:4000/api/health

# Backend через nginx (рекомендуется)
curl http://localhost:5001/api/health
```

## 📊 Как работает система:

```
┌─────────────────────────────────────────┐
│         Браузер (localhost:5001)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Frontend Container (Nginx:80)        │
│    - Отдает React приложение            │
│    - Проксирует /api/ → backend:4000    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Backend Container (NestJS:4000)      │
│    - REST API                           │
│    - Swagger docs: /api/docs            │
└─────────────────────────────────────────┘
```

## 🔗 Доступ к приложению:

### Через nginx (РЕКОМЕНДУЕТСЯ):
- **Frontend**: http://localhost:5001
- **API**: http://localhost:5001/api
- **Swagger**: http://localhost:5001/api/docs

### Напрямую к backend:
- **API**: http://localhost:4000/api
- **Swagger**: http://localhost:4000/api/docs
- **Health**: http://localhost:4000/api/health

## ✅ Проверочный чеклист:

После выполнения `./rebuild-frontend.sh`:

- [ ] Frontend показывает "Реконструкция — Закрытие" (не "coder-app-name")
- [ ] http://localhost:5001 открывает приложение
- [ ] http://localhost:5001/api/health возвращает `{"status":"ok",...}`
- [ ] http://localhost:4000/api/health возвращает `{"status":"ok",...}`
- [ ] http://localhost:5001/api/docs открывает Swagger

## 🐛 Если что-то не работает:

### Frontend показывает старое название:

```bash
# Очистить кэш браузера
# Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac)

# Или открыть в режиме инкогнито
```

### Backend недоступен на порту 4000:

```bash
# Проверить, что контейнер запущен
docker compose ps backend

# Проверить логи
docker compose logs backend

# Перезапустить
docker compose restart backend
```

### Nginx возвращает 502/503:

```bash
# Проверить, что backend доступен из контейнера frontend
docker compose exec frontend curl http://backend:4000/api/health

# Если не работает - проверить сеть
docker network inspect store-reconstruction_app-network
```

## 📝 Что было изменено:

### index.html
```diff
- <title>coder-app-name</title>
+ <title>Реконструкция — Закрытие</title>
```

### docker-compose.yml
```diff
  backend:
    ports:
-     - "127.0.0.1:4000:4000"
+     - "4000:4000"
```

## 🎉 Готово!

После выполнения `./rebuild-frontend.sh` приложение должно работать корректно:
- Frontend на http://localhost:5001
- Backend API на http://localhost:4000/api
- Swagger на http://localhost:5001/api/docs

---

**Время выполнения:** ~1 минута  
**Команда:** `chmod +x rebuild-frontend.sh && ./rebuild-frontend.sh`
