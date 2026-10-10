#!/bin/bash

echo "🔨 Пересборка backend с детальной отладкой..."
echo ""

# Останавливаем контейнер
echo "🛑 Остановка backend..."
docker compose stop backend

# Удаляем контейнер
echo "🗑️  Удаление контейнера..."
docker compose rm -f backend

# Пересобираем с полным выводом
echo "📦 Пересборка образа (это может занять 2-3 минуты)..."
echo ""
docker compose build --no-cache backend 2>&1 | tee backend-build.log

echo ""
echo "📋 Проверка результата сборки..."
echo ""

# Проверяем, есть ли папка dist в образе
echo "🔍 Проверка содержимого образа..."
docker run --rm reconstruction-backend ls -la /app/ || echo "⚠️  Не удалось проверить содержимое"

echo ""
echo "🚀 Запуск backend..."
docker compose up -d backend

echo ""
echo "⏳ Ожидание запуска (15 секунд)..."
sleep 15

echo ""
echo "📊 Логи backend:"
echo "===================="
docker compose logs --tail=100 backend

echo ""
echo "✅ Готово!"
echo ""
echo "Если видите ошибку 'Cannot find module', проверьте:"
echo "1. Файл backend-build.log - есть ли там ошибки сборки"
echo "2. Логи выше - что именно не найдено"
echo ""
