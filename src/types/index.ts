export type WorkType = 'Закрытие' | 'Реконструкция';

export type StageStatus = 'completed' | 'current' | 'overdue' | 'planned' | 'not_started';

export type ProjectStatus = 
  | 'Запланирован'
  | 'Закрыт для покупателей'
  | 'Демонтаж'
  | 'Монтаж'
  | 'ОСВ магазина'
  | 'Техническое открытие'
  | 'Завершено'
  | 'Просрочено'
  | 'Удален';

export interface StoreProject {
  id: string;
  storeNumber: string;
  address: string;
  city: string;
  workType: WorkType;
  closureDate: string | null;
  demolitionDate: string | null;
  installationDate: string | null;
  osvDate: string | null;
  techOpenDate: string | null;
  responsibleId: string;
  comment: string;
  status: ProjectStatus;
  manualStatus: ProjectStatus | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  isActive: boolean;
}

export interface AuditLogEntry {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Notification {
  id: string;
  storeId: string;
  storeNumber: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  date: string;
  read: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
}

export interface StageInfo {
  name: string;
  date: string | null;
  status: StageStatus;
  isOverdue: boolean;
  daysUntil: number | null;
  daysOverdue: number | null;
}

export interface FilterState {
  search: string;
  month: string;
  workType: WorkType | '';
  status: ProjectStatus | '';
  responsibleId: string;
  city: string;
  showOverdue: boolean;
  showUpcoming: boolean;
}
