# Реконструкция — Закрытие

Система управления графиками реконструкций, закрытий и открытий магазинов.

## 🚀 Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (внешняя база данных)

### 1. Настройка

```bash
# Скопируйте пример конфигурации
cp .env.example .env

# Отредактируйте .env
nano .env
```

Укажите настройки PostgreSQL:
```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=store_reconstruction
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_at_least_32_characters
DOMAIN=localhost
```

### 2. Создание базы данных

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
```

### 3. Запуск

```bash
docker compose up -d
```

### 4. Доступ

- **Frontend**: http://your-server-ip:5001
- **Backend API**: http://your-server-ip:4000/api
- **Swagger**: http://your-server-ip:4000/api/docs

### 5. Вход

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

**Версия:** 2.0.4  
**Режим:** Docker
