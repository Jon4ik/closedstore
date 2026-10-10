# 🔧 Решение ошибки миграции P3018

## Проблема

```
Error: P3018
A migration failed to apply.
ОШИБКА: тип "WorkType" уже существует
```

## Причина

В базе данных уже есть таблицы/типы от предыдущих попыток инициализации. Миграция пытается создать их заново и получает ошибку.

## ✅ Решение

### Шаг 1: Очистите базу данных

```bash
cd ~/store-reconstruction

# Сделайте скрипт исполняемым
chmod +x reset-database.sh

# Запустите очистку
./reset-database.sh
```

Скрипт удалит:
- Все таблицы
- Все типы (включая WorkType)
- Таблицу миграций Prisma
- Все данные

### Шаг 2: Пересоберите и перезапустите backend

```bash
# Остановите backend
docker compose stop backend

# Удалите контейнер
docker compose rm -f backend

# Пересоберите образ
docker compose build --no-cache backend

# Запустите заново
docker compose up -d backend

# Проверьте логи
docker compose logs -f backend
```

В логах должны увидеть:
```
Applying migration '20240101000000_init'
🌱 Seeding database...
✅ Roles created
✅ Users created
🚀 Backend running on http://localhost:4000
```

### Шаг 3: Проверьте создание таблиц

```bash
# Подключитесь к БД
psql -h your-postgres-host -U your-user -d store_reconstruction

# Посмотрите список таблиц
\dt

# Должны увидеть 7 таблиц:
# _prisma_migrations
# roles
# users
# tus
# store_projects
# comments
# audit_logs

# Проверьте пользователей
SELECT username, "fullName" FROM users;

# Должны увидеть:
# admin    | Администратор Системы
# manager  | Иванов И.И.
# viewer   | Петров П.П.

# Выйдите
\q
```

### Шаг 4: Войдите в систему

Откройте http://your-server-ip:5001

**Учётные данные:**
| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

---

## Альтернативное решение (без очистки БД)

Если не хотите удалять данные, можно сбросить только миграции:

```bash
# Войдите в backend контейнер
docker compose exec backend sh

# Отметьте миграцию как примененную (даже если она не применилась)
npx prisma migrate resolve --applied 20240101000000_init

# Выйдите
exit

# Перезапустите backend
docker compose restart backend
```

**ВНИМАНИЕ:** Этот метод работает только если таблицы уже созданы правильно. Если есть проблемы со схемой, лучше использовать полную очистку.

---

## Что было исправлено

### Обновлена миграция

Файл `backend/prisma/migrations/20240101000000_init/migration.sql` теперь использует проверки существования:

**Было:**
```sql
CREATE TYPE "WorkType" AS ENUM ('Закрытие', 'Реконструкция', 'Открытие');
CREATE TABLE "roles" (...);
```

**Стало:**
```sql
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkType') THEN
        CREATE TYPE "WorkType" AS ENUM ('Закрытие', 'Реконструкция', 'Открытие');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        CREATE TABLE "roles" (...);
    END IF;
END $$;
```

Теперь миграция не будет падать, если таблицы уже существуют.

---

## Проверочный чеклист

После выполнения всех шагов проверьте:

- [ ] База данных очищена (все таблицы удалены)
- [ ] Backend контейнер пересобран
- [ ] В логах backend видно "Applying migration"
- [ ] В логах backend видно "Seeding database"
- [ ] Таблицы созданы (7 штук)
- [ ] Роли созданы (3 штуки)
- [ ] Пользователи созданы (3 штуки)
- [ ] Можно войти с логином `admin` / `admin123`

---

## Полезные команды

```bash
# Полная очистка базы данных
./reset-database.sh

# Пересборка backend
docker compose stop backend
docker compose rm -f backend
docker compose build --no-cache backend
docker compose up -d backend

# Просмотр логов
docker compose logs -f backend

# Проверка таблиц в БД
psql -h your-postgres-host -U your-user -d store_reconstruction -c "\dt"

# Проверка пользователей
psql -h your-postgres-host -U your-user -d store_reconstruction -c "SELECT username, \"fullName\" FROM users;"

# Сброс миграции (если нужно)
docker compose exec backend npx prisma migrate resolve --applied 20240101000000_init

# Статус миграций
docker compose exec backend npx prisma migrate status
```

---

## Если проблема не решена

### Вариант 1: Удалите базу данных полностью

```bash
# Удалите базу данных
psql -h your-postgres-host -U your-user -c "DROP DATABASE store_reconstruction;"

# Создайте заново
psql -h your-postgres-host -U your-user -c "CREATE DATABASE store_reconstruction;"

# Пересоберите backend
docker compose build --no-cache backend
docker compose up -d backend
```

### Вариант 2: Используйте prisma db push

Если миграции не работают, можно использовать `prisma db push`:

```bash
# Войдите в backend контейнер
docker compose exec backend sh

# Примените схему напрямую (без миграций)
npx prisma db push

# Запустите seed
npx prisma db seed

# Выйдите
exit

# Перезапустите backend
docker compose restart backend
```

**ВНИМАНИЕ:** `prisma db push` не создает миграции, а просто синхронизирует схему с БД. Это подходит для разработки, но не рекомендуется для production.

---

## Документация

- **TROUBLESHOOTING_DATABASE.md** - общие проблемы с БД
- **README.md** - основная документация
- **ARCHITECTURE.md** - архитектура системы

---

**Обновлено:** 2024-10-10  
**Версия:** 2.0.1  
**Изменения:** Исправлена миграция с проверками существования таблиц
