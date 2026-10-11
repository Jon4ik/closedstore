ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "chatId" TEXT,
  ADD COLUMN IF NOT EXISTS "telegramId" TEXT,
  ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light';

UPDATE "users" SET "theme" = 'light' WHERE "theme" IS NULL OR "theme" NOT IN ('light', 'dark', 'system');
