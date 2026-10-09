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

---

**Версия:** 1.1.0  
**Режим:** WSL Ubuntu без Docker  
**Время установки:** ~5 минут
