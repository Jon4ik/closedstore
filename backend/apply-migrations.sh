#!/bin/bash

# Скрипт для применения миграций Prisma с поддержкой разных версий

set -e

cd backend

echo "🔧 Проверка версии Prisma..."

# Получение версии Prisma
PRISMA_VERSION=$(npx prisma --version 2>/dev/null | grep "prisma" | head -n1 | awk '{print $2}' || echo "unknown")
echo "   Версия Prisma: $PRISMA_VERSION"

# Проверка доступности команды migrate
if npx prisma migrate --help > /dev/null 2>&1; then
    echo "✅ Использование команды: prisma migrate deploy"
    npx prisma migrate deploy
elif npx prisma migration --help > /dev/null 2>&1; then
    echo "✅ Использование команды: prisma migration apply"
    npx prisma migration apply
else
    echo "❌ Не удалось найти команду для применения миграций"
    echo ""
    echo "Попробуйте:"
    echo "  1. Обновить Prisma: npm install @prisma/client@latest prisma@latest"
    echo "  2. Проверить версию: npx prisma --version"
    echo "  3. Просмотреть помощь: npx prisma --help"
    exit 1
fi

echo "✅ Миграции успешно применены"
