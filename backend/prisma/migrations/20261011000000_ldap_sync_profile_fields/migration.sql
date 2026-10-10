-- Миграция: синхронизация с LDAP, поля профиля пользователя, удаление userName из comments/audit_logs

-- ============================================
-- 1. Настройки LDAP (защищённое хранение)
-- ============================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ldap_configs') THEN
        CREATE TABLE "ldap_configs" (
            "id" TEXT NOT NULL DEFAULT 'default',
            "enabled" BOOLEAN NOT NULL DEFAULT false,
            "url" TEXT NOT NULL DEFAULT '',
            "bindDn" TEXT NOT NULL DEFAULT '',
            "bindPasswordEnc" TEXT NOT NULL DEFAULT '',
            "baseDn" TEXT NOT NULL DEFAULT '',
            "searchFilter" TEXT NOT NULL DEFAULT '(objectClass=user)',
            "titleAttribute" TEXT NOT NULL DEFAULT 'title',
            "lastSyncAt" TIMESTAMP(3),
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ldap_configs_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

INSERT INTO "ldap_configs" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- ============================================
-- 2. Новые поля профиля пользователя
-- ============================================
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chatId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "adAccount" TEXT;

-- ============================================
-- 3. Право "Синхронизация с LDAP" для системных ролей
-- ============================================
UPDATE "roles" SET "permissions" = array_append("permissions", 'ldap_sync')
WHERE "name" = 'Администратор' AND NOT ('ldap_sync' = ANY("permissions"));

-- ============================================
-- 4. Вырезаем userName из comments и audit_logs
-- (ФИО берётся из справочника пользователей по userId)
-- ============================================
ALTER TABLE "comments" DROP COLUMN IF EXISTS "userName";
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "userName";
