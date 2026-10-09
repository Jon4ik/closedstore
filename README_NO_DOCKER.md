# 🚀 Запуск проекта без Docker

Полная инструкция по запуску системы "Реконструкция — Закрытие" без использования Docker.

## 📋 Требования

### Системные требования
- **ОС**: Linux (Ubuntu 20.04+, Debian 11+), Windows (WSL2), macOS
- **Node.js**: версия 20 или выше
- **npm**: версия 8 или выше
- **PostgreSQL**: версия 13 или выше
- **RAM**: минимум 2 GB
- **Диск**: минимум 5 GB свободного места

### Проверка требований

```bash
# Проверка Node.js
node -v  # Должно быть v20.x.x или выше

# Проверка npm
npm -v   # Должно быть 8.x.x или выше

# Проверка PostgreSQL
psql --version  # Должно быть 13.x или выше
```

## 🔧 Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction
```

### 2. Установка зависимостей

```bash
# Сделайте скрипт исполняемым
chmod +x install.sh

# Запустите установку
./install.sh
```

Скрипт автоматически:
- Проверит наличие Node.js и npm
- Установит зависимости frontend
- Установит зависимости backend
- Сгенерирует Prisma client

### 3. Настройка .env

Отредактируйте файл `.env`:

```bash
nano .env
```

Укажите настройки PostgreSQL:

```env
# PostgreSQL настройки
DB_HOST=localhost
DB_PORT=5432
DB_NAME=closestore
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT секрет (минимум 32 символа)
JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# Домен (для CORS)
DOMAIN=localhost

# Порт backend
PORT=4000
```

## 🗄 Инициализация базы данных

### 1. Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql -h localhost -p 5432 -U your_postgres_user

# Создайте базу данных
CREATE DATABASE closestore;

# Выйдите
\q
```

### 2. Инициализация схемы и данных

```bash
# Сделайте скрипт исполняемым
chmod +x init-db.sh

# Запустите инициализацию
./init-db.sh --sql
```

Скрипт создаст:
- Все необходимые таблицы
- Начальные роли (Администратор, Менеджер, Наблюдатель)
- Начальных пользователей (admin, manager, viewer)
- 12 территориальных управляющих

## 🚀 Запуск проекта

### Запуск

```bash
# Сделайте скрипт исполняемым
chmod +x start.sh

# Запустите проект
./start.sh
```

Скрипт автоматически:
- Проверит подключение к PostgreSQL
- Применит миграции Prisma
- Запустит backend на порту 4000
- Запустит frontend на порту 5001

### Доступ к приложению

После запуска откройте браузер:

- **Frontend**: http://localhost:5001
- **Backend API**: http://localhost:4000/api
- **Swagger Docs**: http://localhost:4000/api/docs

### Учётные данные для входа

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

⚠️ **Важно**: Сразу после первого входа измените пароль администратора!

## 🛑 Остановка проекта

### Автоматическая остановка

Нажмите `Ctrl+C` в терминале, где запущен `start.sh`

### Ручная остановка

```bash
# Сделайте скрипт исполняемым
chmod +x stop.sh

# Запустите остановку
./stop.sh
```

## 📋 Управление процессами

### Просмотр логов

```bash
# Логи backend
tail -f logs/backend.log

# Логи frontend
tail -f logs/frontend.log
```

### Проверка запущенных процессов

```bash
# Проверка backend
lsof -i:4000

# Проверка frontend
lsof -i:5001
```

### Ручная остановка процессов

```bash
# Остановка backend
kill $(lsof -ti:4000)

# Остановка frontend
kill $(lsof -ti:5001)
```

## 🔄 Обновление проекта

### Получение обновлений

```bash
git pull origin main
```

### Обновление зависимостей

```bash
./install.sh
```

### Применение миграций

```bash
cd backend
npx prisma migrate deploy
cd ..
```

### Перезапуск

```bash
./stop.sh
./start.sh
```

## 🗄 Работа с базой данных

### Резервное копирование

```bash
# Создание бэкапа
pg_dump -h localhost -p 5432 -U your_user closestore > backup_$(date +%Y%m%d).sql

# Сжатие бэкапа
gzip backup_*.sql
```

### Восстановление из бэкапа

```bash
# Распаковка (если сжат)
gunzip backup_20240115.sql.gz

# Восстановление
psql -h localhost -p 5432 -U your_user closestore < backup_20240115.sql
```

### Автоматический бэкап (cron)

```bash
# Откройте crontab
crontab -e

# Добавьте строку для ежедневного бэкапа в 2:00
0 2 * * * pg_dump -h localhost -p 5432 -U your_user closestore > /path/to/backups/db_$(date +\%Y\%m\%d).sql
```

