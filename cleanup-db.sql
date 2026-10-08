-- Скрипт очистки базы данных
-- ВНИМАНИЕ: Это удалит ВСЕ данные из базы!

-- Отключение всех внешних ключей
SET session_replication_role = replica;

-- Удаление всех таблиц
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Включение внешних ключей обратно
SET session_replication_role = DEFAULT;

-- Создание схемы public
CREATE SCHEMA IF NOT EXISTS public;

-- Сообщение об успешном выполнении
DO $$
BEGIN
    RAISE NOTICE '✅ База данных очищена';
    RAISE NOTICE '🗑  Все таблицы удалены';
    RAISE NOTICE '';
    RAISE NOTICE 'Теперь запустите инициализацию:';
    RAISE NOTICE '  ./init-db.sh --sql';
END $$;
