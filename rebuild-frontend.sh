#!/bin/bash

echo "🔄 Пересборка frontend контейнера..."
echo ""

# Останавливаем frontend
echo "🛑 Остановка frontend..."
docker compose stop frontend

# Удаляем контейнер
echo "🗑️  Удаление контейнера..."
docker compose rm -f frontend

# Пересобираем
echo "🔨 Пересборка frontend..."
docker compose build --no-cache frontend

# Запускаем
echo "🚀 Запуск frontend..."
docker compose up -d frontend

# Ожидание
echo ""
echo "⏳ Ожидание запуска (10 секунд)..."
sleep 10

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "📋 Логи frontend:"
docker compose logs --tail=30 frontend

echo ""
echo "✅ Готово!"
echo ""
echo "🌐 Доступ:"
echo "   Frontend: http://localhost:5001"
echo "   Backend API: http://localhost:5001/api"
echo ""
