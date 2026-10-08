import { create } from 'zustand';
import { StoreProject, Employee, User, AuditLogEntry, Notification, FilterState, ProjectStatus } from '../types';
import { seedProjects, seedEmployees, seedUsers } from '../data/seed';
import { calculateProjectStatus, getNearestEvent, getOverdueInfo } from '../utils/statusCalculator';
import { differenceInDays, startOfDay } from 'date-fns';

interface AppState {
  // Data
  projects: StoreProject[];
  employees: Employee[];
  users: User[];
  auditLog: AuditLogEntry[];
  notifications: Notification[];
  
  // Auth
  currentUser: User | null;
  
  // Filters
  filters: FilterState;
  
  // UI State
  selectedProjectId: string | null;
  isCardOpen: boolean;
  isAddModalOpen: boolean;
  isImportModalOpen: boolean;
  isEditing: boolean;
  
  // Actions
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
  setEditing: (val: boolean) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  
  importProjects: (projects: Omit<StoreProject, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => void;
  
  getFilteredProjects: () => StoreProject[];
  getDashboardStats: () => {
    total: number;
    closures: number;
    reconstructions: number;
    inProgress: number;
    overdue: number;
    completed: number;
    upcoming7days: number;
  };
  getNotifications: () => Notification[];
  getUpcomingEvents: () => { storeNumber: string; stage: string; date: Date; daysUntil: number }[];
  getOverdueProjects: () => StoreProject[];
}

const defaultFilters: FilterState = {
  search: '',
  month: '',
  workType: '',
  status: '',
  responsibleId: '',
  city: '',
  showOverdue: false,
  showUpcoming: false,
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
  } catch {
    return null;
  }
}

// Load from IndexedDB
async function loadFromStorage(): Promise<{
  projects: StoreProject[];
  employees: Employee[];
  auditLog: AuditLogEntry[];
} | null> {
  try {
    const { openDB } = await import('idb');
    const db = await openDB('store-reconstruction', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('auditLog')) {
          db.createObjectStore('auditLog', { keyPath: 'id' });
        }
      },
    });
    
    const projects = await db.getAll('projects');
    const employees = await db.getAll('employees');
    const auditLog = await db.getAll('auditLog');
    
    if (projects.length > 0) {
      return { projects, employees, auditLog };
    }
    return null;
  } catch {
    return null;
  }
}

async function saveToStorage(key: string, data: any[]) {
  try {
    const { openDB } = await import('idb');
    const db = await openDB('store-reconstruction', 1);
    const tx = db.transaction(key, 'readwrite');
    const store = tx.objectStore(key);
    await store.clear();
    for (const item of data) {
      await store.put(item);
    }
    await tx.done;
  } catch (e) {
    console.error('Save error:', e);
  }
}

