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

# Перезапускаем backend для применения изменений портов
echo ""
echo "🔄 Перезапуск backend..."
docker compose restart backend

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
docker compose logs --tail=20 frontend

echo ""
echo "📋 Логи backend:"
docker compose logs --tail=20 backend

echo ""
echo "✅ Готово!"
echo ""
echo "🌐 Доступ:"
echo "   Frontend: http://localhost:5001"
echo "   Backend API: http://localhost:4000/api"
echo "   Через nginx: http://localhost:5001/api"
echo ""
