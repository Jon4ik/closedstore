#!/bin/bash

# Скрипт инициализации базы данных PostgreSQL
# Используйте этот скрипт для создания таблиц и начальных данных

set -e

echo "🚀 Начало инициализации базы данных..."

# Проверка переменных окружения
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Ошибка: Не установлены переменные окружения"
    echo "Убедитесь, что файл .env настроен корректно"
    exit 1
fi

# Экспорт переменных для psql
export PGPASSWORD=$DB_PASSWORD

echo "📦 Подключение к PostgreSQL на $DB_HOST:$DB_PORT..."

# Проверка подключения
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Ошибка: Не удалось подключиться к базе данных"
    echo "Проверьте настройки подключения в .env"
    exit 1
fi

echo "✅ Подключение успешно"

# Применение миграций Prisma
echo "📋 Применение миграций..."
cd backend
npx prisma migrate deploy

# Запуск seed данных
echo "🌱 Запуск seed данных..."
npx prisma db seed

echo "✅ Инициализация базы данных завершена!"
echo ""
echo "📊 База данных готова к использованию"
echo "🌐 Frontend: http://localhost:5001"
echo "🔧 Backend API: http://localhost:4000/api"
echo "📚 Swagger: http://localhost:4000/api/docs"
