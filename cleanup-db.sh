#!/bin/bash

# Скрипт полной очистки базы данных
# ВНИМАНИЕ: Это удалит ВСЕ данные из базы!

set -e

echo "⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные из базы данных!"
echo ""
read -p "Вы уверены? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Операция отменена"
    exit 0
fi

echo ""
echo "🗑  Очистка базы данных..."

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

DB_PORT=${DB_PORT:-5432}
export PGPASSWORD=$DB_PASSWORD

echo "📦 Подключение к PostgreSQL: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Выполнение SQL скрипта очистки
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f cleanup-db.sql

echo ""
echo "✅ База данных очищена"
echo ""
echo "📋 Теперь перезапустите backend для применения миграций:"
echo "   docker compose restart backend"
echo ""
echo "Или для полной пересборки:"
echo "   docker compose down"
echo "   docker compose build --no-cache backend"
echo "   docker compose up -d"
echo ""
