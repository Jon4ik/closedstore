-- Скрипт полной очистки базы данных
-- ВНИМАНИЕ: Это удалит ВСЕ данные из базы!

-- Отключение всех внешних ключей
SET session_replication_role = replica;

-- Удаление всех таблиц
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "store_projects" CASCADE;
DROP TABLE IF EXISTS "tus" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- Удаление таблицы миграций Prisma
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Удаление пользовательских типов
DROP TYPE IF EXISTS "WorkType" CASCADE;

-- Включение внешних ключей обратно
SET session_replication_role = DEFAULT;

-- Очистка схемы public
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Восстановление прав
GRANT ALL ON SCHEMA public TO current_user;

-- Сообщение об успешном выполнении
DO $$
BEGIN
    RAISE NOTICE '✅ База данных полностью очищена';
    RAISE NOTICE '🗑  Все таблицы удалены';
    RAISE NOTICE '';
    RAISE NOTICE 'Теперь выполните:';
    RAISE NOTICE '  docker compose restart backend';
    RAISE NOTICE '';
    RAISE NOTICE 'Prisma автоматически создаст новую схему и применит миграции';
END $$;
