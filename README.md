# Реконструкция — Закрытие

Система управления графиками реконструкций и закрытий магазинов.

## 📋 Архитектура

Система состоит из:
- **Frontend**: React + TypeScript + Tailwind CSS (порт 5001)
- **Backend**: NestJS + Prisma (порт 4000)
- **PostgreSQL**: внешняя база данных (настраивается отдельно)

## 🚀 Быстрый старт

### Вариант 1: Без Docker (рекомендуется для WSL)

```bash
# Установка зависимостей
chmod +x install.sh
./install.sh

# Настройка .env
nano .env

# Инициализация базы данных
chmod +x init-db.sh
./init-db.sh --sql

# Запуск проекта
chmod +x start.sh
./start.sh
```

Подробнее: [README_NO_DOCKER.md](README_NO_DOCKER.md)

### Вариант 2: С Docker

```bash
# Настройка .env
cp .env.example .env
nano .env

# Инициализация базы данных
chmod +x init-db.sh
./init-db.sh

# Запуск
docker compose up -d
```

Подробнее: [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)

---

## 🚀 Быстрый старт (Production)

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (внешняя база данных)
- 2 GB RAM, 2 CPU cores

### 1. Клонирование и настройка

```bash
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction
cp .env.example .env
```

### 2. Настройка .env

Отредактируйте `.env` — укажите настройки PostgreSQL и секрет JWT:

```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here_change_this
DOMAIN=reconstruction.yourcompany.ru
```

### 3. Инициализация базы данных

```bash
# Создайте базу данных
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Сделайте скрипт исполняемым (только первый раз)
chmod +x init-db.sh

# Запустите инициализацию (рекомендуется Docker метод)
./init-db.sh

# Или используйте SQL метод (без Docker)
./init-db.sh --sql
```

**Методы инициализации:**
- `./init-db.sh` или `./init-db.sh --docker` — через Docker и Prisma (рекомендуется)
- `./init-db.sh --sql` — через SQL скрипт (быстрый способ для тестирования)

**Если возникла ошибка P3005 (The database schema is not empty):**

```bash
# Создайте baseline миграцию
chmod +x baseline-migration.sh
./baseline-migration.sh

# Запустите проект
./start.sh
```

Подробнее см. [FIX_P3005.md](FIX_P3005.md) и [INIT_DB_README.md](INIT_DB_README.md)

### 4. Запуск

```bash
docker compose up -d
```

Система будет доступна:
- **Frontend**: http://your-server-ip:5001
- **API**: http://your-server-ip:4000/api

### 5. Первый вход

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

**⚠️ Сразу после первого входа смените пароли!**

## 🗄 Внешняя база данных

Система использует внешнюю PostgreSQL базу данных. Убедитесь, что:
- PostgreSQL запущен и доступен
- База данных создана
- Пользователь имеет необходимые права
- Порт 5432 доступен с сервера приложения

### Инициализация базы данных

Используйте скрипт `init-db.sh` для автоматической инициализации:

```bash
# Docker метод (рекомендуется)
./init-db.sh --docker

# SQL метод (без Docker)
./init-db.sh --sql
```

**Что делает скрипт:**
- Загружает переменные из `.env` файла
- Проверяет подключение к PostgreSQL
- Применяет миграции Prisma
- Запускает seed данные (роли, пользователи, ТУ)

Или выполните вручную:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Подробнее см. [INIT_DB_README.md](INIT_DB_README.md)

---

