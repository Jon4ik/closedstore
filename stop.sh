#!/bin/bash

# Скрипт остановки проекта без Docker

echo "🛑 Остановка всех сервисов..."

# Поиск и остановка backend процесса
BACKEND_PID=$(lsof -ti:4000 2>/dev/null || echo "")
if [ ! -z "$BACKEND_PID" ]; then
    echo "   Остановка backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    sleep 1
    kill -9 $BACKEND_PID 2>/dev/null || true
    echo "   ✅ Backend остановлен"
else
    echo "   ℹ️  Backend не запущен"
fi

# Поиск и остановка frontend процесса
FRONTEND_PID=$(lsof -ti:5001 2>/dev/null || echo "")
if [ ! -z "$FRONTEND_PID" ]; then
    echo "   Остановка frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    sleep 1
    kill -9 $FRONTEND_PID 2>/dev/null || true
    echo "   ✅ Frontend остановлен"
else
    echo "   ℹ️  Frontend не запущен"
fi

echo ""
echo "✅ Все сервисы остановлены"
