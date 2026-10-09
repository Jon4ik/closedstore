#!/bin/bash

# Быстрое исправление проблемы с Prisma

echo "🔧 Исправление проблемы с Prisma..."
echo ""

cd backend

# Обновление Prisma
echo "📦 Обновление Prisma до последней версии..."
npm install @prisma/client@latest prisma@latest

echo ""
echo "🔍 Проверка версии Prisma..."
npx prisma --version | grep "prisma"

echo ""
echo "🔧 Генерация Prisma client..."
npx prisma generate

echo ""
echo "✅ Prisma обновлен и настроен!"
echo ""
echo "📋 Теперь запустите инициализацию базы данных:"
echo "   cd .."
echo "   ./init-db.sh --sql"
echo ""
echo "Или используйте скрипт apply-migrations.sh для применения миграций:"
echo "   cd backend"
echo "   chmod +x apply-migrations.sh"
echo "   ./apply-migrations.sh"
echo ""

cd ..
