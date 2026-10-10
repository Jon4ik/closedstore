#!/bin/bash

echo "🚀 Настройка локального backend..."
echo ""

# Остановка Docker backend
echo "🛑 Остановка Docker backend..."
docker compose stop backend 2>/dev/null || true
docker compose rm -f backend 2>/dev/null || true

# Проверка Node.js
echo ""
echo "📦 Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    echo ""
    echo "Установите Node.js 20:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"

# Переход в папку backend
echo ""
echo "📂 Переход в папку backend..."
cd backend

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей (это может занять 2-3 минуты)..."
npm install

# Обновление Prisma
echo ""
echo "🔄 Обновление Prisma..."
npm install @prisma/client@latest prisma@latest

# Генерация Prisma client
echo ""
echo "🔧 Генерация Prisma client..."
npx prisma generate

# Возврат в корень
cd ..

# Пересборка frontend
echo ""
echo "🔨 Пересборка frontend контейнера..."
docker compose build --no-cache frontend

# Запуск frontend
echo ""
echo "🚀 Запуск frontend..."
docker compose up -d frontend

# Ожидание
echo ""
echo "⏳ Ожидание запуска (10 секунд)..."
sleep 10

# Запуск backend локально
echo ""
echo "🚀 Запуск backend локально..."
echo ""
echo "⚠️  ВАЖНО: Откройте НОВЫЙ терминал и выполните:"
echo ""
echo "   cd ~/store-reconstruction/backend"
echo "   npm run start:dev"
echo ""
echo "Это запустит backend в режиме разработки с автоперезагрузкой."
echo ""

# Проверка статуса
echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. В НОВОМ терминале запустите backend:"
echo "   cd ~/store-reconstruction/backend"
echo "   npm run start:dev"
echo ""
echo "2. Дождитесь сообщения:"
echo "   🚀 Backend running on http://localhost:4000"
echo ""
echo "3. Проверьте в браузере:"
echo "   Frontend: http://localhost:5001"
echo "   API: http://localhost:5001/api/health"
echo "   Swagger: http://localhost:5001/api/docs"
echo ""
