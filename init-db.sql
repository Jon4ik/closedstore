-- Скрипт инициализации базы данных для системы "Реконструкция — Закрытие"
-- Используйте этот скрипт для прямой инициализации PostgreSQL без Docker

-- Создание таблицы ролей
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "roleId" VARCHAR(255) NOT NULL REFERENCES roles(id),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ТУ (территориальных управляющих)
CREATE TABLE IF NOT EXISTS tus (
    id VARCHAR(255) PRIMARY KEY,
    "fullName" VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL DEFAULT 'Территориальный управляющий',
    phone VARCHAR(50),
    email VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы объектов (магазинов)
CREATE TABLE IF NOT EXISTS store_projects (
    id VARCHAR(255) PRIMARY KEY,
    "storeNumber" VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    "workType" VARCHAR(50) NOT NULL CHECK ("workType" IN ('Закрытие', 'Реконструкция', 'Открытие')),
    "closureDate" TIMESTAMP,
    "demolitionDate" TIMESTAMP,
    "installationDate" TIMESTAMP,
    "techOpenDate" TIMESTAMP,
    "tuId" VARCHAR(255) NOT NULL REFERENCES tus(id),
    "rowColor" VARCHAR(50) DEFAULT '',
    comment TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Запланирован',
    "manualStatus" VARCHAR(50),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(255) NOT NULL
);

-- Создание таблицы комментариев
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY,
    "storeId" VARCHAR(255) NOT NULL REFERENCES store_projects(id),
    "userId" VARCHAR(255) NOT NULL REFERENCES users(id),
    "userName" VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы аудита
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    "storeId" VARCHAR(255) REFERENCES store_projects(id),
    "userId" VARCHAR(255) NOT NULL REFERENCES users(id),
    "userName" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    field VARCHAR(255) NOT NULL,
    "oldValue" TEXT DEFAULT '',
    "newValue" TEXT DEFAULT '',
    details TEXT DEFAULT ''
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_comments_storeid ON comments("storeId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_userid ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_storeid ON audit_logs("storeId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs("timestamp");
CREATE INDEX IF NOT EXISTS idx_store_projects_city ON store_projects(city);
CREATE INDEX IF NOT EXISTS idx_store_projects_status ON store_projects(status);
CREATE INDEX IF NOT EXISTS idx_store_projects_worktype ON store_projects("workType");

-- Вставка начальных ролей
INSERT INTO roles (id, name, description, permissions, "isSystem") VALUES
('role-admin', 'Администратор', 'Полный доступ ко всем функциям системы', 
 ARRAY['view', 'edit', 'view_closures', 'create_closures', 'edit_closures', 'delete_closures', 
       'view_openings', 'create_openings', 'edit_openings', 'delete_openings', 
       'view_calendar', 'view_dashboard', 'import', 'export', 
       'view_comments', 'add_comments', 'delete_comments', 
       'view_users', 'manage_users', 'view_roles', 'manage_roles', 
       'view_tus', 'manage_tus', 'view_audit', 'clear_audit', 'settings'], true),
('role-manager', 'Менеджер', 'Управление объектами и импорт/экспорт',
 ARRAY['view', 'edit', 'view_closures', 'create_closures', 'edit_closures', 
       'view_openings', 'create_openings', 'edit_openings', 
       'view_calendar', 'view_dashboard', 'import', 'export', 
       'view_comments', 'add_comments', 'view_tus'], true),
('role-viewer', 'Наблюдатель', 'Только просмотр данных',
 ARRAY['view', 'view_closures', 'view_openings', 'view_calendar', 'view_dashboard', 
       'view_comments', 'view_tus'], true)
ON CONFLICT (id) DO NOTHING;

-- Вставка начальных пользователей
-- Пароли захешированы с помощью bcrypt (admin123, manager123, viewer123)
INSERT INTO users (id, username, password, "fullName", "roleId") VALUES
('user-admin', 'admin', '$2b$10$rKvZJ8qXqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Администратор Системы', 'role-admin'),
('user-manager', 'manager', '$2b$10$mKvZJ8qXqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Иванов И.И.', 'role-manager'),
('user-viewer', 'viewer', '$2b$10$vKvZJ8qXqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Петров П.П.', 'role-viewer')
ON CONFLICT (id) DO NOTHING;

-- Вставка начальных ТУ
INSERT INTO tus (id, "fullName", position, phone, email) VALUES
('tu-1', 'Зотов Денис', 'Территориальный управляющий', '+7 (999) 123-45-67', 'zotov@company.ru'),
('tu-2', 'Дрямова Валентина', 'Территориальный управляющий', '+7 (999) 234-56-78', 'dryamova@company.ru'),
('tu-3', 'Беляева Анна', 'Территориальный управляющий', '+7 (999) 345-67-89', 'belyaeva@company.ru'),
('tu-4', 'Королихина Ольга', 'Территориальный управляющий', '+7 (999) 456-78-90', 'korolikhina@company.ru'),
('tu-5', 'Батькова Виктория', 'Территориальный управляющий', '+7 (999) 567-89-01', 'batkova@company.ru'),
('tu-6', 'Корепина Светлана', 'Территориальный управляющий', '+7 (999) 678-90-12', 'korepina@company.ru'),
('tu-7', 'Денисова Елена', 'Территориальный управляющий', '+7 (999) 789-01-23', 'denisova@company.ru'),
('tu-8', 'Синкевич Екатерина', 'Территориальный управляющий', '+7 (999) 890-12-34', 'sinkevich@company.ru'),
('tu-9', 'Кононовалова Светлана', 'Территориальный управляющий', '+7 (999) 901-23-45', 'kononovalova@company.ru'),
('tu-10', 'Дьякова Елизавета', 'Территориальный управляющий', '+7 (999) 012-34-56', 'dyakova@company.ru'),
('tu-11', 'Романюк Ксения', 'Территориальный управляющий', '+7 (999) 111-22-33', 'romanyuk@company.ru'),
('tu-12', 'Хайруллина Олеся', 'Территориальный управляющий', '+7 (999) 222-33-44', 'khairullina@company.ru')
ON CONFLICT (id) DO NOTHING;

-- Сообщение об успешном выполнении
DO $$
BEGIN
    RAISE NOTICE '✅ База данных успешно инициализирована!';
    RAISE NOTICE '📊 Созданы таблицы: roles, users, tus, store_projects, comments, audit_logs';
    RAISE NOTICE '👥 Созданы роли: Администратор, Менеджер, Наблюдатель';
    RAISE NOTICE '👤 Созданы пользователи: admin, manager, viewer';
    RAISE NOTICE '🏢 Созданы ТУ: 12 территориальных управляющих';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ВНИМАНИЕ: Пароли пользователей в этом скрипте являются заглушками!';
    RAISE NOTICE 'Для генерации правильных bcrypt хешей используйте Prisma seed:';
    RAISE NOTICE '  docker compose exec backend npx prisma db seed';
END $$;
