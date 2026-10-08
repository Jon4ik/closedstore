# Реконструкция — Закрытие

Система управления графиками реконструкций и закрытий магазинов.

## 🚀 Быстрый старт (Production)

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- 2 GB RAM, 2 CPU cores

### 1. Клонирование и настройка

```bash
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction
cp .env.example .env
```

### 2. Настройка .env

Отредактируйте `.env` — укажите пароль PostgreSQL и секрет JWT:

```env
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here_change_this
DOMAIN=reconstruction.yourcompany.ru
```

### 3. Запуск

```bash
docker compose up -d
```

Система будет доступна:
- **Frontend**: http://your-server-ip (порт 80)
- **API**: http://your-server-ip/api
- **pgAdmin**: http://your-server-ip:5050 (опционально)

### 4. Первый вход

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

**⚠️ Сразу после первого входа смените пароли!**

---

## 📋 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Reverse Proxy)                │
│                     Port 80 / 443                        │
├────────────────────────┬────────────────────────────────┤
│   Frontend (React)     │   Backend (NestJS)             │
│   Port 3000            │   Port 4000                    │
│   /                    │   /api/*                       │
├────────────────────────┴────────────────────────────────┤
│              PostgreSQL 15                               │
│              Port 5432                                   │
└─────────────────────────────────────────────────────────┘
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
├── docker-compose.yml
├── .env.example
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
nano .env  # Укажите пароли и домен

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
# Перезапустите
docker compose restart nginx
```

### Резервное копирование

```bash
# Создать бэкап БД
docker compose exec postgres pg_dump -U postgres store_reconstruction > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
cat backup.sql | docker compose exec -T postgres psql -U postgres store_reconstruction
```

### Мониторинг

```bash
# Логи
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

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
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
5. Регулярно **обновляйте** систему и контейнеры:
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
  workType        String    // 'Закрытие' | 'Реконструкция'
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
docker compose exec backend npx prisma migrate deploy

# Создать новую миграцию
docker compose exec backend npx prisma migrate dev --name init

# Seed данные
docker compose exec backend npx prisma db seed
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

# PostgreSQL (локально)
docker compose up postgres
```

---

## 📝 Changelog

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
2. Убедитесь что порты 80, 5432 свободны
3. Проверьте конфигурацию `.env`
4. Перезапустите сервисы: `docker compose restart`
