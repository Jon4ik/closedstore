# 🔧 Решение проблем с базой данных

## Проблема 1: Таблицы не создаются

### Причина
При запуске контейнера backend не выполняются миграции Prisma.

### Решение

#### Шаг 1: Проверьте, что база данных создана

```bash
# Подключитесь к PostgreSQL
psql -h your-postgres-host -U your-user

# Создайте базу данных (если еще не создана)
CREATE DATABASE store_reconstruction;

# Выйдите
\q
```

#### Шаг 2: Проверьте .env файл

Убедитесь, что в `.env` указаны правильные настройки:

```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=your-user
DB_PASSWORD=your-password

JWT_SECRET=your_jwt_secret_at_least_32_characters
DOMAIN=localhost
```

#### Шаг 3: Пересоберите и перезапустите backend

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

В логах вы должны увидеть:
```
Applying migration '20240101000000_init'
🌱 Seeding database...
✅ Roles created
✅ Users created
🚀 Backend running on http://localhost:4000
```

#### Шаг 4: Ручная инициализация (если автоматическая не работает)

```bash
# Сделайте скрипт исполняемым
chmod +x init-database.sh

# Запустите инициализацию
./init-database.sh
```

Или вручную:

```bash
# Примените миграции
docker compose exec backend npx prisma migrate deploy

# Запустите seed
docker compose exec backend npx prisma db seed
```

#### Шаг 5: Проверьте создание таблиц

```bash
# Подключитесь к БД
psql -h your-postgres-host -U your-user -d store_reconstruction

# Посмотрите список таблиц
\dt

# Должны увидеть:
# _prisma_migrations
# roles
# users
# tus
# projects
# comments
# audit_logs

# Проверьте роли
SELECT * FROM roles;

# Должны увидеть 3 роли:
# - Администратор
# - Менеджер
# - Наблюдатель

# Проверьте пользователей
SELECT id, username, "fullName", "roleId" FROM users;

# Должны увидеть 3 пользователя:
# - admin
# - manager
# - viewer

# Выйдите
\q
```

---

## Проблема 2: Ошибка "Неверное имя пользователя или пароль"

### Причина
Seed данные не создались или пароли не захешированы правильно.

### Решение

#### Шаг 1: Проверьте, что пользователи существуют

```bash
# Подключитесь к БД
psql -h your-postgres-host -U your-user -d store_reconstruction

# Проверьте пользователей
SELECT username, "fullName", "roleId", "isActive" FROM users;

# Должны увидеть:
# admin    | Администратор Системы | role-admin | true
# manager  | Иванов И.И.           | role-manager | true
# viewer   | Петров П.П.           | role-viewer | true
```

Если пользователей нет, запустите seed:

```bash
docker compose exec backend npx prisma db seed
```

#### Шаг 2: Проверьте пароли

Пароли должны быть захешированы с помощью bcrypt. Проверьте:

```sql
SELECT username, LEFT(password, 10) as password_prefix FROM users;
```

Должны увидеть что пароли начинаются с `$2b$10$` (это bcrypt хеш).

Если пароли не захешированы, пересоздайте пользователей:

```bash
# Удалите пользователей
psql -h your-postgres-host -U your-user -d store_reconstruction -c "DELETE FROM users;"

# Запустите seed заново
docker compose exec backend npx prisma db seed
```

#### Шаг 3: Проверьте логи backend

```bash
docker compose logs backend
```

Ищите ошибки при входе:
```
[Nest] ERROR [AuthModule] Invalid credentials
```

Если видите такую ошибку, проверьте:
1. Правильность логина/пароля
2. Что пользователь активен (`isActive = true`)
3. Что роль существует

#### Шаг 4: Сбросьте пароль вручную

Если ничего не помогает, создайте нового пользователя с известным паролем:

```bash
# Войдите в backend контейнер
docker compose exec backend sh

# Запустите Node.js
node

# В Node.js выполните:
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPassword() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password },
    create: {
      username: 'admin',
      password,
      fullName: 'Администратор',
      roleId: 'role-admin',
    },
  });
  console.log('Password reset successfully');
  await prisma.$disconnect();
}

resetPassword();

# Выйдите из Node.js
.exit

# Выйдите из контейнера
exit
```

Теперь попробуйте войти с логином `admin` и паролем `admin123`.

---

## Полная очистка и пересоздание

Если ничего не помогает, выполните полную очистку:

```bash
# 1. Остановите все контейнеры
docker compose down

# 2. Удалите все данные из PostgreSQL
psql -h your-postgres-host -U your-user -c "DROP DATABASE store_reconstruction;"
psql -h your-postgres-host -U your-user -c "CREATE DATABASE store_reconstruction;"

# 3. Удалите Docker образы
docker compose down --rmi all

# 4. Пересоберите
docker compose build --no-cache

# 5. Запустите заново
docker compose up -d

# 6. Проверьте логи
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

---

## Проверочный чеклист

После выполнения всех шагов проверьте:

- [ ] База данных `store_reconstruction` создана
- [ ] В `.env` указаны правильные настройки подключения
- [ ] Backend контейнер запущен: `docker compose ps`
- [ ] В логах backend видно "Applying migration"
- [ ] В логах backend видно "Seeding database"
- [ ] Таблицы созданы: `\dt` в psql показывает 7 таблиц
- [ ] Роли созданы: `SELECT * FROM roles;` показывает 3 роли
- [ ] Пользователи созданы: `SELECT * FROM users;` показывает 3 пользователя
- [ ] Пароли захешированы: начинаются с `$2b$10$`
- [ ] Можно войти с логином `admin` и паролем `admin123`

---

## Полезные команды

```bash
# Просмотр логов backend
docker compose logs -f backend

# Применение миграций вручную
docker compose exec backend npx prisma migrate deploy

# Запуск seed вручную
docker compose exec backend npx prisma db seed

# Проверка статуса миграций
docker compose exec backend npx prisma migrate status

# Сброс базы данных (УДАЛИТ ВСЕ ДАННЫЕ!)
docker compose exec backend npx prisma migrate reset

# Открытие Prisma Studio (GUI для БД)
docker compose exec backend npx prisma studio

# Подключение к БД
psql -h your-postgres-host -U your-user -d store_reconstruction

# Список таблиц
\dt

# Описание таблицы
\d+ users

# Выход из psql
\q
```

---

## Если проблема не решена

Пришлите вывод следующих команд:

```bash
# Логи backend
docker compose logs backend

# Статус контейнеров
docker compose ps

# Содержимое .env (без паролей!)
cat .env | grep -v PASSWORD

# Список таблиц в БД
psql -h your-postgres-host -U your-user -d store_reconstruction -c "\dt"

# Список пользователей
psql -h your-postgres-host -U your-user -d store_reconstruction -c "SELECT username, \"fullName\" FROM users;"
```

---

**Обновлено:** 2024-10-10  
**Версия:** 2.0.0
