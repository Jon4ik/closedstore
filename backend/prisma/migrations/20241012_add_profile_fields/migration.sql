-- AlterTable: Add profile fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chatId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light';
