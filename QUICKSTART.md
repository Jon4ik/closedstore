# ⚡ Быстрый старт (3 минуты)

## Установка и запуск

```bash
# 1. Установка зависимостей
chmod +x install.sh
./install.sh

# 2. Настройка .env
cp .env.example .env
nano .env
# Укажите: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET

# 3. Создание базы данных
psql -h localhost -p 5432 -U your_user -c "CREATE DATABASE your_database;"

# 4. Инициализация базы данных
chmod +x init-db.sh
./init-db.sh --sql

# 5. Запуск проекта
chmod +x start.sh
./start.sh
```

## Если возникла ошибка P3005

```bash
# Создайте baseline миграцию
chmod +x baseline-migration.sh
./baseline-migration.sh

# Запустите проект
./start.sh
```

## Если возникла ошибка с Prisma migrate

```bash
# Обновите Prisma
chmod +x fix-prisma.sh
./fix-prisma.sh

# Запустите инициализацию заново
./init-db.sh --sql
```

## Доступ к приложению

- **Frontend**: http://localhost:5001
- **Backend API**: http://localhost:4000/api
- **Swagger**: http://localhost:4000/api/docs

## Учётные данные

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

## Полезные команды

```bash
# Проверка статуса
./status.sh

# Остановка
./stop.sh

# Перезапуск
./stop.sh && ./start.sh

# Просмотр логов
tail -f logs/backend.log
tail -f logs/frontend.log
```

## Документация

- 📖 [START_HERE.md](START_HERE.md) - Подробная инструкция для WSL
- 📖 [README_NO_DOCKER.md](README_NO_DOCKER.md) - Полная документация
- 📖 [FIX_P3005.md](FIX_P3005.md) - Решение ошибки P3005
- 📖 [TROUBLESHOOTING_PRISMA.md](TROUBLESHOOTING_PRISMA.md) - Проблемы с Prisma
- 📖 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Структура проекта

---

**Время установки:** ~3 минуты  
**Версия:** 1.1.0
