# 🚀 Быстрый старт для WSL Ubuntu

## Установка за 5 минут

### 1. Установка Node.js 20

```bash
# Обновление пакетов
sudo apt update

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 2. Установка PostgreSQL

```bash
# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запуск
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создание пользователя и базы
sudo -u postgres psql
```

В PostgreSQL prompt:
```sql
CREATE USER myuser WITH PASSWORD 'mypassword';
CREATE DATABASE closestore OWNER myuser;
GRANT ALL PRIVILEGES ON DATABASE closestore TO myuser;
\q
```

### 3. Клонирование и установка

```bash
# Клонирование
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction

# Быстрая установка
chmod +x quickstart.sh
./quickstart.sh
```

Скрипт автоматически:
- Установит зависимости
- Создаст .env файл
- Инициализирует базу данных
- Запустит проект

### 4. Доступ к приложению

Откройте в Windows браузере:
- **Frontend**: http://localhost:5001
- **Backend API**: http://localhost:4000/api
- **Swagger**: http://localhost:4000/api/docs

### 5. Вход в систему

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

⚠️ **Сразу измените пароль администратора!**

## Полезные команды

### Проверка статуса
```bash
chmod +x status.sh
./status.sh
```

### Остановка
```bash
chmod +x stop.sh
./stop.sh
```

### Перезапуск
```bash
./stop.sh
./start.sh
```

### Просмотр логов
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

## Решение проблем

### Ошибка Docker: "Cannot find module '/app/dist/main'"

Если backend не может найти скомпилированный код в Docker:

```bash
# Пересобрать backend
chmod +x rebuild-backend.sh
./rebuild-backend.sh

# Проверить логи
docker compose logs -f backend
```

Или полная очистка:

```bash
docker compose down --rmi all
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

Подробнее: [QUICK_FIX_BACKEND.md](QUICK_FIX_BACKEND.md)

### Ошибка Prisma P3005: "The database schema is not empty"

Если база данных уже содержит таблицы, но Prisma не может применить миграции:

```bash
# Быстрое решение
chmod +x baseline-migration.sh
./baseline-migration.sh

# Затем запустите проект
./start.sh
```

Или очистите базу и начните заново:

```bash
chmod +x reset-database.sh
./reset-database.sh
./init-db.sh --sql
./start.sh
```

Подробнее: [FIX_P3005.md](FIX_P3005.md)

### Ошибка Prisma: "No command registered for `migrate`"

Это означает, что у вас старая версия Prisma. Обновите:

```bash
chmod +x fix-prisma.sh
./fix-prisma.sh

# Запустите инициализацию заново
./init-db.sh --sql
```

Подробнее: [TROUBLESHOOTING_PRISMA.md](TROUBLESHOOTING_PRISMA.md)

### Frontend не открывается в Windows

WSL2 использует виртуальную сеть. Попробуйте:

1. Используйте `localhost` (должно работать автоматически)
2. Или найдите IP WSL:
   ```bash
   ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
   ```
3. Откройте: `http://<WSL_IP>:5001`

### Порт занят

```bash
# Найти процесс
lsof -i:5001  # или 4000

# Остановить
kill <PID>

# Или использовать скрипт
./stop.sh
```

### PostgreSQL не запускается

```bash
# Проверка статуса
sudo systemctl status postgresql

# Запуск
sudo systemctl start postgresql

# Перезапуск
sudo systemctl restart postgresql
```

## Документация

- 📖 [WSL_QUICKSTART.md](WSL_QUICKSTART.md) - Подробная инструкция для WSL
- 📖 [README_NO_DOCKER.md](README_NO_DOCKER.md) - Запуск без Docker (полная документация)
- 📖 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Структура проекта
- 📖 [README.md](README.md) - Основная документация

## Скрипты

- `quickstart.sh` - Быстрый старт (установка + запуск)
- `install.sh` - Установка зависимостей
- `start.sh` - Запуск проекта
- `stop.sh` - Остановка проекта
- `status.sh` - Проверка статуса
- `init-db.sh` - Инициализация базы данных
- `rebuild-backend.sh` - Пересборка backend контейнера
- `baseline-migration.sh` - Создание baseline миграции
- `reset-database.sh` - Очистка базы данных
- `fix-prisma.sh` - Исправление проблем с Prisma

---

**Версия:** 1.1.0  
**Режим:** WSL Ubuntu без Docker  
**Время установки:** ~5 минут
