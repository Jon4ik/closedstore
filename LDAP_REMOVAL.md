# Удаление LDAP функциональности

## Что было удалено

### Backend
1. **Модуль LDAP** - полностью удалён
   - `backend/src/modules/ldap/ldap.service.ts`
   - `backend/src/modules/ldap/ldap.controller.ts`
   - `backend/src/modules/ldap/ldap.module.ts`

2. **Модуль Settings** - полностью удалён
   - `backend/src/modules/settings/crypto.util.ts`
   - `backend/src/modules/settings/ldap.service.ts`
   - `backend/src/modules/settings/settings.controller.ts`
   - `backend/src/modules/settings/settings.module.ts`
   - `backend/src/modules/settings/settings.service.ts`

3. **Модель LdapSettings** - удалена из `backend/prisma/schema.prisma`

4. **Миграция LDAP** - удалена
   - `backend/prisma/migrations/20241012_add_profile_and_ldap/migration.sql`
   - Заменена на `backend/prisma/migrations/20241012_add_profile_fields/migration.sql` (только профиль)

5. **Зависимости** - удалены из `backend/package.json`
   - `ldapjs`
   - `@types/ldapjs`

6. **Импорт LdapModule** - удалён из `backend/src/app.module.ts`

### Frontend
1. **Страница настроек** - удалена
   - `src/pages/SettingsPage.tsx`

2. **API клиент** - удалены LDAP методы из `src/api/client.ts`
   - `getLdapSettings()`
   - `saveLdapSettings()`
   - `testLdapConnection()`
   - `syncLdapUsers()`

3. **Справочник ТУ** - удалена кнопка синхронизации с AD
   - Удалены функции `checkLdapSettings()` и `handleSyncFromAD()`
   - Удалены состояния `ldapEnabled` и `syncing`
   - Удалён импорт `RefreshCw` и `apiClient`

4. **Layout** - удалён пункт меню "Настройки"
   - Удалён импорт `Settings` из lucide-react
   - Удалён элемент из `adminNavItems`

5. **Роли** - удалена секция "Настройки"
   - Удалён модуль "Настройки" из `src/pages/RolesPage.tsx`

## Что осталось

### Профиль пользователя
Поля профиля остались и работают корректно:
- `userName` - имя пользователя
- `chatId` - ID чата в мессенджере Пачка
- `telegramId` - ID в Telegram
- `theme` - тема оформления (light/dark/system)

Миграция `20241012_add_profile_fields` добавляет только эти поля без LDAP.

## Инструкция по обновлению на сервере

### Шаг 1: Остановите backend
```bash
docker compose stop backend
```

### Шаг 2: Очистите таблицу миграций
```bash
psql -h 10.2.0.252 -p 5432 -U postgres -d mydatabase -c "DELETE FROM _prisma_migrations;"
```

### Шаг 3: Удалите таблицу ldap_settings (если существует)
```bash
psql -h 10.2.0.252 -p 5432 -U postgres -d mydatabase -c "DROP TABLE IF EXISTS ldap_settings;"
```

### Шаг 4: Пересоберите и запустите backend
```bash
docker compose build backend
docker compose up -d backend
```

### Шаг 5: Проверьте логи
```bash
docker compose logs -f backend
```

Вы должны увидеть успешное применение миграций и запуск приложения.

## Проверка

После обновления проверьте:
1. ✅ Backend запускается без ошибок LDAP
2. ✅ Страница "Настройки" отсутствует в меню
3. ✅ В справочнике ТУ нет кнопки "Синхронизировать с AD"
4. ✅ Профиль пользователя работает корректно
5. ✅ Все остальные функции работают как обычно

## Примечание

Если у вас уже есть данные в таблице `ldap_settings`, они будут удалены при выполнении шага 3. Если вам нужно сохранить эти данные, сделайте резервную копию перед удалением:

```bash
psql -h 10.2.0.252 -p 5432 -U postgres -d mydatabase -c "COPY ldap_settings TO '/tmp/ldap_settings_backup.csv' WITH CSV HEADER;"
```
