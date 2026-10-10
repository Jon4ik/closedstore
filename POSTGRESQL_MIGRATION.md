# ✅ Все данные теперь из PostgreSQL

## Что было изменено

### 1. Убрано локальное хранилище (IndexedDB)

**Было:**
- Данные хранились в IndexedDB браузера
- Seed данные загружались при первом запуске
- Каждый пользователь видел свои локальные данные

**Стало:**
- Все данные хранятся только в PostgreSQL
- Нет локальных данных
- Все пользователи видят одни и те же данные из БД

### 2. Удалены стандартные данные

**Удалено:**
- 12 тестовых объектов (магазинов)
- 12 тестовых ТУ (территориальных управляющих)

**Оставлено:**
- 3 системные роли (Администратор, Менеджер, Наблюдатель)
- 3 тестовых пользователя (admin, manager, viewer)

Эти данные создаются при инициализации базы данных через Prisma seed.

### 3. Добавлена работа с API

**Создано:**
- `src/api/client.ts` - API клиент для работы с backend
- Все методы store теперь работают через API
- Данные загружаются из PostgreSQL при входе

### 4. Сохранение сессии

**Добавлено:**
- JWT токен сохраняется в localStorage
- Информация о пользователе сохраняется в localStorage
- При обновлении страницы (F5) сессия восстанавливается
- Не нужно входить заново после обновления страницы

### 5. Удалены файлы без Docker

**Удалено:**
- `install.sh` - установка без Docker
- `start.sh` - запуск без Docker
- `stop.sh` - остановка без Docker
- `status.sh` - проверка статуса без Docker
- `quickstart.sh` - быстрый старт без Docker
- `README_NO_DOCKER.md` - инструкция без Docker
- `WSL_QUICKSTART.md` - инструкция для WSL
- `QUICKSTART.md` - быстрый старт
- `START_HERE.md` - начало работы
- `PROJECT_STRUCTURE.md` - структура проекта
- `INIT_DB_README.md` - инициализация БД
- `INSTALL_RU.md` - инструкция установки
- `DOCKER_QUICKSTART.md` - быстрый старт Docker
- `DOCKER_DEPLOY.md` - развертывание Docker
- `DOCKER_FIXED.md` - исправления Docker
- `DEPLOYMENT.md` - развертывание
- `FIX_WHITE_PAGE.md` - исправление белой страницы
- `FIX_PORTS_AND_TITLE.md` - исправление портов
- `FIX_P3005.md` - исправление ошибки Prisma
- `FIX_BACKEND_BUILD.md` - исправление сборки backend
- `FIX_APP_TSX.md` - исправление App.tsx
- `FINAL_SOLUTION.md` - финальное решение
- `FINAL_INSTRUCTION.md` - финальная инструкция
- `DO_THIS_NOW.md` - что делать сейчас
- `TROUBLESHOOTING_PRISMA.md` - проблемы с Prisma
- `TROUBLESHOOTING_P3005.md` - проблемы с P3005
- `SOLUTION_30SEC.md` - быстрое решение
- `README_FIX.md` - исправление README
- `QUICK_FIX_BACKEND.md` - быстрое исправление backend
- `rebuild-backend.sh` - пересборка backend
- `rebuild-backend-debug.sh` - пересборка с отладкой
- `rebuild-backend-tsc.sh` - пересборка с tsc
- `rebuild-backend-tsnode.sh` - пересборка с ts-node
- `rebuild-frontend.sh` - пересборка frontend
- `rebuild-frontend-full.sh` - полная пересборка frontend
- `setup-local-backend.sh` - настройка локального backend
- `fix-prisma.sh` - исправление Prisma
- `init-db.sh` - инициализация БД
- `init-db.sql` - SQL инициализации
- `cleanup-db.sql` - очистка БД
- `baseline-migration.sh` - baseline миграция
- `reset-database.sh` - сброс базы данных
- `backend/Dockerfile.tsc` - альтернативный Dockerfile
- `backend/Dockerfile.tsnode` - альтернативный Dockerfile
- `backend/apply-migrations.sh` - применение миграций

**Оставлено:**
- `README.md` - основная документация (только Docker)
- `ARCHITECTURE.md` - архитектура системы
- `docker-compose.yml` - конфигурация Docker
- `Dockerfile` - Dockerfile для frontend
- `backend/Dockerfile` - Dockerfile для backend
- `nginx/nginx.conf` - конфигурация nginx
- `.env.example` - пример конфигурации

