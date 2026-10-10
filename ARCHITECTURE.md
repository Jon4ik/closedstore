# Архитектура системы

## Обзор

Система "Реконструкция — Закрытие" использует **только PostgreSQL** для хранения всех данных. Локальное хранилище (IndexedDB/localStorage) используется только для:
- Хранения JWT токена авторизации
- Кэширования информации о текущем пользователе (для восстановления сессии)

## Структура данных

### PostgreSQL (основное хранилище)

Все бизнес-данные хранятся в PostgreSQL:

1. **projects** - объекты (магазины)
   - storeNumber, address, city, workType
   - closureDate, demolitionDate, installationDate, techOpenDate
   - tuId, rowColor, comment, status
   - createdAt, updatedAt, createdBy

2. **tus** - территориальные управляющие
   - fullName, position, phone, email
   - isActive

3. **users** - пользователи системы
   - username, password (bcrypt hash)
   - fullName, role, permissions
   - isActive

4. **roles** - роли и права доступа
   - name, description
   - permissions (массив)
   - isSystem

5. **comments** - комментарии к объектам
   - storeId, userId, userName
   - text, createdAt

6. **audit_logs** - журнал аудита
   - storeId, userId, userName
   - action, field, oldValue, newValue
   - details, timestamp

### LocalStorage (только для сессии)

- `token` - JWT токен авторизации
- `currentUser` - информация о текущем пользователе (для быстрого восстановления сессии)

## Поток данных

### Авторизация

```
1. Пользователь вводит логин/пароль
2. Frontend → POST /api/auth/login → Backend
3. Backend проверяет в PostgreSQL, возвращает JWT токен
4. Frontend сохраняет токен в localStorage
5. Все последующие запросы включают токен в заголовке Authorization
```

### Загрузка данных

```
1. После авторизации frontend загружает данные:
   - GET /api/stores → список объектов
   - GET /api/tus → список ТУ
   - GET /api/users → список пользователей
   - GET /api/roles → список ролей
2. Backend читает из PostgreSQL и возвращает JSON
3. Frontend сохраняет данные в Zustand store
4. Компоненты React используют данные из store
```

### Создание/обновление данных

```
1. Пользователь создает/редактирует объект
2. Frontend → POST/PUT /api/stores → Backend
3. Backend валидирует данные
4. Backend записывает в PostgreSQL
5. Backend записывает действие в audit_logs
6. Backend возвращает обновленный объект
7. Frontend обновляет store и UI
```

### Импорт из Excel

```
1. Пользователь выбирает Excel файл
2. Frontend → POST /api/import/excel (multipart/form-data) → Backend
3. Backend парсит Excel файл
4. Backend валидирует данные
5. Backend записывает в PostgreSQL
6. Backend записывает действие в audit_logs
7. Frontend перезагружает список объектов
```

### Экспорт в Excel

```
1. Пользователь нажимает "Экспорт"
2. Frontend берет данные из store (которые загружены из PostgreSQL)
3. Frontend генерирует Excel файл на клиенте (библиотека xlsx)
4. Браузер скачивает файл
```

## API Endpoints

### Auth
- `POST /api/auth/login` - вход
- `POST /api/auth/logout` - выход
- `GET /api/auth/me` - получить профиль

### Projects
- `GET /api/stores` - список объектов
- `GET /api/stores/:id` - получить объект
- `POST /api/stores` - создать объект
- `PUT /api/stores/:id` - обновить объект
- `DELETE /api/stores/:id` - удалить объект

### TUs
- `GET /api/tus` - список ТУ
- `POST /api/tus` - создать ТУ
- `PUT /api/tus/:id` - обновить ТУ

### Users
- `GET /api/users` - список пользователей
- `POST /api/users` - создать пользователя
- `PUT /api/users/:id` - обновить пользователя
- `DELETE /api/users/:id` - удалить пользователя

### Roles
- `GET /api/roles` - список ролей
- `POST /api/roles` - создать роль
- `PUT /api/roles/:id` - обновить роль
- `DELETE /api/roles/:id` - удалить роль

### Audit
- `GET /api/audit` - журнал аудита

### Import/Export
- `POST /api/import/excel` - импорт из Excel
- Экспорт происходит на клиенте

## Безопасность

### JWT токены

- Токен выдается при успешной авторизации
- Срок действия: 7 дней (настраивается в .env)
- Токен передается в заголовке `Authorization: Bearer <token>`
- Backend проверяет токен при каждом запросе

### Хеширование паролей

- Пароли хранятся в PostgreSQL в виде bcrypt хешей
- При регистрации/изменении пароля используется bcrypt с 10 раундами
- Оригинальные пароли никогда не хранятся

### Права доступа

- Каждая роль имеет массив permissions
- Backend проверяет права перед выполнением операций
- Frontend скрывает UI элементы если нет прав

## Производительность

### Кэширование на клиенте

- Zustand store кэширует данные в памяти
- Данные загружаются один раз при входе
- Обновления происходят через API запросы

### Пагинация

- API поддерживает пагинацию для больших списков
- Параметры: `page`, `limit`
- По умолчанию: 50 объектов на страницу

### Индексы в PostgreSQL

Созданы индексы для оптимизации запросов:
- `idx_projects_storeNumber` - поиск по номеру
- `idx_projects_city` - фильтрация по городу
- `idx_projects_status` - фильтрация по статусу
- `idx_projects_tuId` - поиск по ТУ
- `idx_audit_timestamp` - сортировка аудита по времени

## Резервное копирование

### Автоматическое копирование

Рекомендуется настроить автоматический бэкап PostgreSQL:

```bash
# Ежедневный бэкап в 2:00
0 2 * * * pg_dump -h localhost -U postgres store_reconstruction > /backups/db_$(date +\%Y\%m\%d).sql
```

### Ручное копирование

```bash
# Создать бэкап
pg_dump -h localhost -U postgres store_reconstruction > backup.sql

# Восстановить из бэкапа
psql -h localhost -U postgres store_reconstruction < backup.sql
```

## Мониторинг

### Логи

- Frontend: `docker compose logs frontend`
- Backend: `docker compose logs backend`
- PostgreSQL: `docker logs postgres`

### Аудит

Все действия пользователей записываются в таблицу `audit_logs`:
- Вход/выход из системы
- Создание/изменение/удаление объектов
- Импорт данных
- Изменение настроек

## Масштабирование

### Горизонтальное масштабирование

- Backend можно запустить в нескольких экземплярах
- Использовать load balancer (nginx)
- PostgreSQL можно реплицировать

### Вертикальное масштабирование

- Увеличить ресурсы сервера
- Оптимизировать запросы к БД
- Добавить индексы

## Безопасность production

### Обязательные настройки

1. Изменить все пароли по умолчанию
2. Использовать HTTPS (SSL сертификат)
3. Настроить firewall (открыть только 80, 443, 22)
4. Регулярно обновлять систему
5. Делать резервные копии

### Рекомендации

- Использовать strong passwords (минимум 16 символов)
- Включить 2FA для администраторов
- Ограничить доступ по IP
- Использовать VPN для административного доступа
- Мониторить логи на подозрительную активность
