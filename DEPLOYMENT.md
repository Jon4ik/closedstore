# Инструкция по развёртыванию в Docker

## 📋 Содержание
1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Подробная настройка](#подробная-настройка)
4. [Production развёртывание](#production-развёртывание)
5. [Обслуживание](#обслуживание)
6. [Решение проблем](#решение-проблем)

---

## Требования

### Минимальные системные требования
- **ОС**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+), Windows 10/11, macOS
- **CPU**: 2 ядра
- **RAM**: 4 GB
- **Диск**: 20 GB свободного места
- **Сеть**: Открытые порты 80 (HTTP) и 443 (HTTPS, опционально)

### Необходимое программное обеспечение
- **Docker**: версия 20.10 или выше
- **Docker Compose**: версия 2.0 или выше

### Проверка установки
```bash
# Проверка Docker
docker --version
# Ожидаемый вывод: Docker version 20.10.x или выше

# Проверка Docker Compose
docker compose version
# Ожидаемый вывод: Docker Compose version v2.x.x
```

---

## Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction
```

### 2. Настройка окружения
```bash
# Скопируйте пример конфигурации
cp .env.example .env

# Откройте файл для редактирования
nano .env
```

### 3. Минимальная настройка .env
Отредактируйте следующие параметры:

```env
# Обязательные параметры
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
DOMAIN=localhost  # или ваш домен

# Опциональные параметры
PGADMIN_PASSWORD=your_pgadmin_password
```

**Важно**: 
- Замените `your_secure_password_here` на надёжный пароль для PostgreSQL
- Замените `your_jwt_secret_at_least_32_characters_long` на случайную строку (минимум 32 символа)
- Для локальной разработки оставьте `DOMAIN=localhost`

### 4. Запуск системы
```bash
# Сборка и запуск всех контейнеров
docker compose up -d

# Проверка статуса
docker compose ps
```

### 5. Доступ к системе
Откройте браузер и перейдите по адресу:
- **Локально**: http://localhost
- **На сервере**: http://your-server-ip

### 6. Первый вход
Используйте учётные данные:
- **Логин**: `admin`
- **Пароль**: `admin123`

**⚠️ Важно**: Сразу после первого входа измените пароль администратора!

---

## Подробная настройка

### Структура проекта
```
store-reconstruction/
├── frontend/                 # React приложение
├── backend/                  # NestJS API
│   ├── prisma/              # Схема базы данных
│   └── src/                 # Исходный код
├── docker-compose.yml       # Конфигурация Docker
├── .env.example             # Пример конфигурации
└── README.md                # Документация
```

### Конфигурация .env

#### Обязательные параметры
```env
# Пароль для PostgreSQL
POSTGRES_PASSWORD=your_secure_password_here

# Секрет для JWT токенов (минимум 32 символа)
JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# Домен или IP адрес сервера
DOMAIN=localhost
```

#### Опциональные параметры
```env
# Настройки базы данных
DB_HOST=postgres
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_SSL=false

# Срок действия JWT токена
JWT_EXPIRES_IN=7d

# Настройки pgAdmin (опционально)
PGADMIN_EMAIL=admin@company.ru
PGADMIN_PASSWORD=your_pgadmin_password

# Настройки SMTP для уведомлений (опционально)
SMTP_HOST=smtp.yourcompany.ru
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.ru
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=Реконструкция <noreply@yourcompany.ru>
```

### Генерация безопасных паролей

#### Linux/macOS
```bash
# Генерация пароля для PostgreSQL
openssl rand -base64 32

# Генерация JWT секрета
openssl rand -hex 32
```

#### Windows (PowerShell)
```powershell
# Генерация пароля
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

#### Онлайн генераторы
- https://passwordsgenerator.net/
- https://www.lastpass.com/passwordgenerator

---

## Production развёртывание

### 1. Подготовка сервера

#### Ubuntu 22.04
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Установка Docker Compose (входит в Docker 20.10+)
# Проверка:
docker compose version

# Перелогиньтесь для применения группы docker
exit
# Войдите снова
```

#### CentOS 8 / Rocky Linux
```bash
# Установка Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 2. Настройка файрвола

#### UFW (Ubuntu)
```bash
# Включение файрвола
sudo ufw enable

# Открытие портов
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH

# Проверка правил
sudo ufw status
```

#### firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Настройка домена (опционально)

#### DNS запись
Добавьте A-запись для вашего домена:
```
Type: A
Name: reconstruction.yourcompany.ru
Value: YOUR_SERVER_IP
TTL: 3600
```

#### Обновление .env
```env
DOMAIN=reconstruction.yourcompany.ru
```

### 4. Настройка SSL/HTTPS

#### Автоматический SSL через Let's Encrypt
```bash
# Установка certbot
sudo apt install certbot

# Получение сертификата (остановите nginx сначала)
docker compose stop frontend
sudo certbot certonly --standalone -d reconstruction.yourcompany.ru

# Скопируйте сертификаты
sudo mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/reconstruction.yourcompany.ru/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/reconstruction.yourcompany.ru/privkey.pem ./nginx/ssl/

# Измените владельца
sudo chown -R $USER:$USER ./nginx/ssl
```

#### Обновление nginx.conf
Раскомментируйте секцию HTTPS в `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name reconstruction.yourcompany.ru;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # ... остальная конфигурация
}
```

#### Перезапуск
```bash
docker compose up -d
```

### 5. Автоматическое обновление SSL
```bash
# Добавление cron задачи
sudo crontab -e

# Добавьте строку:
0 3 * * * cd /path/to/store-reconstruction && docker compose exec frontend certbot renew --quiet && docker compose restart frontend
```

---

## Обслуживание

### Просмотр логов
```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

# Последние 100 строк
docker compose logs --tail=100 backend
```

### Резервное копирование

#### Создание бэкапа базы данных
```bash
# Создать бэкап
docker compose exec postgres pg_dump -U postgres store_reconstruction > backup_$(date +%Y%m%d_%H%M%S).sql

# Сжать бэкап
gzip backup_*.sql
```

#### Восстановление из бэкапа
```bash
# Распаковать (если сжат)
gunzip backup_20240115_120000.sql.gz

# Восстановить
cat backup_20240115_120000.sql | docker compose exec -T postgres psql -U postgres store_reconstruction
```

#### Автоматический бэкап (cron)
```bash
# Создать скрипт бэкапа
nano /path/to/store-reconstruction/backup.sh
```

Содержимое `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec postgres pg_dump -U postgres store_reconstruction > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Удалить бэкапы старше 30 дней
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup created: backup_$DATE.sql.gz"
```

```bash
# Сделать исполняемым
chmod +x /path/to/store-reconstruction/backup.sh

# Добавить в cron (ежедневно в 3:00)
crontab -e
# Добавьте:
0 3 * * * /path/to/store-reconstruction/backup.sh
```

### Обновление системы

#### Обновление кода
```bash
# Получить последние изменения
git pull origin main

# Пересобрать и перезапустить
docker compose up -d --build
```

#### Обновление только frontend
```bash
docker compose up -d --build frontend
```

#### Обновление только backend
```bash
docker compose up -d --build backend
```

### Мониторинг ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Проверка места на диске
docker system df

# Очистка неиспользуемых образов
docker image prune -a
```

### Проверка здоровья сервисов
```bash
# Статус всех контейнеров
docker compose ps

# Проверка здоровья PostgreSQL
docker compose exec postgres pg_isready

# Проверка API
curl http://localhost/api/health
```

---

## Решение проблем

### Контейнер не запускается

#### Проблема: `port is already allocated`
```bash
# Найти процесс, использующий порт
sudo lsof -i :80
sudo lsof -i :5432

# Остановить конфликтующий сервис
sudo systemctl stop nginx
# или
sudo kill -9 <PID>
```

#### Проблема: `permission denied`
```bash
# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниться
exit
# Войти снова
```

### База данных не подключается

#### Проверка статуса PostgreSQL
```bash
docker compose logs postgres

# Проверка подключения
docker compose exec postgres psql -U postgres -c "SELECT version();"
```

#### Сброс базы данных (⚠️ удалит все данные!)
```bash
# Остановить контейнеры
docker compose down

# Удалить volume с данными
docker volume rm store-reconstruction_postgres_data

# Запустить заново
docker compose up -d
```

### Проблемы с правами доступа

#### Ошибка: `EACCES: permission denied`
```bash
# Исправить владельца файлов
sudo chown -R $USER:$USER .

# Перезапустить контейнеры
docker compose restart
```

### Очистка и полный сброс

#### Полная очистка (⚠️ удалит все данные!)
```bash
# Остановить и удалить контейнеры
docker compose down -v

# Удалить образы
docker compose down --rmi all

# Перезапустить
docker compose up -d
```

### Проблема: изменения не применяются

#### Очистка кэша
```bash
# Пересборка без кэша
docker compose build --no-cache

# Перезапуск
docker compose up -d
```

### Получение помощи

#### Логи для отладки
```bash
# Полные логи всех сервисов
docker compose logs > debug_logs.txt

# Логи с временными метками
docker compose logs --timestamps > debug_logs_with_time.txt
```

#### Проверка конфигурации
```bash
# Проверка .env файла
cat .env

# Проверка docker-compose.yml
docker compose config
```

---

## Дополнительные команды

### Вход в контейнер
```bash
# Войти в backend контейнер
docker compose exec backend sh

# Войти в PostgreSQL
docker compose exec postgres psql -U postgres store_reconstruction

# Выйти из контейнера
exit
```

### Выполнение команд в контейнере
```bash
# Выполнить команду без входа
docker compose exec backend npm run build

# Запустить миграции
docker compose exec backend npx prisma migrate deploy

# Seed данные
docker compose exec backend npx prisma db seed
```

### Экспорт/импорт данных

#### Экспорт в JSON
```bash
docker compose exec postgres psql -U postgres store_reconstruction -c "COPY (SELECT * FROM store_projects) TO STDOUT WITH CSV HEADER" > projects_export.csv
```

#### Импорт из CSV
```bash
docker compose exec postgres psql -U postgres store_reconstruction -c "\COPY store_projects FROM '/path/to/file.csv' WITH CSV HEADER"
```

---

## Безопасность

### Рекомендации для production

1. **Измените все пароли по умолчанию**
   - PostgreSQL пароль
   - JWT секрет
   - Пароль администратора после первого входа

2. **Используйте HTTPS**
   - Настройте SSL сертификат
   - Перенаправьте HTTP на HTTPS

3. **Ограничьте доступ**
   - Используйте файрвол
   - Откройте только необходимые порты (80, 443, 22)
   - Используйте VPN для административного доступа

4. **Регулярные бэкапы**
   - Настройте автоматический бэкап базы данных
   - Храните бэкапы в другом месте
   - Тестируйте восстановление из бэкапа

5. **Обновления**
   - Регулярно обновляйте систему
   - Обновляйте Docker образы
   - Следите за безопасностью зависимостей

6. **Мониторинг**
   - Настройте мониторинг ресурсов
   - Отслеживайте логи на наличие ошибок
   - Используйте системы алертинга

---

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все сервисы запущены: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Проверьте доступность портов
5. Обратитесь к разделу "Решение проблем" выше

Для дополнительной помощи создайте issue в репозитории проекта.