### 6. Обновлен README

**Теперь содержит:**
- Только инструкцию по запуску через Docker
- Настройка подключения к PostgreSQL
- Основные команды Docker
- Резервное копирование
- Безопасность

## Как это работает

### Поток данных

```
┌─────────────┐
│  Браузер    │
│  (React)    │
└──────┬──────┘
       │
       │ HTTP запросы с JWT токеном
       ▼
┌─────────────┐
│   Nginx     │
│  (порт 80)  │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │
│   (React)   │    │  (NestJS)   │
│  порт 5001  │    │  порт 4000  │
└─────────────┘    └──────┬──────┘
                          │
                          │ SQL запросы
                          ▼
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │  порт 5432  │
                   └─────────────┘
```

### Авторизация

1. Пользователь вводит логин/пароль
2. Frontend отправляет POST `/api/auth/login`
3. Backend проверяет в PostgreSQL
4. Backend возвращает JWT токен
5. Frontend сохраняет токен в localStorage
6. Все последующие запросы включают токен

### Загрузка данных

1. После входа frontend загружает данные:
   - `GET /api/stores` - объекты
   - `GET /api/tus` - ТУ
   - `GET /api/users` - пользователи
   - `GET /api/roles` - роли
2. Backend читает из PostgreSQL
3. Frontend сохраняет в Zustand store
4. Компоненты отображают данные

### Создание/обновление

1. Пользователь создает/редактирует объект
2. Frontend отправляет POST/PUT `/api/stores`
3. Backend валидирует данные
4. Backend записывает в PostgreSQL
5. Backend записывает в audit_logs
6. Frontend обновляет store

## Учетные данные

### Пользователи (создаются при инициализации БД)

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

⚠️ **Важно:** Измените пароли после первого входа!

## Проверка данных в PostgreSQL

### Подключение к БД

```bash
psql -h localhost -U postgres -d store_reconstruction
```

### Просмотр таблиц

```sql
-- Список таблиц
\dt

-- Количество объектов
SELECT COUNT(*) FROM projects;

-- Количество ТУ
SELECT COUNT(*) FROM tus;

-- Количество пользователей
SELECT COUNT(*) FROM users;

-- Количество ролей
SELECT COUNT(*) FROM roles;

-- Последние объекты
SELECT * FROM projects ORDER BY "createdAt" DESC LIMIT 10;

-- Аудит последних действий
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20;
```

## Резервное копирование

### Создать бэкап

```bash
pg_dump -h localhost -U postgres store_reconstruction > backup_$(date +%Y%m%d).sql
```

### Восстановить из бэкапа

```bash
psql -h localhost -U postgres store_reconstruction < backup.sql
```

### Автоматический бэкап (cron)

```bash
# Добавить в crontab
0 2 * * * pg_dump -h localhost -U postgres store_reconstruction > /backups/db_$(date +\%Y\%m\%d).sql
```

## Обновление на сервере

```bash
# 1. Остановить контейнеры
docker compose down

# 2. Получить обновления
git pull

# 3. Пересобрать и запустить
docker compose up -d --build

# 4. Проверить логи
docker compose logs -f
```

## Преимущества новой архитектуры

✅ **Централизованное хранение** - все данные в одном месте  
✅ **Консистентность** - все пользователи видят одни и те же данные  
✅ **Безопасность** - данные защищены PostgreSQL  
✅ **Масштабируемость** - можно добавить репликации  
✅ **Резервное копирование** - стандартные инструменты PostgreSQL  
✅ **Аудит** - все действия записываются в БД  
✅ **Сессия** - не нужно входить заново после F5  

## Что дальше

1. **Создайте ТУ** через интерфейс "Справочник ТУ"
2. **Добавьте объекты** через "Таблица объектов"
3. **Импортируйте данные** из Excel через кнопку "Импорт"
4. **Настройте пользователей** через "Пользователи"
5. **Настройте роли** через "Роли"

Все данные будут сохранены в PostgreSQL и доступны всем пользователям системы.

---

**Версия:** 2.0.0  
**Дата:** 2024-10-10  
**Изменения:** Переход на PostgreSQL, удаление локального хранилища
