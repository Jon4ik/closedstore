# 🚀 Инструкция по развёртыванию в Docker

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <your-repo-url>
cd closedstore
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
nano .env
```

Обязательно измените:
- `POSTGRES_PASSWORD` - пароль для базы данных
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
- `DOMAIN` - домен или IP-адрес вашего сервера

### 3. Запуск Docker Compose

```bash
docker compose up -d
```

### 4. Проверка статуса

```bash
docker compose ps
```

Все сервисы должны быть в статусе `Up`:
- `reconstruction-db` (PostgreSQL)
- `reconstruction-api` (Backend)
- `reconstruction-frontend` (Frontend)

### 5. Доступ к приложению

Откройте браузер:
- **Frontend**: `http://your-server-ip`
- **Backend API**: `http://your-server-ip/api`
- **Swagger Docs**: `http://your-server-ip/api/docs`

### 6. Первый вход

Используйте учётные данные:
- **Логин**: `admin`
- **Пароль**: `admin123`

⚠️ **Важно**: Сразу после первого входа измените пароль администратора!

## Структура проекта

```
closedstore/
├── frontend/              # React приложение
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/               # NestJS API
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── Dockerfile
├── nginx/                 # Nginx конфигурация
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## Основные команды

### Запуск всех сервисов
```bash
docker compose up -d
```

### Остановка всех сервисов
```bash
docker compose down
```

### Перезапуск сервисов
```bash
docker compose restart
```

### Просмотр логов
```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Пересборка после изменений
```bash
docker compose up -d --build
```

## Обновление приложения

### Обновление frontend
```bash
docker compose up -d --build frontend
```

### Обновление backend
```bash
docker compose up -d --build backend
```

### Обновление всех сервисов
```bash
docker compose pull
docker compose up -d --build
```

## Работа с базой данных

### Подключение к PostgreSQL
```bash
docker compose exec postgres psql -U postgres -d store_reconstruction
```

### Создание резервной копии
```bash
docker compose exec postgres pg_dump -U postgres store_reconstruction > backup_$(date +%Y%m%d).sql
```

### Восстановление из резервной копии
```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres store_reconstruction
```

### Применение миграций
```bash
docker compose exec backend npx prisma migrate deploy
```

### Запуск seed данных
```bash
docker compose exec backend npx prisma db seed
```

## Решение проблем

### Ошибка: "npm ci requires package-lock.json"

Если вы видите эту ошибку, замените `npm ci` на `npm install` в Dockerfile:

```dockerfile
# Было:
RUN npm ci

# Стало:
RUN npm install
```

### Backend не запускается

Проверьте логи:
```bash
docker compose logs backend
```

Частые проблемы:
- Неправильные настройки в `.env`
- База данных еще не готова (подождите 10-20 секунд)
- Порт 4000 уже занят

### Frontend не открывается

Проверьте:
```bash
docker compose logs frontend
```

Убедитесь, что:
- Порт 80 не занят другим сервисом
- Nginx конфигурация корректна

### Очистка и полный перезапуск

```bash
# Остановить и удалить все контейнеры
docker compose down -v

# Удалить образы
docker compose down --rmi all

# Пересобрать и запустить заново
docker compose up -d --build
```

## Production рекомендации

### 1. Безопасность
- Измените все пароли по умолчанию
- Используйте HTTPS (настройте SSL в Nginx)
- Ограничьте доступ к портам через firewall

### 2. Мониторинг
- Настройте логирование
- Используйте мониторинг ресурсов
- Настройте алерты

### 3. Резервное копирование
- Настройте автоматический бэкап базы данных
- Храните бэкапы в другом месте
- Регулярно проверяйте восстановление

### 4. Обновления
- Регулярно обновляйте базовые образы
- Тестируйте обновления на staging
- Имейте план отката

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все сервисы запущены: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Проверьте доступность портов

Для дополнительной помощи обратитесь к документации или создайте issue в репозитории.

---

**Версия системы:** 1.0.0  
**Дата обновления:** 2024
