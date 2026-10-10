#!/bin/bash

# Скрипт для полной очистки базы данных и создания миграций с нуля

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

# Удаление всех таблиц
echo "📦 Подключение к PostgreSQL: $DB_HOST:$DB_PORT/$DB_NAME"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO current_user;
EOF

echo "✅ База данных очищена"
echo ""

cd backend

# Создание миграции из схемы
echo "📋 Создание миграции из Prisma схемы..."
npx prisma migrate dev --name init --create-only

echo ""
echo "✅ Миграция создана"
echo ""

cd ..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ База данных очищена и миграция создана!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Теперь запустите:"
echo "   1. cd backend && npx prisma migrate deploy"
echo "   2. cd .. && ./init-db.sh --sql"
echo "   3. ./start.sh"
echo ""
