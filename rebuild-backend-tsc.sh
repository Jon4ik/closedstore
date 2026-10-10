#!/bin/bash

echo "🔨 Пересборка backend с использованием tsc напрямую..."
echo ""

# Останавливаем контейнер
echo "🛑 Остановка backend..."
docker compose stop backend

# Удаляем контейнер
echo "🗑️  Удаление контейнера..."
docker compose rm -f backend

# Используем альтернативный Dockerfile
echo "📦 Пересборка с Dockerfile.tsc..."
echo ""

# Временно заменяем Dockerfile
cp backend/Dockerfile backend/Dockerfile.backup
cp backend/Dockerfile.tsc backend/Dockerfile

# Пересобираем
docker compose build --no-cache backend 2>&1 | tee backend-build-tsc.log

# Восстанавливаем оригинальный Dockerfile
mv backend/Dockerfile.backup backend/Dockerfile

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
echo "Если видите ошибки TypeScript, проверьте файл backend-build-tsc.log"
echo ""
