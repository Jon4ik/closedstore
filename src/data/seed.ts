import { StoreProject, TU, SystemUser, Role } from '../types';

// Начальные данные больше не используются - все данные загружаются из PostgreSQL через API
export const seedTUs: TU[] = [];
export const seedProjects: StoreProject[] = [];

// Системные роли (создаются при инициализации БД)
export const seedRoles: Role[] = [
  { 
    id: 'role-admin', 
    name: 'Администратор', 
    description: 'Полный доступ ко всем функциям системы',
    permissions: ['view', 'edit', 'view_closures', 'create_closures', 'edit_closures', 'delete_closures', 'view_openings', 'create_openings', 'edit_openings', 'delete_openings', 'view_calendar', 'view_dashboard', 'import', 'export', 'view_comments', 'add_comments', 'delete_comments', 'view_users', 'manage_users', 'view_roles', 'manage_roles', 'view_tus', 'manage_tus', 'view_audit', 'clear_audit', 'settings'],
    isSystem: true 
  },
  { 
    id: 'role-manager', 
    name: 'Менеджер', 
    description: 'Управление объектами и импорт/экспорт',
    permissions: ['view', 'edit', 'view_closures', 'create_closures', 'edit_closures', 'view_openings', 'create_openings', 'edit_openings', 'view_calendar', 'view_dashboard', 'import', 'export', 'view_comments', 'add_comments', 'view_tus'],
    isSystem: true 
  },
  { 
    id: 'role-viewer', 
    name: 'Наблюдатель', 
    description: 'Только просмотр данных',
    permissions: ['view', 'view_closures', 'view_openings', 'view_calendar', 'view_dashboard', 'view_comments', 'view_tus'],
    isSystem: true 
  },
];

// Системные пользователи (создаются при инициализации БД)
export const seedUsers: SystemUser[] = [
  { id: 'user-1', username: 'admin', password: 'admin123', fullName: 'Администратор Системы', role: 'role-admin', isActive: true, createdAt: new Date().toISOString() },
  { id: 'user-2', username: 'manager', password: 'manager123', fullName: 'Иванов И.И.', role: 'role-manager', isActive: true, createdAt: new Date().toISOString() },
  { id: 'user-3', username: 'viewer', password: 'viewer123', fullName: 'Петров П.П.', role: 'role-viewer', isActive: true, createdAt: new Date().toISOString() },
];
