#!/bin/bash

# Быстрый старт для WSL Ubuntu

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Быстрый старт для WSL Ubuntu"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    echo ""
    echo "Установите Node.js 20:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    echo ""
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Проверка PostgreSQL
echo "🗄  Проверка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL клиент не установлен"
    echo ""
    echo "Установите PostgreSQL:"
    echo "  sudo apt install -y postgresql postgresql-contrib"
    echo ""
fi

# Проверка .env
if [ ! -f .env ]; then
    echo "📝 Создание .env из .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  ВАЖНО: Отредактируйте .env и укажите настройки PostgreSQL!"
    echo "  nano .env"
    echo ""
    read -p "Нажмите Enter после редактирования .env..."
fi

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей..."
chmod +x install.sh
./install.sh

# Инициализация базы данных
echo ""
echo "🗄  Инициализация базы данных..."
echo ""
read -p "Создать базу данных closestore? (y/n): " CREATE_DB
if [ "$CREATE_DB" = "y" ]; then
    read -p "Имя пользователя PostgreSQL: " DB_USER
    read -sp "Пароль PostgreSQL: " DB_PASS
    echo ""
    
    # Обновление .env
    sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
    
    # Создание базы данных
    echo "Создание базы данных..."
    PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -c "CREATE DATABASE closestore;" 2>/dev/null || echo "База данных уже существует"
fi

echo ""
echo "Запуск инициализации..."
chmod +x init-db.sh
./init-db.sh --sql

# Запуск проекта
echo ""
echo "🚀 Запуск проекта..."
chmod +x start.sh
./start.sh
