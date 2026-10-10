-- AlterTable: Add profile fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chatId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light';

-- CreateTable: LDAP settings
CREATE TABLE IF NOT EXISTS "ldap_settings" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 389,
    "baseDn" TEXT NOT NULL,
    "bindDn" TEXT NOT NULL,
    "bindPassword" TEXT NOT NULL,
    "useSsl" BOOLEAN NOT NULL DEFAULT false,
    "searchFilter" TEXT NOT NULL DEFAULT '(objectClass=user)',
    "titleAttribute" TEXT NOT NULL DEFAULT 'title',
    "titleValue" TEXT NOT NULL DEFAULT 'Территориальный управляющий',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ldap_settings_pkey" PRIMARY KEY ("id")
);
