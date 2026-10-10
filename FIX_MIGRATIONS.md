# Решение проблемы с миграциями Prisma

## Проблема
Миграция `20241010_add_user_fields_and_ldap` помечена как failed в таблице `_prisma_migrations`, что блокирует применение остальных миграций.

## Решение

### Шаг 1: Остановите backend
```bash
docker compose stop backend
```

### Шаг 2: Очистите таблицу миграций
```bash
# Подключитесь к PostgreSQL
psql -h 10.2.0.252 -p 5432 -U postgres -d mydatabase

# Выполните очистку
DELETE FROM _prisma_migrations;

# Выйдите
\q
```

Или одной командой:
```bash
psql -h 10.2.0.252 -p 5432 -U postgres -d mydatabase -c "DELETE FROM _prisma_migrations;"
```

### Шаг 3: Пересоберите и запустите backend
```bash
docker compose build backend
docker compose up -d backend
```

### Шаг 4: Проверьте логи
```bash
docker compose logs -f backend
```

Вы должны увидеть:
- Применение всех миграций (включая новую `20241012_add_profile_and_ldap`)
- Выполнение seed команды
- Создание ролей, пользователей и ТУ
- Запуск приложения на порту 4000

## Что было исправлено

1. Удалены конфликтующие миграции:
   - `20241010_add_user_fields_and_ldap`
   - `20241010_add_user_profile_fields`
   - `20241011_add_username_field`
   - `20261011000000_ldap_sync_profile_fields`
   - `20261012000000_restore_username_in_users`

2. Создана одна новая миграция `20241012_add_profile_and_ldap`, которая:
   - Добавляет поле `userName` в таблицу `users`
   - Добавляет поле `chatId` в таблицу `users`
   - Добавляет поле `telegramId` в таблицу `users`
   - Добавляет поле `theme` в таблицу `users`
   - Создает таблицу `ldap_settings`

3. Использованы `IF NOT EXISTS` и `IF EXISTS` для безопасного применения миграций

## Проверка

После успешного запуска проверьте:
- Frontend: http://localhost:5001
- Backend API: http://localhost:4000/api/health
- Swagger: http://localhost:4000/api/docs

Войдите с учетными данными:
- Логин: `admin`
- Пароль: `admin123`
