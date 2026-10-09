#!/bin/bash

# Скрипт инициализации базы данных PostgreSQL
# Используйте этот скрипт для создания таблиц и начальных данных

set -e

# Функция для вывода помощи
show_help() {
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  --sql          Использовать SQL скрипт для инициализации (без Docker)"
    echo "  --docker       Использовать Docker и Prisma для инициализации (по умолчанию)"
    echo "  --help, -h     Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0                    # Инициализация через Docker"
    echo "  $0 --sql              # Инициализация через SQL скрипт"
    echo "  $0 --docker           # Инициализация через Docker"
}

# Парсинг аргументов
METHOD="docker"
while [[ $# -gt 0 ]]; do
    case $1 in
        --sql)
            METHOD="sql"
            shift
            ;;
        --docker)
            METHOD="docker"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

echo "🚀 Начало инициализации базы данных..."
echo "   Метод: $METHOD"
echo ""

# Загрузка переменных из .env файла
if [ -f .env ]; then
    echo "📄 Загрузка переменных из .env..."
    # Загружаем переменные, игнорируя комментарии и пустые строки
    while IFS='=' read -r key value; do
        # Пропускаем комментарии и пустые строки
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # Удаляем пробелы вокруг =
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        # Экспортируем переменную
        export "$key"="$value"
    done < .env
    echo "✅ Переменные загружены"
else
    echo "❌ Ошибка: Файл .env не найден"
    echo "Создайте файл .env на основе .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Проверка переменных окружения
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Ошибка: Не установлены обязательные переменные окружения"
    echo "Проверьте файл .env и убедитесь, что установлены:"
    echo "  - DB_HOST"
    echo "  - DB_PORT"
    echo "  - DB_NAME"
    echo "  - DB_USER"
    echo "  - DB_PASSWORD"
    exit 1
fi

# Устанавливаем значения по умолчанию
DB_PORT=${DB_PORT:-5432}

echo ""
echo "📦 Подключение к PostgreSQL:"
echo "   Хост: $DB_HOST"
echo "   Порт: $DB_PORT"
echo "   База данных: $DB_NAME"
echo "   Пользователь: $DB_USER"
echo ""

# Экспорт переменных для psql
export PGPASSWORD=$DB_PASSWORD

# Проверка подключения
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Ошибка: Не удалось подключиться к базе данных"
    echo ""
    echo "Возможные причины:"
    echo "  1. PostgreSQL не запущен"
    echo "  2. Неправильные настройки подключения в .env"
    echo "  3. База данных '$DB_NAME' не создана"
    echo "  4. Порт $DB_PORT недоступен"
    echo "  5. Пользователь '$DB_USER' не имеет прав"
    echo ""
    echo "Создайте базу данных командой:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c \"CREATE DATABASE $DB_NAME;\""
    exit 1
fi

echo "✅ Подключение к базе данных успешно"
echo ""

# Выбор метода инициализации
if [ "$METHOD" = "sql" ]; then
    # Метод 1: Использование SQL скрипта
    echo "📋 Инициализация через SQL скрипт..."
    
    if [ ! -f "init-db.sql" ]; then
        echo "❌ Ошибка: Файл init-db.sql не найден"
        exit 1
    fi
    
    echo "   Выполнение init-db.sql..."
    if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f init-db.sql; then
        echo "❌ Ошибка: Не удалось выполнить SQL скрипт"
        exit 1
    fi
    
    echo ""
    echo "✅ SQL инициализация завершена!"
    echo ""
    echo "⚠️  ВНИМАНИЕ: Пароли пользователей в SQL скрипте являются заглушками!"
    echo "Для генерации правильных bcrypt хешей рекомендуется использовать Docker метод:"
    echo "  ./init-db.sh --docker"
    
else
    # Метод 2: Использование Docker и Prisma
    echo "📋 Инициализация через Docker и Prisma..."
    
    # Проверка наличия docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Ошибка: Docker не установлен или не добавлен в PATH"
        echo ""
        echo "Альтернатива: используйте SQL метод:"
        echo "  ./init-db.sh --sql"
        exit 1
    fi
    
    # Проверка наличия docker compose
    if ! command -v docker compose &> /dev/null; then
        echo "❌ Ошибка: Docker Compose не установлен"
        echo ""
        echo "Альтернатива: используйте SQL метод:"
        echo "  ./init-db.sh --sql"
        exit 1
    fi
    
    # Проверка запущен ли backend контейнер
    if ! docker compose ps backend | grep -q "Up"; then
        echo "⚠️  Backend контейнер не запущен"
        echo "   Запускаю backend..."
        docker compose up -d backend
        
        # Ждем пока backend запустится
        echo "   Ожидание запуска backend..."
        sleep 10
    fi
    
    # Применение миграций Prisma через Docker
    echo "📋 Применение миграций Prisma..."
    if ! docker compose exec -T backend sh -c "cd backend && ./apply-migrations.sh"; then
        echo "❌ Ошибка: Не удалось применить миграции"
        echo ""
        echo "Попробуйте:"
        echo "  1. Перезапустить backend: docker compose restart backend"
        echo "  2. Проверить логи: docker compose logs backend"
        echo "  3. Использовать SQL метод: ./init-db.sh --sql"
        exit 1
    fi
    
    # Запуск seed данных через Docker
    echo "🌱 Запуск seed данных..."
    if ! docker compose exec -T backend npx prisma db seed; then
        echo "❌ Ошибка: Не удалось запустить seed данные"
        exit 1
    fi
    
    echo ""
    echo "✅ Docker инициализация завершена!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Инициализация базы данных завершена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 База данных готова к использованию"
echo ""
echo "🌐 Доступ к приложению:"
echo "   Frontend: http://localhost:5001"
echo "   Backend API: http://localhost:4000/api"
echo "   Swagger: http://localhost:4000/api/docs"
echo ""
echo "👤 Учётные данные для входа:"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo ""
echo "⚠️  Не забудьте сменить пароль администратора после первого входа!"
echo ""
