-- CreateEnum (с проверкой существования)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkType') THEN
        CREATE TYPE "WorkType" AS ENUM ('Закрытие', 'Реконструкция', 'Открытие');
    END IF;
END $$;

-- CreateTable (с проверкой существования)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        CREATE TABLE "roles" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT NOT NULL DEFAULT '',
            "permissions" TEXT[],
            "isSystem" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE "users" (
            "id" TEXT NOT NULL,
            "username" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "fullName" TEXT NOT NULL,
            "roleId" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "chatId" TEXT NOT NULL DEFAULT '',
            "telegramId" TEXT NOT NULL DEFAULT '',
            "theme" TEXT NOT NULL DEFAULT 'light',
            "adAccount" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tus') THEN
        CREATE TABLE "tus" (
            "id" TEXT NOT NULL,
            "fullName" TEXT NOT NULL,
            "position" TEXT NOT NULL DEFAULT 'Территориальный управляющий',
            "phone" TEXT,
            "email" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "tus_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_projects') THEN
        CREATE TABLE "store_projects" (
            "id" TEXT NOT NULL,
            "storeNumber" TEXT NOT NULL,
            "address" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "workType" TEXT NOT NULL,
            "closureDate" TIMESTAMP(3),
            "demolitionDate" TIMESTAMP(3),
            "installationDate" TIMESTAMP(3),
            "techOpenDate" TIMESTAMP(3),
            "tuId" TEXT NOT NULL,
            "rowColor" TEXT NOT NULL DEFAULT '',
            "comment" TEXT NOT NULL DEFAULT '',
            "status" TEXT NOT NULL DEFAULT 'Запланирован',
            "manualStatus" TEXT,
            "isDeleted" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdBy" TEXT NOT NULL,
            CONSTRAINT "store_projects_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        CREATE TABLE "comments" (
            "id" TEXT NOT NULL,
            "storeId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "text" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE TABLE "audit_logs" (
            "id" TEXT NOT NULL,
            "storeId" TEXT,
            "userId" TEXT NOT NULL,
            "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "action" TEXT NOT NULL,
            "field" TEXT NOT NULL,
            "oldValue" TEXT NOT NULL DEFAULT '',
            "newValue" TEXT NOT NULL DEFAULT '',
            "details" TEXT NOT NULL DEFAULT '',
            CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- CreateIndex (с проверкой существования)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'roles_name_key') THEN
        CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_username_key') THEN
        CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'comments_storeId_idx') THEN
        CREATE INDEX "comments_storeId_idx" ON "comments"("storeId");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'audit_logs_userId_idx') THEN
        CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'audit_logs_storeId_idx') THEN
        CREATE INDEX "audit_logs_storeId_idx" ON "audit_logs"("storeId");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'audit_logs_timestamp_idx') THEN
        CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
    END IF;
END $$;

-- AddForeignKey (с проверкой существования)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_roleId_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'store_projects_tuId_fkey') THEN
        ALTER TABLE "store_projects" ADD CONSTRAINT "store_projects_tuId_fkey" FOREIGN KEY ("tuId") REFERENCES "tus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_storeId_fkey') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_userId_fkey') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'audit_logs_storeId_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'audit_logs_userId_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Seed записи настроек LDAP (одна строка-синглтон)
INSERT INTO "ldap_configs" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Право "Синхронизация с LDAP" для роли администратора
UPDATE "roles" SET "permissions" = array_append("permissions", 'ldap_sync')
WHERE "name" = 'Администратор' AND NOT ('ldap_sync' = ANY("permissions"));
