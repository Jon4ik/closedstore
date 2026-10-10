-- AlterTable
ALTER TABLE "users" ADD COLUMN "chatId" TEXT;
ALTER TABLE "users" ADD COLUMN "telegramId" TEXT;
ALTER TABLE "users" ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'light';

-- CreateTable
CREATE TABLE "ldap_settings" (
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
