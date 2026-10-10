#!/bin/bash

# Скрипт полной очистки базы данных
# ВНИМАНИЕ: Это удалит ВСЕ данные!

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

# Удаление всех таблиц и типов
echo "🗑  Удаление всех таблиц и типов..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
-- Удаление всех таблиц
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "store_projects" CASCADE;
DROP TABLE IF EXISTS "tus" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- Удаление таблицы миграций Prisma
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Удаление пользовательских типов
DROP TYPE IF EXISTS "WorkType" CASCADE;

-- Очистка схемы public
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Восстановление прав
GRANT ALL ON SCHEMA public TO current_user;
EOF

echo "✅ База данных очищена"
echo ""
echo "📋 Теперь запустите:"
echo "   docker compose restart backend"
echo ""
echo "Или для полной пересборки:"
echo "   docker compose down"
echo "   docker compose build --no-cache backend"
echo "   docker compose up -d"
echo ""
