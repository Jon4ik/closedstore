# Реконструкция — Закрытие

Система управления графиками реконструкций, закрытий и открытий магазинов.

## 🚀 Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (внешняя база данных)

### 1. Клонирование и настройка

```bash
git clone <your-repo-url>
cd store-reconstruction
cp .env.example .env
nano .env
```

### 2. Настройка .env

Отредактируйте настройки подключения к PostgreSQL:

```env
# PostgreSQL (внешняя база данных)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT секрет (минимум 32 символа)
JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# Домен
DOMAIN=localhost
```

### 3. Создание базы данных

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
```

### 4. Запуск

```bash
docker compose up -d
```

### 5. Доступ

- **Frontend**: http://your-server-ip:5001
- **Backend API**: http://your-server-ip:4000/api
- **Swagger**: http://your-server-ip:4000/api/docs

### 6. Вход

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Менеджер |
| viewer | viewer123 | Наблюдатель |

⚠️ **Сразу измените пароль администратора!**

## 📊 Типы работ

### 🔴 Закрытие
- Этапы: Закрытие для покупателей → Демонтаж
- Цвет: Оранжевый

### 🟣 Реконструкция
- Этапы: Закрытие → Демонтаж → Монтаж → Тех. открытие
- Цвет: Фиолетовый

### 🟢 Открытие
- Этапы: Монтаж → Тех. открытие
- Цвет: Зеленый

## 🔧 Основные команды

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Логи
docker compose logs -f

# Пересборка
docker compose up -d --build
```

## 🗄 Резервное копирование

```bash
# Создать бэкап
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Восстановить
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup.sql
```

## 🔐 Безопасность

1. Измените все пароли по умолчанию
2. Используйте HTTPS (настройте SSL)
3. Ограничьте доступ через firewall
4. Регулярно делайте бэкапы

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs`
2. Проверьте статус: `docker compose ps`
3. Проверьте `.env` конфигурацию

---

**Версия:** 1.1.0  
**Режим:** Docker
