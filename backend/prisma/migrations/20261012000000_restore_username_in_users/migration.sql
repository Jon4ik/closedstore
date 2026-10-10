-- Миграция: вернуть поле userName в таблицу users (необходимо для работы авторизации)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "userName" TEXT NOT NULL DEFAULT '';

-- Заполняем существующими данными: отображаемое имя = ФИО пользователя
UPDATE "users" SET "userName" = "fullName" WHERE "userName" = '' OR "userName" IS NULL;
