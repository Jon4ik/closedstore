# 📋 Скрипт инициализации базы данных

## Обзор

Скрипт `init-db.sh` автоматизирует процесс инициализации базы данных PostgreSQL для системы "Реконструкция — Закрытие".

## Использование

### Базовое использование

```bash
# Сделать скрипт исполняемым (только первый раз)
chmod +x init-db.sh

# Запустить инициализацию (метод по умолчанию - Docker)
./init-db.sh
```

### Методы инициализации

Скрипт поддерживает два метода инициализации:

#### 1. Docker метод (по умолчанию)
```bash
./init-db.sh
# или явно
./init-db.sh --docker
```

**Требования:**
- Docker и Docker Compose установлены
- Backend контейнер запущен или может быть запущен
- Node.js и Prisma доступны в контейнере

**Что делает:**
- Применяет миграции Prisma
- Запускает seed данные с правильными bcrypt хешами паролей
- Создает начальные роли, пользователей и ТУ

#### 2. SQL метод
```bash
./init-db.sh --sql
```

**Требования:**
- PostgreSQL клиент (psql) установлен
- Прямой доступ к базе данных

**Что делает:**
- Выполняет SQL скрипт `init-db.sql`
- Создает таблицы и индексы
- Вставляет начальные данные

**⚠️ Важно:** Пароли пользователей в SQL методе являются заглушками. Для production используйте Docker метод.

### Параметры

```bash
./init-db.sh [опции]

Опции:
  --sql          Использовать SQL скрипт для инициализации
  --docker       Использовать Docker и Prisma (по умолчанию)
  --help, -h     Показать справку
```

### Примеры

```bash
# Инициализация через Docker (рекомендуется)
./init-db.sh --docker

# Инициализация через SQL (быстрый способ для тестирования)
./init-db.sh --sql

# Показать справку
./init-db.sh --help
```

## Подготовка

### 1. Настройка .env файла

Перед запуском скрипта убедитесь, что файл `.env` настроен корректно:

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте
nano .env
```

Обязательные переменные:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_at_least_32_characters
```

### 2. Создание базы данных

Создайте базу данных в PostgreSQL:

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
```

Или через pgAdmin/другой GUI клиент.

### 3. Проверка подключения

Убедитесь, что можете подключиться к базе данных:

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

## Что создается при инициализации

### Таблицы

1. **roles** - роли пользователей
2. **users** - пользователи системы
3. **tus** - территориальные управляющие
4. **store_projects** - объекты (магазины)
5. **comments** - комментарии к объектам
6. **audit_logs** - журнал аудита

### Начальные данные

#### Роли
- **Администратор** - полный доступ
- **Менеджер** - управление объектами
- **Наблюдатель** - только просмотр

#### Пользователи
- **admin** / admin123 - администратор
- **manager** / manager123 - менеджер
- **viewer** / viewer123 - наблюдатель

#### ТУ (Территориальные управляющие)
- 12 территориальных управляющих с контактными данными

## Решение проблем

### Ошибка: "Файл .env не найден"

```bash
# Создайте .env файл
cp .env.example .env
nano .env
```

### Ошибка: "Не удалось подключиться к базе данных"

1. Проверьте, запущен ли PostgreSQL:
   ```bash
   sudo systemctl status postgresql
   ```

2. Проверьте настройки в .env:
   ```bash
   cat .env | grep DB_
   ```

3. Проверьте доступность порта:
   ```bash
   nc -zv $DB_HOST $DB_PORT
   ```

4. Создайте базу данных:
   ```bash
   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
   ```

### Ошибка: "Docker не установлен" (при использовании Docker метода)

Используйте SQL метод:
```bash
./init-db.sh --sql
```

### Ошибка: "npx: команда не найдена" (при использовании Docker метода)

Это означает, что скрипт пытается запустить npx вне Docker контейнера. Убедитесь, что:
1. Backend контейнер запущен: `docker compose up -d backend`
2. Docker Compose работает корректно: `docker compose ps`

Или используйте SQL метод:
```bash
./init-db.sh --sql
```

### Ошибка: "Backend контейнер не запущен"

Запустите backend контейнер:
```bash
docker compose up -d backend
```

Подождите 10-15 секунд и повторите инициализацию.

## Ручная инициализация

Если скрипт не работает, можно инициализировать базу данных вручную:

### Метод 1: Через Docker

```bash
# Запустите backend контейнер
docker compose up -d backend

# Примените миграции
docker compose exec backend npx prisma migrate deploy

# Запустите seed
docker compose exec backend npx prisma db seed
```

### Метод 2: Через SQL

```bash
# Выполните SQL скрипт
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f init-db.sql
```

## Проверка инициализации

После инициализации проверьте, что данные созданы:

```bash
# Подключитесь к базе данных
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Проверьте таблицы
\dt

# Проверьте роли
SELECT * FROM roles;

# Проверьте пользователей
SELECT id, username, "fullName", "roleId" FROM users;

# Проверьте ТУ
SELECT id, "fullName", position FROM tus;

# Выйдите
\q
```

## Сброс базы данных

Если нужно начать заново:

```bash
# Удалите все таблицы (ОСТОРОЖНО!)
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Повторите инициализацию
./init-db.sh
```

## Дополнительные сведения

- [Полная документация по развёртыванию](DEPLOYMENT.md)
- [README проекта](README.md)
- [Инструкция по установке](INSTALL_RU.md)

---

**Версия:** 1.1.0  
**Дата обновления:** 2024
