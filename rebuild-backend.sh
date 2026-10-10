#!/bin/bash

# Скрипт для пересборки backend контейнера

echo "🔄 Пересборка backend контейнера..."
echo ""

# Остановка backend
echo "🛑 Остановка backend..."
docker compose stop backend

# Удаление старого образа
echo "🗑  Удаление старого образа..."
docker compose rm -f backend

# Пересборка без кэша
echo "🔨 Пересборка backend (без кэша)..."
docker compose build --no-cache backend

# Запуск backend
echo "🚀 Запуск backend..."
docker compose up -d backend

# Ожидание запуска
echo "⏳ Ожидание запуска backend (15 секунд)..."
sleep 15

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "📋 Логи backend:"
docker compose logs --tail=50 backend

echo ""
echo "✅ Пересборка завершена!"
echo ""
echo "Если backend не запустился, проверьте логи:"
echo "  docker compose logs -f backend"
