#!/bin/bash

# Скрипт инициализации базы данных
# Используйте этот скрипт если таблицы не создались автоматически

set -e

echo "🚀 Инициализация базы данных..."
echo ""

# Загрузка переменных из .env
if [ -f .env ]; then
    echo "📄 Загрузка переменных из .env..."
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        export "$key"="$value"
    done < .env
else
    echo "❌ Файл .env не найден"
    exit 1
fi

# Проверка переменных
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Не установлены обязательные переменные окружения"
    echo "Проверьте файл .env"
    exit 1
fi

DB_PORT=${DB_PORT:-5432}

echo "📦 Подключение к PostgreSQL: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Экспорт переменных для psql
export PGPASSWORD=$DB_PASSWORD

# Проверка подключения
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не удалось подключиться к базе данных"
    echo ""
    echo "Создайте базу данных командой:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c \"CREATE DATABASE $DB_NAME;\""
    exit 1
fi

echo "✅ Подключение успешно"
echo ""

# Применение миграций через Docker
echo "📋 Применение миграций Prisma..."
docker compose exec backend npx prisma migrate deploy

echo ""
echo "🌱 Запуск seed данных..."
docker compose exec backend npx prisma db seed

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "📊 Проверка данных:"
echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo "   SELECT * FROM roles;"
echo "   SELECT * FROM users;"
echo ""
echo "👤 Учётные данные для входа:"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo ""
