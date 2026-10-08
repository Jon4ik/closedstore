import { create } from 'zustand';
import { StoreProject, TU, SystemUser, Role, AuditLogEntry, Comment, Notification, FilterState, ProjectStatus, DatabaseConfig } from '../types';
import { seedProjects, seedTUs, seedUsers, seedRoles } from '../data/seed';
import { calculateProjectStatus, getNearestEvent } from '../utils/statusCalculator';
import { startOfDay } from 'date-fns';

interface AppState {
  projects: StoreProject[];
  tus: TU[];
  users: SystemUser[];
  roles: Role[];
  auditLog: AuditLogEntry[];
  comments: Comment[];
  notifications: Notification[];
  currentUser: SystemUser | null;
  filters: FilterState;
  selectedProjectId: string | null;
  isCardOpen: boolean;
  isAddModalOpen: boolean;
  isImportModalOpen: boolean;
  isSettingsOpen: boolean;
  isEditing: boolean;
  dbConfig: DatabaseConfig;

  login: (username: string, password: string) => boolean;
  logout: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  addProject: (project: Omit<StoreProject, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateProject: (id: string, updates: Partial<StoreProject>) => void;
  deleteProject: (id: string) => void;
  restoreProject: (id: string) => void;
  openCard: (id: string) => void;
  closeCard: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setEditing: (val: boolean) => void;
  addTU: (tu: Omit<TU, 'id'>) => void;
  updateTU: (id: string, updates: Partial<TU>) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  importProjects: (projects: Omit<StoreProject, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => void;
  updateDbConfig: (config: Partial<DatabaseConfig>) => void;
  hasPermission: (permission: string) => boolean;
  getFilteredProjects: () => StoreProject[];
  getDashboardStats: () => { total: number; closures: number; reconstructions: number; inProgress: number; overdue: number; completed: number; cancelled: number; upcoming7days: number; };
  getNotifications: () => Notification[];
  getUpcomingEvents: () => { storeNumber: string; stage: string; date: Date; daysUntil: number; projectId: string }[];
  getProjectComments: (storeId: string) => Comment[];
}

const defaultFilters: FilterState = {
  search: '', month: '', workType: '', status: '', tuId: '', city: '', showOverdue: false, showUpcoming: false,
};

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  } catch { return null; }
}

async function saveToStorage(key: string, data: any[]) {
  try {
    const { openDB } = await import('idb');
    const db = await openDB('store-reconstruction', 1);
    const tx = db.transaction(key, 'readwrite');
    const store = tx.objectStore(key);
    await store.clear();
    for (const item of data) { await store.put(item); }
    await tx.done;
  } catch (e) { console.error('Save error:', e); }
}

