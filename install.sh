#!/bin/bash

# Скрипт установки зависимостей для проекта без Docker

set -e

echo "🚀 Установка зависимостей проекта..."
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    echo "Установите Node.js 20 или выше: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Требуется Node.js 20 или выше"
    echo "Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ npm $(npm -v)"

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден"
    echo "Создаю .env из .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  ВАЖНО: Отредактируйте .env и укажите настройки PostgreSQL!"
    echo ""
fi

# Установка зависимостей frontend
echo ""
echo "📦 Установка зависимостей frontend..."
npm install
echo "✅ Frontend зависимости установлены"

# Установка зависимостей backend
echo ""
echo "📦 Установка зависимостей backend..."
cd backend
npm install

# Обновление Prisma до последней версии
echo ""
echo "🔄 Обновление Prisma до последней версии..."
npm install @prisma/client@latest prisma@latest
echo "✅ Prisma обновлен"

echo "✅ Backend зависимости установлены"

# Генерация Prisma client
echo ""
echo "🔧 Генерация Prisma client..."
npx prisma generate
echo "✅ Prisma client сгенерирован"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Установка завершена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. Отредактируйте .env (если еще не сделали):"
echo "   nano .env"
echo ""
echo "2. Инициализируйте базу данных:"
echo "   chmod +x init-db.sh"
echo "   ./init-db.sh --sql"
echo ""
echo "3. Запустите проект:"
echo "   chmod +x start.sh"
echo "   ./start.sh"
echo ""
echo "📚 Дополнительная информация: README_NO_DOCKER.md"
echo ""
