#!/bin/bash

# Скрипт запуска проекта без Docker

set -e

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
    echo "Запустите: ./install.sh"
    exit 1
fi

# Функция остановки всех процессов
cleanup() {
    echo ""
    echo "🛑 Остановка всех сервисов..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "✅ Все сервисы остановлены"
    exit 0
}

# Регистрация обработчика сигналов
trap cleanup SIGINT SIGTERM

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Запуск проекта без Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка базы данных
echo "📦 Проверка подключения к PostgreSQL..."
export PGPASSWORD=$DB_PASSWORD
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не удалось подключиться к базе данных"
    echo "Проверьте настройки в .env и запустите: ./init-db.sh --sql"
    exit 1
fi
echo "✅ Подключение к PostgreSQL успешно"
echo ""

# Применение миграций
echo "📋 Применение миграций Prisma..."
cd backend
npx prisma migrate deploy
cd ..
echo "✅ Миграции применены"
echo ""

# Запуск backend
echo "🔧 Запуск backend на порту 4000..."
cd backend
npm run start:prod > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend запущен (PID: $BACKEND_PID)"

# Ожидание запуска backend
echo "⏳ Ожидание запуска backend..."
sleep 5

# Проверка запуска backend
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend не запустился"
    echo "Проверьте логи: cat logs/backend.log"
    exit 1
fi
echo "✅ Backend работает"
echo ""

# Сборка frontend (если нужно)
if [ ! -d "dist" ]; then
    echo "📦 Сборка frontend..."
    npm run build
    echo "✅ Frontend собран"
    echo ""
fi

# Установка serve если не установлен
if ! command -v npx &> /dev/null; then
    echo "❌ npx не найден"
    exit 1
fi

# Запуск frontend
echo "🌐 Запуск frontend на порту 5001..."
mkdir -p logs
npx serve -s dist -l 5001 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend запущен (PID: $FRONTEND_PID)"
echo ""

# Ожидание запуска frontend
sleep 3

# Проверка запуска frontend
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend не запустился"
    echo "Проверьте логи: cat logs/frontend.log"
    cleanup
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Проект запущен!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Доступ к приложению:"
echo "   Frontend: http://localhost:5001"
echo "   Backend API: http://localhost:4000/api"
echo "   Swagger: http://localhost:4000/api/docs"
echo ""
echo "👤 Учётные данные:"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo ""
echo "📋 Логи:"
echo "   Backend: tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Ожидание сигнала остановки
wait