export const useStore = create<AppState>((set, get) => {
  const initialState = {
    projects: [...seedProjects],
    tus: [...seedTUs],
    users: [...seedUsers],
    roles: [...seedRoles],
    auditLog: [] as AuditLogEntry[],
    comments: [] as Comment[],
    notifications: [] as Notification[],
    currentUser: null as SystemUser | null,
    filters: { ...defaultFilters },
    selectedProjectId: null,
    isCardOpen: false,
    isAddModalOpen: false,
    isImportModalOpen: false,
    isSettingsOpen: false,
    isEditing: false,
    dbConfig: { host: 'localhost', port: 5432, database: 'store_reconstruction', username: 'postgres', password: '', ssl: false },
  };

  // Load from IndexedDB
  import('idb').then(({ openDB }) => {
    openDB('store-reconstruction', 1, {
      upgrade(db) {
        ['projects', 'tus', 'auditLog', 'comments', 'users', 'roles'].forEach(name => {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      },
    }).then(async (db) => {
      const projects = await db.getAll('projects');
      const tus = await db.getAll('tus');
      const auditLog = await db.getAll('auditLog');
      const comments = await db.getAll('comments');
      const users = await db.getAll('users');
      const roles = await db.getAll('roles');
      set({
        projects: projects.length > 0 ? projects : [...seedProjects],
        tus: tus.length > 0 ? tus : [...seedTUs],
        auditLog: auditLog || [],
        comments: comments || [],
        users: users.length > 0 ? users : [...seedUsers],
        roles: roles.length > 0 ? roles : [...seedRoles],
      });
    });
  });

  return {
    ...initialState,

    login: (username: string, password: string) => {
      const user = get().users.find(u => u.username === username && u.password === password && u.isActive);
      if (user) {
        set({ currentUser: user });
        // Audit: login
        set(state => {
          const log: AuditLogEntry = {
            id: `log-${Date.now()}`, storeId: null, userId: user.id, userName: user.fullName,
            timestamp: new Date().toISOString(), action: 'login', field: 'session', oldValue: '', newValue: 'active', details: 'Вход в систему'
          };
          return { auditLog: [...state.auditLog, log] };
        });
        return true;
      }
      return false;
    },

    logout: () => {
      const user = get().currentUser;
      if (user) {
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: null, userId: user.id, userName: user.fullName,
          timestamp: new Date().toISOString(), action: 'logout', field: 'session', oldValue: 'active', newValue: '', details: 'Выход из системы'
        };
        set(state => ({ auditLog: [...state.auditLog, log], currentUser: null }));
      } else {
        set({ currentUser: null });
      }
    },

    setFilters: (filters: Partial<FilterState>) => set(state => ({ filters: { ...state.filters, ...filters } })),
    resetFilters: () => set({ filters: { ...defaultFilters } }),

    addProject: (projectData) => {
      const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const user = get().currentUser;
      const project: StoreProject = { ...projectData, id, status: 'Запланирован', createdAt: now, updatedAt: now };
      project.status = calculateProjectStatus(project);
      set(state => {
        const newProjects = [...state.projects, project];
        saveToStorage('projects', newProjects);
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: id, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: now, action: 'create', field: 'project', oldValue: '', newValue: project.storeNumber, details: `Создан объект №${project.storeNumber}`
        };
        return { projects: newProjects, auditLog: [...state.auditLog, log] };
      });
    },

    updateProject: (id: string, updates: Partial<StoreProject>) => {
      set(state => {
        const project = state.projects.find(p => p.id === id);
        if (!project) return state;
        const user = state.currentUser;
        const newLogs: AuditLogEntry[] = [];
        const now = new Date().toISOString();

        Object.entries(updates).forEach(([key, newValue]) => {
          if (key === 'status' || key === 'updatedAt') return;
          const oldValue = (project as any)[key];
          if (String(oldValue) !== String(newValue)) {
            newLogs.push({
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              storeId: id, userId: user?.id || 'system', userName: user?.fullName || 'Система',
              timestamp: now, action: 'update', field: key,
              oldValue: String(oldValue || '—'), newValue: String(newValue || '—'),
              details: `Изменено поле "${key}"`
            });
          }
        });

        const updatedProject = { ...project, ...updates, updatedAt: now };
        updatedProject.status = calculateProjectStatus(updatedProject);
        const newProjects = state.projects.map(p => p.id === id ? updatedProject : p);
        const newAuditLog = [...state.auditLog, ...newLogs];
        saveToStorage('projects', newProjects);
        saveToStorage('auditLog', newAuditLog);
        return { projects: newProjects, auditLog: newAuditLog };
      });
    },

    deleteProject: (id: string) => {
      const user = get().currentUser;
      set(state => {
        const newProjects = state.projects.map(p =>
          p.id === id ? { ...p, isDeleted: true, status: 'Удален' as ProjectStatus, updatedAt: new Date().toISOString() } : p
        );
        saveToStorage('projects', newProjects);
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: id, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: new Date().toISOString(), action: 'delete', field: 'project', oldValue: 'active', newValue: 'deleted', details: 'Объект удалён (soft delete)'
        };
        return { projects: newProjects, auditLog: [...state.auditLog, log] };
      });
    },

    restoreProject: (id: string) => {
      set(state => {
        const newProjects = state.projects.map(p => {
          if (p.id === id) {
            const restored = { ...p, isDeleted: false, updatedAt: new Date().toISOString() };
            restored.status = calculateProjectStatus(restored);
            return restored;
          }
          return p;
        });
        saveToStorage('projects', newProjects);
        return { projects: newProjects };
      });
    },

    openCard: (id: string) => set({ selectedProjectId: id, isCardOpen: true }),
    closeCard: () => set({ selectedProjectId: null, isCardOpen: false, isEditing: false }),
    openAddModal: () => set({ isAddModalOpen: true }),
    closeAddModal: () => set({ isAddModalOpen: false }),
    openImportModal: () => set({ isImportModalOpen: true }),
    closeImportModal: () => set({ isImportModalOpen: false }),
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    setEditing: (val: boolean) => set({ isEditing: val }),

    addTU: (tuData) => {
      const id = `tu-${Date.now()}`;
      set(state => {
        const newTUs = [...state.tus, { ...tuData, id }];
        saveToStorage('tus', newTUs);
        return { tus: newTUs };
      });
    },

    updateTU: (id: string, updates: Partial<TU>) => {
      set(state => {
        const newTUs = state.tus.map(t => t.id === id ? { ...t, ...updates } : t);
        saveToStorage('tus', newTUs);
        return { tus: newTUs };
      });
    },

    addUser: (userData) => {
      const id = `user-${Date.now()}`;
      const user = get().currentUser;
      set(state => {
        const newUser: SystemUser = { ...userData, id, createdAt: new Date().toISOString() };
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: null, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: new Date().toISOString(), action: 'create_user', field: 'user', oldValue: '', newValue: userData.username, details: `Создан пользователь ${userData.username}`
        };
        return { users: [...state.users, newUser], auditLog: [...state.auditLog, log] };
      });
    },

    updateUser: (id: string, updates: Partial<SystemUser>) => {
      const user = get().currentUser;
      set(state => {
        const newUsers = state.users.map(u => u.id === id ? { ...u, ...updates } : u);
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: null, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: new Date().toISOString(), action: 'update_user', field: 'user', oldValue: '', newValue: id, details: `Обновлён пользователь`
        };
        return { users: newUsers, auditLog: [...state.auditLog, log] };
      });
    },

    deleteUser: (id: string) => {
      set(state => ({ users: state.users.map(u => u.id === id ? { ...u, isActive: false } : u) }));
    },

    addRole: (roleData) => {
      const id = `role-${Date.now()}`;
      set(state => {
        const newRoles = [...state.roles, { ...roleData, id, isSystem: false }];
        saveToStorage('roles', newRoles);
        return { roles: newRoles };
      });
    },

    updateRole: (id: string, updates: Partial<Role>) => {
      set(state => {
        const newRoles = state.roles.map(r => r.id === id ? { ...r, ...updates } : r);
        saveToStorage('roles', newRoles);
        return { roles: newRoles };
      });
    },

    deleteRole: (id: string) => {
      set(state => {
        const newRoles = state.roles.filter(r => r.id !== id);
        saveToStorage('roles', newRoles);
        return { roles: newRoles };
      });
    },

    addComment: (commentData) => {
      const id = `comment-${Date.now()}`;
      const user = get().currentUser;
      set(state => {
        const newComment: Comment = { ...commentData, id, createdAt: new Date().toISOString() };
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: commentData.storeId, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: new Date().toISOString(), action: 'add_comment', field: 'comment', oldValue: '', newValue: commentData.text.slice(0, 50), details: 'Добавлен комментарий'
        };
        const newComments = [...state.comments, newComment];
        return { comments: newComments, auditLog: [...state.auditLog, log] };
      });
    },

    importProjects: (projectsData) => {
      const user = get().currentUser;
      set(state => {
        const newProjects = projectsData.map((pd, idx) => {
          const id = `proj-import-${Date.now()}-${idx}`;
          const now = new Date().toISOString();
          const project: StoreProject = { ...pd, id, status: 'Запланирован', createdAt: now, updatedAt: now };
          project.status = calculateProjectStatus(project);
          return project;
        });
        const allProjects = [...state.projects, ...newProjects];
        saveToStorage('projects', allProjects);
        const log: AuditLogEntry = {
          id: `log-${Date.now()}`, storeId: null, userId: user?.id || 'system', userName: user?.fullName || 'Система',
          timestamp: new Date().toISOString(), action: 'import', field: 'projects', oldValue: '', newValue: String(newProjects.length), details: `Импортировано ${newProjects.length} объектов`
        };
        return { projects: allProjects, auditLog: [...state.auditLog, log] };
      });
    },

    updateDbConfig: (config: Partial<DatabaseConfig>) => {
      set(state => ({ dbConfig: { ...state.dbConfig, ...config } }));
    },

    hasPermission: (permission: string) => {
      const user = get().currentUser;
      if (!user) return false;
      const role = get().roles.find(r => r.id === user.role);
      if (!role) return false;
      return role.permissions.includes(permission);
    },

    getFilteredProjects: () => {
      const state = get();
      let projects = state.projects.filter(p => !p.isDeleted);
      const { filters } = state;

      if (filters.search) {
        const search = filters.search.toLowerCase();
        projects = projects.filter(p =>
          p.storeNumber.toLowerCase().includes(search) ||
          p.address.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search)
        );
      }
      if (filters.workType) projects = projects.filter(p => p.workType === filters.workType);
      if (filters.status) projects = projects.filter(p => calculateProjectStatus(p) === filters.status);
      if (filters.tuId) projects = projects.filter(p => p.tuId === filters.tuId);
      if (filters.city) projects = projects.filter(p => p.city === filters.city);
      if (filters.month) {
        const [month, year] = filters.month.split('-');
        projects = projects.filter(p => {
          const dates = [p.closureDate, p.demolitionDate, p.installationDate, p.techOpenDate];
          return dates.some(d => {
            if (!d) return false;
            const parsed = parseDate(d);
            if (!parsed) return false;
            return (parsed.getMonth() + 1) === parseInt(month) && parsed.getFullYear() === parseInt(year);
          });
        });
      }
      if (filters.showOverdue) projects = projects.filter(p => calculateProjectStatus(p) === 'Просрочено');
      if (filters.showUpcoming) {
        projects = projects.filter(p => {
          const event = getNearestEvent(p);
          return event && event.daysUntil <= 7 && event.daysUntil >= 0;
        });
      }

      projects.sort((a, b) => {
        const eventA = getNearestEvent(a);
        const eventB = getNearestEvent(b);
        if (!eventA && !eventB) return 0;
        if (!eventA) return 1;
        if (!eventB) return -1;
        return eventA.date.getTime() - eventB.date.getTime();
      });
      return projects;
    },

    getDashboardStats: () => {
      const projects = get().projects.filter(p => !p.isDeleted);
      return {
        total: projects.length,
        closures: projects.filter(p => p.workType === 'Закрытие').length,
        reconstructions: projects.filter(p => p.workType === 'Реконструкция').length,
        inProgress: projects.filter(p => { const s = calculateProjectStatus(p); return s !== 'Завершено' && s !== 'Просрочено' && s !== 'Запланирован' && s !== 'Отменено'; }).length,
        overdue: projects.filter(p => calculateProjectStatus(p) === 'Просрочено').length,
        completed: projects.filter(p => calculateProjectStatus(p) === 'Завершено').length,
        cancelled: projects.filter(p => calculateProjectStatus(p) === 'Отменено').length,
        upcoming7days: projects.filter(p => { const e = getNearestEvent(p); return e && e.daysUntil <= 7 && e.daysUntil >= 0; }).length,
      };
    },

    getNotifications: () => {
      const projects = get().projects.filter(p => !p.isDeleted);
      const notifications: Notification[] = [];
      projects.forEach(p => {
        const event = getNearestEvent(p);
        if (calculateProjectStatus(p) === 'Просрочено') {
          notifications.push({ id: `notif-overdue-${p.id}`, storeId: p.id, storeNumber: p.storeNumber, message: 'Объект просрочен', type: 'danger', date: new Date().toISOString(), read: false });
        }
        if (event) {
          if (event.daysUntil === 0) notifications.push({ id: `notif-today-${p.id}`, storeId: p.id, storeNumber: p.storeNumber, message: `Сегодня: ${event.name}`, type: 'warning', date: new Date().toISOString(), read: false });
          else if (event.daysUntil === 1) notifications.push({ id: `notif-1d-${p.id}`, storeId: p.id, storeNumber: p.storeNumber, message: `Завтра: ${event.name}`, type: 'warning', date: new Date().toISOString(), read: false });
          else if (event.daysUntil === 3) notifications.push({ id: `notif-3d-${p.id}`, storeId: p.id, storeNumber: p.storeNumber, message: `Через 3 дня: ${event.name}`, type: 'info', date: new Date().toISOString(), read: false });
          else if (event.daysUntil === 7) notifications.push({ id: `notif-7d-${p.id}`, storeId: p.id, storeNumber: p.storeNumber, message: `Через 7 дней: ${event.name}`, type: 'info', date: new Date().toISOString(), read: false });
        }
      });
      return notifications;
    },

    getUpcomingEvents: () => {
      const projects = get().projects.filter(p => !p.isDeleted);
      const events: { storeNumber: string; stage: string; date: Date; daysUntil: number; projectId: string }[] = [];
      projects.forEach(p => {
        const event = getNearestEvent(p);
        if (event && event.daysUntil <= 7 && event.daysUntil >= 0) {
          events.push({ storeNumber: p.storeNumber, stage: event.name, date: event.date, daysUntil: event.daysUntil, projectId: p.id });
        }
      });
      events.sort((a, b) => a.daysUntil - b.daysUntil);
      return events;
    },

    getProjectComments: (storeId: string) => {
      return get().comments.filter(c => c.storeId === storeId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  };
});
