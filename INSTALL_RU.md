# 🚀 Развёртывание системы в Docker

## Быстрый старт (5 минут)

### 1. Установка Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**Windows/Mac:**
Скачайте Docker Desktop с [официального сайта](https://www.docker.com/products/docker-desktop)

### 2. Клонирование и настройка

```bash
# Клонируем репозиторий
git clone https://github.com/your-org/store-reconstruction.git
cd store-reconstruction

# Копируем файл конфигурации
cp .env.example .env

# Открываем для редактирования
nano .env
```

### 3. Настройка .env

Отредактируйте следующие параметры:

```env
# Пароль для базы данных (придумайте надёжный пароль)
POSTGRES_PASSWORD=YourStrongPassword123!

# Секретный ключ для JWT (минимум 32 символа)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Домен или IP адрес (для локальной разработки оставьте localhost)
DOMAIN=localhost
```

### 4. Запуск системы

```bash
# Запускаем все контейнеры
docker compose up -d

# Проверяем статус
docker compose ps
```

Вы должны увидеть:
```
NAME                    STATUS
reconstruction-db       Up (healthy)
reconstruction-api      Up
reconstruction-frontend Up
```

### 5. Вход в систему

Откройте браузер:
- **Локально**: http://localhost
- **На сервере**: http://YOUR_SERVER_IP

**Учётные данные:**
- Логин: `admin`
- Пароль: `admin123`

⚠️ **Важно**: Сразу после входа измените пароль администратора!

---

## 📊 Типы работ в системе

В системе поддерживаются три типа работ:

### 1. 🔴 Закрытие
Закрытие магазина по различным причинам (нерентабельность, окончание аренды и т.д.)

**Этапы:**
- Закрытие для покупателей
- Демонтаж
- Завершено

**Цвет в таблице:** Оранжевый

### 2. 🟣 Реконструкция
Плановая или внеплановая реконструкция действующего магазина

**Этапы:**
- Закрытие для покупателей
- Демонтаж
- Монтаж
- Техническое открытие
- Завершено

**Цвет в таблице:** Фиолетовый

### 3. 🟢 Открытие
Открытие нового магазина с нуля

**Этапы:**
- Монтаж
- Техническое открытие
- Завершено

**Цвет в таблице:** Зелёный

---

## 🔧 Основные команды

### Управление контейнерами

```bash
# Запустить систему
docker compose up -d

# Остановить систему
docker compose down

# Перезапустить систему
docker compose restart

# Просмотр логов (все сервисы)
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
```

### Обновление системы

```bash
# Получить последние изменения
git pull origin main

# Пересобрать и перезапустить
docker compose up -d --build
```

### Резервное копирование

```bash
# Создать бэкап базы данных
docker compose exec postgres pg_dump -U postgres store_reconstruction > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
cat backup.sql | docker compose exec -T postgres psql -U postgres store_reconstruction
```

---

## 🌐 Production развёртывание

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Настройка файрвола
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. Настройка домена

Добавьте DNS запись:
```
Type: A
Name: reconstruction.yourcompany.ru
Value: YOUR_SERVER_IP
```

Обновите `.env`:
```env
DOMAIN=reconstruction.yourcompany.ru
```

### 3. Настройка SSL (HTTPS)

```bash
# Установка certbot
sudo apt install certbot

# Получение сертификата
docker compose stop frontend
sudo certbot certonly --standalone -d reconstruction.yourcompany.ru

# Копирование сертификатов
sudo mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/reconstruction.yourcompany.ru/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/reconstruction.yourcompany.ru/privkey.pem ./nginx/ssl/
sudo chown -R $USER:$USER ./nginx/ssl

# Перезапуск
docker compose up -d
```

### 4. Автоматический бэкап

Создайте скрипт `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec postgres pg_dump -U postgres store_reconstruction > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Удалить бэкапы старше 30 дней
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Добавьте в cron (ежедневно в 3:00):
```bash
chmod +x backup.sh
crontab -e
# Добавьте: 0 3 * * * /path/to/backup.sh
```

---

## 🔐 Безопасность

### Обязательные шаги:

1. **Измените все пароли по умолчанию**
   - PostgreSQL пароль в `.env`
   - JWT секрет в `.env`
   - Пароль администратора после первого входа

2. **Используйте HTTPS**
   - Настройте SSL сертификат
   - Перенаправьте HTTP на HTTPS

3. **Ограничьте доступ**
   - Используйте файрвол
   - Откройте только порты 80, 443, 22
   - Используйте VPN для административного доступа

4. **Регулярные бэкапы**
   - Настройте автоматический бэкап
   - Храните бэкапы в другом месте
   - Тестируйте восстановление

5. **Обновления**
   - Регулярно обновляйте систему
   - Обновляйте Docker образы

---

## 🐛 Решение проблем

### Контейнер не запускается

**Проблема:** `port is already allocated`

```bash
# Найти процесс
sudo lsof -i :80
sudo lsof -i :5432

# Остановить конфликтующий сервис
sudo systemctl stop nginx
```

### База данных не подключается

```bash
# Проверить статус
docker compose logs postgres

# Перезапустить PostgreSQL
docker compose restart postgres
```

### Изменения не применяются

```bash
# Очистить кэш и пересобрать
docker compose build --no-cache
docker compose up -d
```

### Полный сброс (⚠️ удалит все данные!)

```bash
docker compose down -v
docker compose up -d
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все сервисы запущены: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Проверьте доступность портов

Для дополнительной помощи создайте issue в репозитории проекта.

---

## 📚 Дополнительная информация

- [Полная документация](DEPLOYMENT.md)
- [README](README.md)
- [API документация](http://localhost/api/docs) (после запуска)

---

**Версия системы:** 1.0.0  
**Дата обновления:** 2024
