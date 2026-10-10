#!/bin/bash

echo "🔨 Пересборка backend с ts-node (без компиляции)..."
echo ""

# Останавливаем контейнер
echo "🛑 Остановка backend..."
docker compose stop backend

# Удаляем контейнер
echo "🗑️  Удаление контейнера..."
docker compose rm -f backend

# Используем Dockerfile с ts-node
echo "📦 Пересборка с Dockerfile.tsnode..."
echo ""

# Временно заменяем Dockerfile
cp backend/Dockerfile backend/Dockerfile.backup
cp backend/Dockerfile.tsnode backend/Dockerfile

# Пересобираем
docker compose build --no-cache backend 2>&1 | tee backend-build-tsnode.log

# Восстанавливаем оригинальный Dockerfile
mv backend/Dockerfile.backup backend/Dockerfile

echo ""
echo "🚀 Запуск backend..."
docker compose up -d backend

echo ""
echo "⏳ Ожидание запуска (20 секунд)..."
sleep 20

echo ""
echo "📊 Логи backend:"
echo "===================="
docker compose logs --tail=100 backend

echo ""
echo "✅ Готово!"
echo ""
echo "Этот вариант запускает приложение напрямую через ts-node без компиляции."
echo "Это медленнее, но надежнее и не требует успешной сборки."
echo ""
