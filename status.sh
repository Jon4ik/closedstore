#!/bin/bash

# Скрипт проверки статуса проекта без Docker

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Проверка статуса проекта"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка Node.js
echo "📦 Node.js:"
if command -v node &> /dev/null; then
    echo "   ✅ Node.js $(node -v)"
else
    echo "   ❌ Node.js не установлен"
fi

if command -v npm &> /dev/null; then
    echo "   ✅ npm $(npm -v)"
else
    echo "   ❌ npm не установлен"
fi
echo ""

# Проверка PostgreSQL
echo "🗄  PostgreSQL:"
if [ -f .env ]; then
    source <(grep -E '^DB_' .env)
    export PGPASSWORD=$DB_PASSWORD
    
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        echo "   ✅ Подключение к PostgreSQL успешно"
        echo "   📊 База данных: $DB_NAME"
        echo "   🏠 Хост: $DB_HOST:$DB_PORT"
        
        # Подсчет записей
        TABLES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        if [ ! -z "$TABLES" ] && [ "$TABLES" != "0" ]; then
            echo "   📋 Таблиц: $TABLES"
        else
            echo "   ⚠️  Таблицы не найдены (запустите: ./init-db.sh --sql)"
        fi
    else
        echo "   ❌ Не удалось подключиться к PostgreSQL"
        echo "   💡 Проверьте настройки в .env"
    fi
else
    echo "   ⚠️  Файл .env не найден"
fi
echo ""

# Проверка backend
echo "🔧 Backend:"
BACKEND_PID=$(lsof -ti:4000 2>/dev/null || echo "")
if [ ! -z "$BACKEND_PID" ]; then
    echo "   ✅ Backend запущен (PID: $BACKEND_PID)"
    echo "   🌐 Порт: 4000"
    
    # Проверка health endpoint
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "   ✅ Health check: OK"
    else
        echo "   ⚠️  Health check: не отвечает"
    fi
else
    echo "   ❌ Backend не запущен"
fi
echo ""

# Проверка frontend
echo "🌐 Frontend:"
FRONTEND_PID=$(lsof -ti:5001 2>/dev/null || echo "")
if [ ! -z "$FRONTEND_PID" ]; then
    echo "   ✅ Frontend запущен (PID: $FRONTEND_PID)"
    echo "   🌐 Порт: 5001"
    
    # Проверка доступности
    if curl -s http://localhost:5001 > /dev/null 2>&1; then
        echo "   ✅ Frontend доступен"
    else
        echo "   ⚠️  Frontend не отвечает"
    fi
else
    echo "   ❌ Frontend не запущен"
fi
echo ""

# Проверка сборки
echo "📦 Сборка:"
if [ -d "dist" ]; then
    echo "   ✅ Frontend собран (dist/)"
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo "   📊 Размер: $DIST_SIZE"
else
    echo "   ⚠️  Frontend не собран (запустите: npm run build)"
fi

if [ -d "backend/dist" ]; then
    echo "   ✅ Backend собран (backend/dist/)"
else
    echo "   ⚠️  Backend не собран (запустите: cd backend && npm run build)"
fi
echo ""

# Проверка зависимостей
echo "📚 Зависимости:"
if [ -d "node_modules" ]; then
    echo "   ✅ Frontend зависимости установлены"
else
    echo "   ❌ Frontend зависимости не установлены"
fi

if [ -d "backend/node_modules" ]; then
    echo "   ✅ Backend зависимости установлены"
else
    echo "   ❌ Backend зависимости не установлены"
fi
echo ""

# Итоговая информация
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Рекомендации:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$BACKEND_PID" ] || [ -z "$FRONTEND_PID" ]; then
    echo "▶️  Для запуска проекта:"
    echo "   chmod +x start.sh"
    echo "   ./start.sh"
    echo ""
fi

if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 Для установки зависимостей:"
    echo "   chmod +x install.sh"
    echo "   ./install.sh"
    echo ""
fi

if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ]; then
    echo "🛑 Для остановки проекта:"
    echo "   chmod +x stop.sh"
    echo "   ./stop.sh"
    echo ""
fi

echo "📚 Документация:"
echo "   📖 WSL: WSL_QUICKSTART.md"
echo "   📖 Без Docker: README_NO_DOCKER.md"
echo "   📖 С Docker: DOCKER_DEPLOY.md"
echo ""