## 🔧 Разработка

### Запуск в режиме разработки

#### Frontend (с hot reload)

```bash
npm run dev
```

Frontend будет доступен на http://localhost:5173

#### Backend (с hot reload)

```bash
cd backend
npm run start:dev
```

Backend будет доступен на http://localhost:4000

### Сборка для production

```bash
# Сборка frontend
npm run build

# Сборка backend
cd backend
npm run build
```

## 🐛 Решение проблем

### Ошибка: "Cannot find module '@prisma/client'"

```bash
cd backend
npx prisma generate
cd ..
```

### Ошибка: "No command registered for `migrate`"

Это означает, что у вас старая версия Prisma CLI. Обновите:

```bash
cd backend
npm install @prisma/client@latest prisma@latest
npx prisma generate
cd ..
```

Или используйте скрипт автоматического определения команды:

```bash
cd backend
chmod +x apply-migrations.sh
./apply-migrations.sh
cd ..
```

Подробнее: [TROUBLESHOOTING_PRISMA.md](TROUBLESHOOTING_PRISMA.md)

### Ошибка: "EADDRINUSE: port already in use"

```bash
# Найдите процесс, использующий порт
lsof -i:4000  # или 5001

# Остановите процесс
kill <PID>
```

### Ошибка: "Connection refused" к PostgreSQL

1. Проверьте, запущен ли PostgreSQL:
   ```bash
   sudo systemctl status postgresql
   ```

2. Проверьте настройки в `.env`:
   ```bash
   cat .env | grep DB_
   ```

3. Проверьте доступность порта:
   ```bash
   nc -zv localhost 5432
   ```

### Ошибка: "Migration failed"

```bash
# Сбросьте миграции
cd backend
npx prisma migrate reset
cd ..

# Примените миграции заново
./init-db.sh --sql
```

### Frontend не открывается

1. Проверьте, запущен ли frontend:
   ```bash
   lsof -i:5001
   ```

2. Проверьте логи:
   ```bash
   cat logs/frontend.log
   ```

3. Пересоберите frontend:
   ```bash
   npm run build
   ```

### Backend не запускается

1. Проверьте логи:
   ```bash
   cat logs/backend.log
   ```

2. Проверьте подключение к PostgreSQL:
   ```bash
   psql -h localhost -p 5432 -U your_user -d closestore
   ```

3. Проверьте переменные окружения:
   ```bash
   cat .env | grep -E "DB_|JWT_"
   ```

## 📊 Мониторинг

### Использование ресурсов

```bash
# Использование памяти и CPU
top -p $(pgrep -d',' -f "node.*backend")

# Использование дискового пространства
du -sh node_modules/
du -sh backend/node_modules/
```

### Проверка здоровья

```bash
# Проверка backend
curl http://localhost:4000/api/health

# Проверка frontend
curl http://localhost:5001
```

## 🔐 Безопасность

### Рекомендации для production

1. **Измените все пароли по умолчанию**
   - PostgreSQL пароль
   - JWT секрет
   - Пароль администратора

2. **Используйте HTTPS**
   - Настройте reverse proxy (nginx)
   - Получите SSL сертификат (Let's Encrypt)

3. **Ограничьте доступ**
   - Настройте firewall (ufw)
   - Используйте VPN для административного доступа

4. **Регулярные бэкапы**
   - Настройте автоматический бэкап PostgreSQL
   - Храните бэкапы в другом месте

5. **Обновления**
   - Регулярно обновляйте Node.js
   - Обновляйте зависимости: `npm audit fix`

## 📚 Дополнительные команды

### Prisma команды

```bash
cd backend

# Просмотр статуса миграций
npx prisma migrate status

# Создание новой миграции
npx prisma migrate dev --name description

# Применение миграций
npx prisma migrate deploy

# Сброс базы данных
npx prisma migrate reset

# Открытие Prisma Studio
npx prisma studio
```

### NPM команды

```bash
# Проверка уязвимостей
npm audit

# Исправление уязвимостей
npm audit fix

# Обновление зависимостей
npm update

# Просмотр устаревших пакетов
npm outdated
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `cat logs/backend.log` и `cat logs/frontend.log`
2. Проверьте подключение к PostgreSQL
3. Проверьте настройки в `.env`
4. Проверьте, что все порты свободны
5. Обратитесь к разделу "Решение проблем" выше

Для дополнительной помощи создайте issue в репозитории проекта.

---

**Версия системы:** 1.1.0  
**Режим работы:** Без Docker  
**Дата обновления:** 2024
