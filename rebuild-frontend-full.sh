#!/bin/bash

echo "🔄 Полная пересборка frontend контейнера..."
echo ""

# Останавливаем frontend
echo "🛑 Остановка frontend..."
docker compose stop frontend

# Удаляем контейнер
echo "🗑️  Удаление контейнера..."
docker compose rm -f frontend

# Удаляем старый образ
echo "🗑️  Удаление старого образа..."
docker rmi reconstruction-frontend 2>/dev/null || true

# Пересобираем
echo "🔨 Пересборка frontend (это может занять 1-2 минуты)..."
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
echo "📋 Проверка содержимого контейнера:"
docker compose exec frontend ls -la /usr/share/nginx/html/

echo ""
echo "📋 Проверка assets:"
docker compose exec frontend ls -la /usr/share/nginx/html/assets/

echo ""
echo "✅ Готово!"
echo ""
echo "🌐 Доступ:"
echo "   Frontend: http://YOUR_SERVER_IP:5001"
echo "   Backend API: http://YOUR_SERVER_IP:5001/api/health"
echo ""
echo "💡 Если видите белую страницу:"
echo "   1. Очистите кэш браузера (Ctrl+Shift+R или Cmd+Shift+R)"
echo "   2. Откройте в режиме инкогнито"
echo "   3. Проверьте консоль браузера (F12)"
echo ""
