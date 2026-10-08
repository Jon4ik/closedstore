# 🚀 Инструкция по развёртыванию в Docker (без PostgreSQL)

## Требования

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (внешняя база данных)

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
- `DB_HOST` - хост вашей PostgreSQL базы данных
- `DB_PORT` - порт PostgreSQL (обычно 5432)
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь PostgreSQL
- `DB_PASSWORD` - пароль пользователя PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
- `DOMAIN` - домен или IP-адрес вашего сервера

Пример `.env`:
```env
DB_HOST=192.168.1.100
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
DOMAIN=reconstruction.yourcompany.ru
```

### 3. Инициализация базы данных

Перед запуском приложения необходимо создать базу данных и применить миграции:

```bash
# Создайте базу данных в PostgreSQL
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Запустите скрипт инициализации
chmod +x init-db.sh
./init-db.sh
```

Или вручную:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Запуск Docker Compose

```bash
docker compose up -d
```

### 5. Проверка статуса

```bash
docker compose ps
```

Должны быть запущены два сервиса:
- `reconstruction-api` (Backend)
- `reconstruction-frontend` (Frontend)

### 6. Доступ к приложению

Откройте браузер:
- **Frontend**: `http://your-server-ip:5001`
- **Backend API**: `http://your-server-ip:4000/api`
- **Swagger Docs**: `http://your-server-ip:4000/api/docs`

### 7. Первый вход

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
├── init-db.sh            # Скрипт инициализации БД
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
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

### Создание резервной копии
```bash
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql
```

### Восстановление из резервной копии
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup.sql
```

### Применение миграций
```bash
cd backend
npx prisma migrate deploy
```

### Запуск seed данных
```bash
cd backend
npx prisma db seed
```

## Решение проблем

### Backend не может подключиться к PostgreSQL

Проверьте:
```bash
# Проверьте логи backend
docker compose logs backend

# Проверьте доступность PostgreSQL
docker compose exec backend ping $DB_HOST

# Проверьте настройки .env
cat .env | grep DB_
```

Убедитесь, что:
- PostgreSQL запущен и доступен
- Порт 5432 открыт в firewall
- Пользователь имеет права на базу данных
- Настройки в `.env` корректны

### Backend не запускается

Проверьте логи:
```bash
docker compose logs backend
```

Частые проблемы:
- Неправильные настройки в `.env`
- База данных не создана
- Миграции не применены
- Порт 4000 уже занят

### Frontend не открывается

Проверьте:
```bash
docker compose logs frontend
```

Убедитесь, что:
- Порт 5001 не занят другим сервисом
- Nginx конфигурация корректна
- Backend доступен

### Ошибка инициализации базы данных

Если скрипт `init-db.sh` не работает:
```bash
# Создайте базу данных вручную
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Примените миграции
cd backend
npx prisma migrate deploy

# Запустите seed
npx prisma db seed
```

### Очистка и полный перезапуск

```bash
# Остановить и удалить все контейнеры
docker compose down

# Пересобрать и запустить заново
docker compose up -d --build
```

## Production рекомендации

### 1. Безопасность
- Измените все пароли по умолчанию
- Используйте HTTPS (настройте SSL в Nginx)
- Ограничьте доступ к портам через firewall
- Используйте SSL для подключения к PostgreSQL

### 2. Мониторинг
- Настройте логирование
- Используйте мониторинг ресурсов
- Настройте алерты
- Мониторьте состояние PostgreSQL

### 3. Резервное копирование
- Настройте автоматический бэкап базы данных
- Храните бэкапы в другом месте
- Регулярно проверяйте восстановление

Пример cron для ежедневного бэкапа:
```bash
0 2 * * * pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > /backups/db_$(date +\%Y\%m\%d).sql
```

### 4. Обновления
- Регулярно обновляйте базовые образы
- Тестируйте обновления на staging
- Имейте план отката

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все сервисы запущены: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Проверьте доступность PostgreSQL
5. Проверьте доступность портов

Для дополнительной помощи обратитесь к документации или создайте issue в репозитории.

---

**Версия системы:** 1.0.0  
**Дата обновления:** 2024
