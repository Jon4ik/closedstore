import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Table2, CalendarDays, LogOut, Menu, X, User, Users, Shield, UserCheck, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentUser, logout, hasPermission, roles } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const toggleSidebarCollapsed = () => setSidebarCollapsed(current => { const next = !current; localStorage.setItem('sidebarCollapsed', String(next)); return next; });

  const mainNavItems = [
    { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard, permission: 'view_dashboard' },
    { id: 'table', label: 'Таблица объектов', icon: Table2, permission: 'view_closures' },
    { id: 'calendar', label: 'Календарь', icon: CalendarDays, permission: 'view_calendar' },
  ];

  const adminNavItems = [
    { id: 'users', label: 'Пользователи', icon: Users, permission: 'manage_users' },
    { id: 'roles', label: 'Роли', icon: Shield, permission: 'manage_roles' },
    { id: 'tus', label: 'Справочник ТУ', icon: UserCheck, permission: 'manage_tus' },
    { id: 'audit', label: 'Аудит', icon: FileText, permission: 'view_audit' },
  ];

  const currentRole = currentUser && roles.length > 0 ? roles.find(r => r.id === currentUser.role) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} bg-white border-r border-gray-200 transform transition-all duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className={`text-lg font-bold text-blue-700 ${sidebarCollapsed ? "lg:hidden" : ""}`}>РиЗ</h1>
          <div className="flex items-center gap-2"><button onClick={toggleSidebarCollapsed} className="hidden lg:block text-gray-500 hover:text-blue-600" title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}>{sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button><button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={20} /></button></div>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {mainNavItems.filter(item => hasPermission(item.permission)).map(item => (
            <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <item.icon size={18} /><span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
            </button>
          ))}
          
          {adminNavItems.some(item => hasPermission(item.permission)) && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-2 ${sidebarCollapsed ? "lg:hidden" : ""}`}>Администрирование</p>
              </div>
              {adminNavItems.filter(item => hasPermission(item.permission)).map(item => (
                <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon size={18} /><span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className={`flex items-center gap-3 mb-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.fullName}</p>
              <p className="text-xs text-gray-500">{currentRole?.name || '—'}</p>
            </div>
          </div>
          <button onClick={logout} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium ${sidebarCollapsed ? "lg:justify-center lg:px-1" : ""}`}>
            <LogOut size={16} /><span className={sidebarCollapsed ? 'lg:hidden' : ''}>Выйти из системы</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu size={24} /></button><button onClick={toggleSidebarCollapsed} className="hidden lg:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600" title={sidebarCollapsed ? "Развернуть боковое меню" : "Свернуть боковое меню"}>{sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}<span>{sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}</span></button>
          </div>
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User size={18} />
            <span className="hidden sm:inline">Профиль</span>
          </button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
