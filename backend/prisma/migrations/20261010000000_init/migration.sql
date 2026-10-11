-- Baseline migration is intentionally idempotent so it can initialize an empty database
-- or safely establish Prisma's baseline on installations where tables already exist.
CREATE TABLE IF NOT EXISTS "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "permissions" TEXT[] NOT NULL,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tus" (
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

CREATE TABLE IF NOT EXISTS "store_projects" (
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT NOT NULL,
  CONSTRAINT "store_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "storeId" TEXT,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "oldValue" TEXT NOT NULL DEFAULT '',
  "newValue" TEXT NOT NULL DEFAULT '',
  "details" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE INDEX IF NOT EXISTS "comments_storeId_idx" ON "comments"("storeId");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_storeId_idx" ON "audit_logs"("storeId");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_roleId_fkey') THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_projects_tuId_fkey') THEN
    ALTER TABLE "store_projects" ADD CONSTRAINT "store_projects_tuId_fkey" FOREIGN KEY ("tuId") REFERENCES "tus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_storeId_fkey') THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_userId_fkey') THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_storeId_fkey') THEN
    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_userId_fkey') THEN
    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