## 📋 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Reverse Proxy)                │
│                     Port 5001                            │
├────────────────────────┬────────────────────────────────┤
│   Frontend (React)     │   Backend (NestJS)             │
│   Port 5001            │   Port 4000                    │
│   /                    │   /api/*                       │
└────────────────────────┴────────────────────────────────┘
                      ↕
         ┌────────────────────────┐
         │  PostgreSQL (external) │
         │  Port 5432             │
         └────────────────────────┘
```

## 🗂 Структура проекта

```
store-reconstruction/
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      # UI компоненты
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript типы
│   │   ├── utils/           # Утилиты (статусы, экспорт)
│   │   ├── config/          # Конфигурация БД
│   │   └── data/            # Seed данные
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # JWT авторизация
│   │   │   ├── stores/      # Объекты
│   │   │   ├── tus/         # ТУ
│   │   │   ├── users/       # Пользователи
│   │   │   ├── roles/       # Роли
│   │   │   ├── audit/       # Аудит
│   │   │   └── import/      # Excel импорт
│   │   ├── prisma/          # ORM
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── nginx/                    # Nginx конфигурация
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── init-db.sh               # Скрипт инициализации БД
└── README.md
```

## 🔧 Развёртывание на сервере

### Ubuntu 22.04 / Debian 12

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Клонирование проекта
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction

# Настройка
cp .env.example .env
nano .env  # Укажите настройки PostgreSQL и домен

# Инициализация базы данных
chmod +x init-db.sh
./init-db.sh

# Запуск
docker compose up -d

# Проверка
docker compose ps
docker compose logs -f
```

### Настройка домена и SSL

```bash
# Установите certbot
sudo apt install certbot -y

# Получите сертификат
sudo certbot certonly --standalone -d reconstruction.yourcompany.ru

# Обновите nginx.conf для SSL
# Перезапустите frontend
docker compose restart frontend
```

### Резервное копирование

```bash
# Создать бэкап БД
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup.sql
```

### Мониторинг

```bash
# Логи
docker compose logs -f frontend
docker compose logs -f backend

# Статус сервисов
docker compose ps

# Использование ресурсов
docker stats
```

---

## 🔐 Безопасность

1. **Обязательно измените** пароли в `.env` перед первым запуском
2. **Смените пароль admin** сразу после первого входа
3. Используйте **SSL** (Let's Encrypt) для production
4. Настройте **firewall** (ufw):
   ```bash
   sudo ufw allow 5001  # Frontend
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
5. **Защитите PostgreSQL**:
   - Используйте SSL для подключения к БД
   - Ограничьте доступ по IP
   - Регулярно меняйте пароли
6. Регулярно **обновляйте** систему и контейнеры:
   ```bash
   docker compose pull
   docker compose up -d
   ```

---

## 📊 Функционал

### Для всех пользователей
- Dashboard со статистикой и уведомлениями
- Таблица объектов с фильтрацией и поиском
- Календарь событий (месяц/неделя/список)
- Карточки объектов с таймлайном этапов
- Экспорт в XLSX/CSV

### Для менеджеров
- Создание и редактирование объектов
- Импорт из Excel
- Добавление комментариев

### Для администраторов
- Управление пользователями
- Гибкая настройка ролей и прав
- Управление справочником ТУ
- Настройка подключения к PostgreSQL
- Просмотр аудита всех действий

---

## 🗄 База данных

Система использует внешнюю PostgreSQL базу данных. Убедитесь, что:
- PostgreSQL 13+ установлен и запущен
- База данных создана
- Пользователь имеет необходимые права

### Схема (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hash
  fullName  String
  roleId    String
  role      Role     @relation(...)
  isActive  Boolean  @default(true)
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  permissions String[] // ['view', 'create', 'edit', ...]
  isSystem    Boolean  @default(false)
}

model TU {
  id        String   @id @default(uuid())
  fullName  String
  position  String
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
}

model StoreProject {
  id              String    @id @default(uuid())
  storeNumber     String
  address         String
  city            String
  workType        String    // 'Закрытие' | 'Реконструкция' | 'Открытие'
  closureDate     DateTime?
  demolitionDate  DateTime?
  installationDate DateTime?
  techOpenDate    DateTime?
  tuId            String
  rowColor        String    @default("")
  comment         String    @default("")
  status          String
  manualStatus    String?
  isDeleted       Boolean   @default(false)
}

model Comment {
  id        String   @id @default(uuid())
  storeId   String
  userId    String
  userName  String
  text      String
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  storeId   String?
  userId    String
  userName  String
  timestamp DateTime @default(now())
  action    String
  field     String
  oldValue  String
  newValue  String
  details   String
}
```

### Миграции

```bash
# Применить миграции
cd backend
npx prisma migrate deploy

# Создать новую миграцию
cd backend
npx prisma migrate dev --name init

# Seed данные
cd backend
npx prisma db seed

# Или используйте скрипт инициализации
./init-db.sh
```

---

## 📡 API Endpoints

### Авторизация
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Объекты
```
GET    /api/stores
GET    /api/stores/:id
POST   /api/stores
PUT    /api/stores/:id
DELETE /api/stores/:id  (soft delete)
POST   /api/stores/:id/restore
```

### ТУ
```
GET    /api/tus
POST   /api/tus
PUT    /api/tus/:id
```

### Пользователи и роли
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
```

### Импорт/Экспорт
```
POST /api/import/excel
GET  /api/export/excel
GET  /api/export/csv
```

### Dashboard и аудит
```
GET /api/dashboard
GET /api/calendar
GET /api/audit
```

---

## 🛠 Разработка (локально)

```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev  # http://localhost:4000

# PostgreSQL (локально, если нужно)
# Установите PostgreSQL локально или используйте Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=store_reconstruction postgres:15
```

---

## 📝 Changelog

### v1.1.0
- Убрана встроенная PostgreSQL (используется внешняя БД)
- Добавлен скрипт инициализации базы данных
- Порт frontend изменён на 5001
- Улучшена документация

### v1.0.0
- Полный функционал управления объектами
- Система ролей и прав
- Аудит действий
- Импорт/экспорт Excel
- Календарь событий
- Множественные комментарии
- Настраиваемые роли и пользователи
- PostgreSQL интеграция
- Docker production-ready

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs`
2. Убедитесь что порты 5001, 4000 свободны
3. Проверьте конфигурацию `.env`
4. Проверьте доступность PostgreSQL
5. Перезапустите сервисы: `docker compose restart`
