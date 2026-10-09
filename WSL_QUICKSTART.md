# 🚀 Быстрый старт для WSL Ubuntu

Инструкция по запуску проекта на Windows Subsystem for Linux (WSL) без Docker.

## 📋 Требования

- Windows 10/11 с WSL2
- Ubuntu 20.04+ в WSL
- PostgreSQL 13+ (установленный в WSL или Windows)

## 🔧 Установка

### 1. Установка Node.js 20

```bash
# Обновление пакетов
sudo apt update

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node -v  # Должно быть v20.x.x
npm -v   # Должно быть 10.x.x
```

### 2. Установка PostgreSQL (если еще не установлен)

```bash
# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создание пользователя и базы данных
sudo -u postgres psql

# В PostgreSQL prompt:
CREATE USER your_user WITH PASSWORD 'your_password';
CREATE DATABASE closestore OWNER your_user;
GRANT ALL PRIVILEGES ON DATABASE closestore TO your_user;
\q
```

### 3. Клонирование и установка

```bash
# Клонирование репозитория
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction

# Установка зависимостей
chmod +x install.sh
./install.sh
```

### 4. Настройка .env

```bash
# Копирование примера
cp .env.example .env

# Редактирование
nano .env
```

Укажите настройки PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=closestore
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
DOMAIN=localhost
PORT=4000
```

### 5. Инициализация базы данных

```bash
# Запуск инициализации
chmod +x init-db.sh
./init-db.sh --sql
```

### 6. Запуск проекта

```bash
# Запуск
chmod +x start.sh
./start.sh
```

## 🌐 Доступ к приложению

Откройте браузер в Windows:

- **Frontend**: http://localhost:5001
- **Backend API**: http://localhost:4000/api
- **Swagger**: http://localhost:4000/api/docs

## 🔑 Учётные данные

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

## 🛑 Остановка

```bash
# Остановка всех сервисов
chmod +x stop.sh
./stop.sh
```

Или нажмите `Ctrl+C` в терминале, где запущен `start.sh`

## 📋 Полезные команды

### Просмотр логов

```bash
# Логи backend
tail -f logs/backend.log

# Логи frontend
tail -f logs/frontend.log
```

### Перезапуск

```bash
./stop.sh
./start.sh
```

### Обновление проекта

```bash
git pull
./install.sh
./stop.sh
./start.sh
```

## 🐛 Решение проблем

### Ошибка: "Cannot find module"

```bash
./install.sh
```

### Ошибка: "EADDRINUSE: port already in use"

```bash
# Найти процесс
lsof -i:4000  # или 5001

# Остановить процесс
kill <PID>

# Или использовать скрипт остановки
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

### Frontend не открывается в Windows

WSL2 использует виртуальную сеть. Попробуйте:

1. Используйте `localhost` (должно работать автоматически)
2. Или найдите IP адрес WSL:
   ```bash
   ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
   ```
3. Откройте в Windows: `http://<WSL_IP>:5001`

## 📚 Дополнительная информация

- [Полная документация без Docker](README_NO_DOCKER.md)
- [Документация Docker](DOCKER_DEPLOY.md)
- [Основной README](README.md)

---

**Версия:** 1.1.0  
**Режим:** WSL Ubuntu без Docker  
**Дата:** 2024
