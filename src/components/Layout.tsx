import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, Table2, CalendarDays, Bell, LogOut, 
  Menu, X, Upload, User, Shield, ChevronDown, Users
} from 'lucide-react';
import EmployeesModal from './EmployeesModal';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentUser, logout, getNotifications } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const notifications = getNotifications();

  const navItems = [
    { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard },
    { id: 'table', label: 'Таблица объектов', icon: Table2 },
    { id: 'calendar', label: 'Календарь', icon: CalendarDays },
  ];

  const roleLabels = {
    admin: 'Администратор',
    manager: 'Менеджер',
    user: 'Пользователь',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-700">РиЗ</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              <EmployeesModal />
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.fullName}</p>
              <p className="text-xs text-gray-500">{roleLabels[currentUser?.role || 'user']}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              Реконструкция — Закрытие
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-sm">Уведомления</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">Нет уведомлений</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.slice(0, 10).map(n => (
                        <div key={n.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => { useStore.getState().openCard(n.storeId); setShowNotif(false); }}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Магазин №{n.storeNumber}</p>
                              <p className="text-xs text-gray-600">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