export const useStore = create<AppState>((set, get) => {
  // Initialize with seed data
  const initialState = {
    projects: [...seedProjects],
    employees: [...seedEmployees],
    users: [...seedUsers],
    auditLog: [] as AuditLogEntry[],
    notifications: [] as Notification[],
    currentUser: null as User | null,
    filters: { ...defaultFilters },
    selectedProjectId: null,
    isCardOpen: false,
    isAddModalOpen: false,
    isImportModalOpen: false,
    isEditing: false,
  };

  // Try to load from storage
  loadFromStorage().then(stored => {
    if (stored) {
      set({
        projects: stored.projects,
        employees: stored.employees.length > 0 ? stored.employees : [...seedEmployees],
        auditLog: stored.auditLog,
      });
    }
  });

  return {
    ...initialState,

    login: (username: string, password: string) => {
      const user = seedUsers.find(u => u.username === username && u.password === password);
      if (user) {
        set({ currentUser: user });
        return true;
      }
      return false;
    },

    logout: () => {
      set({ currentUser: null });
    },

    setFilters: (filters: Partial<FilterState>) => {
      set(state => ({ filters: { ...state.filters, ...filters } }));
    },

    resetFilters: () => {
      set({ filters: { ...defaultFilters } });
    },

    addProject: (projectData) => {
      const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const project: StoreProject = {
        ...projectData,
        id,
        status: 'Запланирован',
        createdAt: now,
        updatedAt: now,
      };
      project.status = calculateProjectStatus(project);
      
      set(state => {
        const newProjects = [...state.projects, project];
        saveToStorage('projects', newProjects);
        return { projects: newProjects };
      });
    },

    updateProject: (id: string, updates: Partial<StoreProject>) => {
      set(state => {
        const project = state.projects.find(p => p.id === id);
        if (!project) return state;

        // Create audit log entries
        const newLogs: AuditLogEntry[] = [];
        const userName = state.currentUser?.fullName || 'Система';
        const userId = state.currentUser?.id || 'system';
        
        Object.entries(updates).forEach(([key, newValue]) => {
          if (key === 'status' || key === 'updatedAt') return;
          const oldValue = (project as any)[key];
          if (String(oldValue) !== String(newValue)) {
            newLogs.push({
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              storeId: id,
              userId,
              userName,
              timestamp: new Date().toISOString(),
              field: key,
              oldValue: String(oldValue || '—'),
              newValue: String(newValue || '—'),
            });
          }
        });

        const updatedProject = {
          ...project,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        updatedProject.status = calculateProjectStatus(updatedProject);

        const newProjects = state.projects.map(p => p.id === id ? updatedProject : p);
        const newAuditLog = [...state.auditLog, ...newLogs];
        
        saveToStorage('projects', newProjects);
        saveToStorage('auditLog', newAuditLog);
        
        return { projects: newProjects, auditLog: newAuditLog };
      });
    },

    deleteProject: (id: string) => {
      set(state => {
        const newProjects = state.projects.map(p => 
          p.id === id ? { ...p, isDeleted: true, status: 'Удален' as ProjectStatus, updatedAt: new Date().toISOString() } : p
        );
        saveToStorage('projects', newProjects);
        return { projects: newProjects };
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

    openCard: (id: string) => {
      set({ selectedProjectId: id, isCardOpen: true });
    },

    closeCard: () => {
      set({ selectedProjectId: null, isCardOpen: false, isEditing: false });
    },

    openAddModal: () => set({ isAddModalOpen: true }),
    closeAddModal: () => set({ isAddModalOpen: false }),
    openImportModal: () => set({ isImportModalOpen: true }),
    closeImportModal: () => set({ isImportModalOpen: false }),
    setEditing: (val: boolean) => set({ isEditing: val }),

    addEmployee: (employeeData) => {
      const id = `emp-${Date.now()}`;
      set(state => {
        const newEmployees = [...state.employees, { ...employeeData, id }];
        saveToStorage('employees', newEmployees);
        return { employees: newEmployees };
      });
    },

    updateEmployee: (id: string, updates: Partial<Employee>) => {
      set(state => {
        const newEmployees = state.employees.map(e => e.id === id ? { ...e, ...updates } : e);
        saveToStorage('employees', newEmployees);
        return { employees: newEmployees };
      });
    },

    importProjects: (projectsData) => {
      set(state => {
        const newProjects = projectsData.map((pd, idx) => {
          const id = `proj-import-${Date.now()}-${idx}`;
          const now = new Date().toISOString();
          const project: StoreProject = {
            ...pd,
            id,
            status: 'Запланирован',
            createdAt: now,
            updatedAt: now,
          };
          project.status = calculateProjectStatus(project);
          return project;
        });
        const allProjects = [...state.projects, ...newProjects];
        saveToStorage('projects', allProjects);
        return { projects: allProjects };
      });
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

      if (filters.workType) {
        projects = projects.filter(p => p.workType === filters.workType);
      }

      if (filters.status) {
        projects = projects.filter(p => {
          const status = calculateProjectStatus(p);
          return status === filters.status;
        });
      }

      if (filters.responsibleId) {
        projects = projects.filter(p => p.responsibleId === filters.responsibleId);
      }

      if (filters.city) {
        projects = projects.filter(p => p.city === filters.city);
      }

      if (filters.month) {
        const [month, year] = filters.month.split('-');
        projects = projects.filter(p => {
          const dates = [p.closureDate, p.demolitionDate, p.installationDate, p.osvDate, p.techOpenDate];
          return dates.some(d => {
            if (!d) return false;
            const parsed = parseDate(d);
            if (!parsed) return false;
            return (parsed.getMonth() + 1) === parseInt(month) && parsed.getFullYear() === parseInt(year);
          });
        });
      }

      if (filters.showOverdue) {
        projects = projects.filter(p => calculateProjectStatus(p) === 'Просрочено');
      }

      if (filters.showUpcoming) {
        const today = startOfDay(new Date());
        projects = projects.filter(p => {
          const event = getNearestEvent(p);
          return event && event.daysUntil <= 7 && event.daysUntil >= 0;
        });
      }

      // Sort by nearest date
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
      const state = get();
      const projects = state.projects.filter(p => !p.isDeleted);
      const today = startOfDay(new Date());

      const closures = projects.filter(p => p.workType === 'Закрытие').length;
      const reconstructions = projects.filter(p => p.workType === 'Реконструкция').length;
      const completed = projects.filter(p => calculateProjectStatus(p) === 'Завершено').length;
      const overdue = projects.filter(p => calculateProjectStatus(p) === 'Просрочено').length;
      const inProgress = projects.filter(p => {
        const s = calculateProjectStatus(p);
        return s !== 'Завершено' && s !== 'Просрочено' && s !== 'Запланирован';
      }).length;
      
      const upcoming7days = projects.filter(p => {
        const event = getNearestEvent(p);
        return event && event.daysUntil <= 7 && event.daysUntil >= 0;
      }).length;

      return {
        total: projects.length,
        closures,
        reconstructions,
        inProgress,
        overdue,
        completed,
        upcoming7days,
      };
    },

    getNotifications: () => {
      const state = get();
      const projects = state.projects.filter(p => !p.isDeleted);
      const today = startOfDay(new Date());
      const notifications: Notification[] = [];

      projects.forEach(p => {
        const event = getNearestEvent(p);
        const overdue = getOverdueInfo(p);

        if (overdue) {
          notifications.push({
            id: `notif-overdue-${p.id}`,
            storeId: p.id,
            storeNumber: p.storeNumber,
            message: `${overdue.stage} просрочен на ${overdue.days} дн.`,
            type: 'danger',
            date: new Date().toISOString(),
            read: false,
          });
        }

        if (event) {
          if (event.daysUntil === 0) {
            notifications.push({
              id: `notif-today-${p.id}`,
              storeId: p.id,
              storeNumber: p.storeNumber,
              message: `Сегодня: ${event.stage}`,
              type: 'warning',
              date: new Date().toISOString(),
              read: false,
            });
          } else if (event.daysUntil === 1) {
            notifications.push({
              id: `notif-1d-${p.id}`,
              storeId: p.id,
              storeNumber: p.storeNumber,
              message: `Через 1 день: ${event.stage}`,
              type: 'warning',
              date: new Date().toISOString(),
              read: false,
            });
          } else if (event.daysUntil === 3) {
            notifications.push({
              id: `notif-3d-${p.id}`,
              storeId: p.id,
              storeNumber: p.storeNumber,
              message: `Через 3 дня: ${event.stage}`,
              type: 'info',
              date: new Date().toISOString(),
              read: false,
            });
          } else if (event.daysUntil === 7) {
            notifications.push({
              id: `notif-7d-${p.id}`,
              storeId: p.id,
              storeNumber: p.storeNumber,
              message: `Через 7 дней: ${event.stage}`,
              type: 'info',
              date: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      return notifications;
    },

    getUpcomingEvents: () => {
      const state = get();
      const projects = state.projects.filter(p => !p.isDeleted);
      const events: { storeNumber: string; stage: string; date: Date; daysUntil: number }[] = [];

      projects.forEach(p => {
        const event = getNearestEvent(p);
        if (event && event.daysUntil <= 7 && event.daysUntil >= 0) {
          events.push({
            storeNumber: p.storeNumber,
            stage: event.stage,
            date: event.date,
            daysUntil: event.daysUntil,
          });
        }
      });

      events.sort((a, b) => a.daysUntil - b.daysUntil);
      return events;
    },

    getOverdueProjects: () => {
      const state = get();
      return state.projects.filter(p => !p.isDeleted && calculateProjectStatus(p) === 'Просрочено');
    },
  };
});
