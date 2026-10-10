# 🗑️ Очистка базы данных

## ⚠️ ВНИМАНИЕ

Это удалит **ВСЕ данные** из базы данных:
- Все объекты (магазины)
- Все ТУ (территориальные управляющие)
- Все пользователи (кроме системных)
- Все роли (кроме системных)
- Все комментарии
- Весь журнал аудита

## Быстрая очистка

### Шаг 1: Сделать скрипт исполняемым
```bash
chmod +x cleanup-db.sh
```

### Шаг 2: Запустить очистку
```bash
./cleanup-db.sh
```

Скрипт:
- Запросит подтверждение
- Удалит все таблицы
- Удалит все данные
- Очистит схему public

### Шаг 3: Перезапустить backend
```bash
docker compose restart backend
```

Backend автоматически:
- Применит миграции Prisma
- Создаст все таблицы заново
- Запустит seed данные (создаст системные роли и пользователей)

---

## Ручная очистка (если скрипт не работает)

### Вариант 1: Через psql
```bash
# Подключиться к БД
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Выполнить SQL скрипт
\i cleanup-db.sql

# Выйти
\q
```

### Вариант 2: Удалить и создать базу заново
```bash
# Удалить базу данных
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE $DB_NAME;"

# Создать базу данных заново
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Перезапустить backend
docker compose restart backend
```

---

## Проверка после очистки

### Шаг 1: Проверить таблицы
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"
```

Должны увидеть:
- `_prisma_migrations`
- `audit_logs`
- `comments`
- `roles`
- `store_projects`
- `tus`
- `users`

### Шаг 2: Проверить пользователей
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT username, \"fullName\" FROM users;"
```

Должны увидеть системных пользователей:
- admin
- manager
- viewer

### Шаг 3: Проверить роли
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT name FROM roles;"
```

Должны увидеть системные роли:
- Администратор
- Менеджер
- Наблюдатель

---

## Вход после очистки

Используйте стандартные учетные данные:

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

⚠️ **Важно:** Измените пароли после первого входа!

---

## Что хранится в audit_logs

### Структура записи
```sql
{
  id: UUID,              -- Уникальный ID записи
  storeId: UUID | null,  -- ID объекта (если есть)
  userId: UUID,          -- ID пользователя (ОСНОВНОЙ)
  userName: string,      -- Имя пользователя (для удобства)
  timestamp: DateTime,   -- Дата и время действия
  action: string,        -- Тип действия (create, update, delete, etc.)
  field: string,         -- Измененное поле
  oldValue: string,      -- Старое значение
  newValue: string,      -- Новое значение
  details: string        -- Описание действия
}
```

### Почему хранится userName?

**Это нормальная практика для audit логов:**

✅ **Преимущества:**
- Быстрый просмотр логов без JOIN с таблицей users
- История сохраняется даже если пользователь удален
- Производительность при чтении логов
- Удобство для отладки и расследования инцидентов

⚠️ **Недостатки:**
- Дублирование данных
- Если пользователь изменит имя, в логах останется старое имя

**Решение:** Оставить как есть - это стандартная практика для audit trails.

### Отображение в интерфейсе

В интерфейсе аудита:
- **Основной источник имени:** `userId` → связь с таблицей `users`
- **Резервный источник:** `userName` из audit_log (если пользователь удален)

Код в `AuditPage.tsx`:
```typescript
const getUserName = (userId: string): string => {
  const user = users.find(u => u.id === userId);
  return user?.fullName || userId; // Если пользователь не найден, показываем ID
};
```

---

## Полная пересборка после очистки

Если нужно полностью пересобрать систему:

```bash
# Остановить все контейнеры
docker compose down

# Очистить базу данных
./cleanup-db.sh

# Пересобрать backend
docker compose build --no-cache backend

# Пересобрать frontend
docker compose build --no-cache frontend

# Запустить все
docker compose up -d

# Проверить логи
docker compose logs -f
```

---

## Автоматическая очистка (cron)

Для автоматической очистки базы данных (например, для тестовой среды):

```bash
# Добавить в crontab
crontab -e

# Очистка каждый день в 3:00
0 3 * * * /path/to/store-reconstruction/cleanup-db.sh && docker compose restart backend
```

⚠️ **ВНИМАНИЕ:** Не используйте это в production среде!

---

## Решение проблем

### Ошибка: "database is being accessed by other users"

```bash
# Остановить все подключения
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Повторить очистку
./cleanup-db.sh
```

### Ошибка: "permission denied"

```bash
# Проверить права пользователя
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT current_user;"

# Дать права если нужно
psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
```

### Backend не запускается после очистки

```bash
# Проверить логи
docker compose logs backend

# Перезапустить backend
docker compose restart backend

# Если не помогает - пересобрать
docker compose build --no-cache backend
docker compose up -d backend
```

---

## Документация

- **cleanup-db.sql** - SQL скрипт очистки
- **cleanup-db.sh** - Bash скрипт для удобного запуска
- **FIXES_V2.0.8.md** - Описание всех исправлений
- **README.md** - Основная документация

---

**Обновлено:** 2026-10-10  
**Версия:** 2.0.8
