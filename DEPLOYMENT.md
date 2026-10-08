# 🚀 Полная инструкция по развёртыванию (без встроенной PostgreSQL)

## 📋 Содержание
1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Настройка внешней PostgreSQL](#настройка-внешней-postgresql)
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
- **Сеть**: Открытые порты 5001 (Frontend) и 443 (HTTPS, опционально)

### Необходимое программное обеспечение
- **Docker**: версия 20.10 или выше
- **Docker Compose**: версия 2.0 или выше
- **PostgreSQL**: версия 13 или выше (внешняя база данных)

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
# Настройки PostgreSQL (внешняя база данных)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Секрет для JWT токенов (минимум 32 символа)
JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# Домен или IP адрес сервера
DOMAIN=localhost
```

**Важно**: 
- Замените `your-postgres-host` на адрес вашего PostgreSQL сервера
- Замените `your_secure_password_here` на надёжный пароль для PostgreSQL
- Замените `your_jwt_secret_at_least_32_characters_long` на случайную строку (минимум 32 символа)
- Для локальной разработки оставьте `DOMAIN=localhost`

### 4. Инициализация базы данных
```bash
# Создайте базу данных в PostgreSQL
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Запустите скрипт инициализации
chmod +x init-db.sh
./init-db.sh
```

Или вручную:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 5. Запуск системы
```bash
# Сборка и запуск всех контейнеров
docker compose up -d

# Проверка статуса
docker compose ps
```

### 6. Доступ к системе
Откройте браузер и перейдите по адресу:
- **Локально**: http://localhost:5001
- **На сервере**: http://your-server-ip:5001

### 7. Первый вход
Используйте учётные данные:
- **Логин**: `admin`
- **Пароль**: `admin123`

**⚠️ Важно**: Сразу после первого входа измените пароль администратора!

---

## Настройка внешней PostgreSQL

### Вариант 1: PostgreSQL на том же сервере

```bash
# Установка PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Создание базы данных и пользователя
sudo -u postgres psql

# В PostgreSQL prompt:
CREATE DATABASE store_reconstruction;
CREATE USER reconstruction WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE store_reconstruction TO reconstruction;
\q

# Настройка .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=reconstruction
DB_PASSWORD=your_secure_password
```

### Вариант 2: PostgreSQL на другом сервере

```bash
# На удалённом сервере установите PostgreSQL
sudo apt install postgresql postgresql-contrib

# Разрешите внешние подключения
sudo nano /etc/postgresql/15/main/postgresql.conf
# Измените: listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Добавьте: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql

# Создайте базу данных и пользователя
sudo -u postgres psql
CREATE DATABASE store_reconstruction;
CREATE USER reconstruction WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE store_reconstruction TO reconstruction;
\q

# Настройка .env на сервере приложения
DB_HOST=remote-server-ip
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=reconstruction
DB_PASSWORD=your_secure_password
```

### Вариант 3: Облачная PostgreSQL

Используйте облачные сервисы:
- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **Supabase**
- **Neon**

Настройки подключения предоставит облачный провайдер.

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
sudo ufw allow 5001/tcp  # Frontend
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH

# Проверка правил
sudo ufw status
```

#### firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-port=5001/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
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

# Получение сертификата (остановите frontend сначала)
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

# Последние 100 строк
docker compose logs --tail=100 backend
```

### Резервное копирование

#### Создание бэкапа базы данных
```bash
# Создать бэкап
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Сжать бэкап
gzip backup_*.sql
```

#### Восстановление из бэкапа
```bash
# Распаковать (если сжат)
gunzip backup_20240115_120000.sql.gz

# Восстановить
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup_20240115_120000.sql
```

#### Автоматический бэкап (cron)
```bash
# Создать скрипт бэкапа
nano /path/to/store-reconstruction/backup.sh
```

Содержимое `backup.sh`:
```bash
#!/bin/bash
source .env

BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
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

# Проверка API
curl http://localhost:4000/api/health
```

---

## Решение проблем

### Контейнер не запускается

#### Проблема: `port is already allocated`
```bash
# Найти процесс, использующий порт
sudo lsof -i :5001
sudo lsof -i :4000

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

### Backend не подключается к PostgreSQL

#### Проверка подключения
```bash
# Проверить логи backend
docker compose logs backend

# Проверить доступность PostgreSQL
docker compose exec backend ping $DB_HOST

# Проверить настройки .env
cat .env | grep DB_
```

#### Частые проблемы:
- PostgreSQL не запущен
- Порт 5432 закрыт в firewall
- Неправильные учётные данные
- База данных не создана

#### Решение:
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Проверить доступность порта
nc -zv $DB_HOST 5432

# Проверить подключение вручную
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
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
docker compose down

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
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "COPY (SELECT * FROM store_projects) TO STDOUT WITH CSV HEADER" > projects_export.csv
```

#### Импорт из CSV
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\COPY store_projects FROM '/path/to/file.csv' WITH CSV HEADER"
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
   - Откройте только необходимые порты (5001, 443, 22)
   - Используйте VPN для административного доступа

4. **Защитите PostgreSQL**
   - Используйте SSL для подключения к БД
   - Ограничьте доступ по IP
   - Регулярно меняйте пароли

5. **Регулярные бэкапы**
   - Настройте автоматический бэкап базы данных
   - Храните бэкапы в другом месте
   - Тестируйте восстановление из бэкапа

6. **Обновления**
   - Регулярно обновляйте систему
   - Обновляйте Docker образы
   - Следите за безопасностью зависимостей

7. **Мониторинг**
   - Настройте мониторинг ресурсов
   - Отслеживайте логи на наличие ошибок
   - Используйте системы алертинга

---

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все сервисы запущены: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Проверьте доступность PostgreSQL
5. Проверьте доступность портов
6. Обратитесь к разделу "Решение проблем" выше

Для дополнительной помощи создайте issue в репозитории проекта.

---

**Версия системы:** 1.1.0  
**Дата обновления:** 2024
