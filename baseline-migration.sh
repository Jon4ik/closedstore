#!/bin/bash

# Скрипт для создания baseline миграции для существующей базы данных

set -e

echo "🔧 Создание baseline миграции для существующей базы данных..."
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
    exit 1
fi

DB_PORT=${DB_PORT:-5432}

echo "📦 Подключение к PostgreSQL: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Экспорт переменных для psql
export PGPASSWORD=$DB_PASSWORD

cd backend

# Создание таблицы _prisma_migrations если её нет
echo "📋 Создание таблицы _prisma_migrations..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id                      VARCHAR(36) PRIMARY KEY NOT NULL,
    checksum                VARCHAR(64) NOT NULL,
    finished_at             TIMESTAMP WITH TIME ZONE,
    migration_name          VARCHAR(255) NOT NULL,
    logs                    TEXT,
    rolled_back_at          TIMESTAMP WITH TIME ZONE,
    started_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    applied_steps_count     INTEGER NOT NULL DEFAULT 0
);
EOF

echo "✅ Таблица _prisma_migrations создана"
echo ""

# Вычисление checksum для migration.sql
echo "🔍 Вычисление checksum миграции..."
CHECKSUM=$(sha256sum prisma/migrations/20240101000000_init/migration.sql | cut -d' ' -f1)
echo "   Checksum: $CHECKSUM"
echo ""

# Добавление записи о примененной миграции
echo "📝 Добавление записи о примененной миграции..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
INSERT INTO _prisma_migrations (
    id,
    checksum,
    finished_at,
    migration_name,
    started_at,
    applied_steps_count
) VALUES (
    gen_random_uuid()::text,
    '$CHECKSUM',
    now(),
    '20240101000000_init',
    now(),
    1
) ON CONFLICT DO NOTHING;
EOF

echo "✅ Миграция отмечена как примененная"
echo ""

cd ..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Baseline миграция создана успешно!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Теперь вы можете:"
echo "   1. Запустить проект: ./start.sh"
echo "   2. Проверить статус: ./status.sh"
echo ""
echo "📚 Prisma теперь знает, что миграция уже применена"
echo ""
