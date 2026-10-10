import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, AlertTriangle } from 'lucide-react';
import { formatDateDisplay } from '../utils/format';

export default function AuditPage() {
  const { auditLog, clearAuditLog, hasPermission, projects } = useStore();
  const [clearConfirm, setClearConfirm] = useState(false);
  const [filter, setFilter] = useState({ action: '', search: '' });

  if (!hasPermission('view_audit')) {
    return <div className="text-center py-12 text-gray-500">Нет доступа к этой странице</div>;
  }

  const filteredLog = auditLog.filter(log => {
    if (filter.action && log.action !== filter.action) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return log.details.toLowerCase().includes(search) || log.userName.toLowerCase().includes(search);
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const actionLabels: Record<string, string> = {
    login: 'Вход', logout: 'Выход', create: 'Создание', update: 'Обновление',
    delete: 'Удаление', import: 'Импорт', create_user: 'Создание пользователя',
    update_user: 'Обновление пользователя', delete_user: 'Удаление пользователя',
    create_tu: 'Создание ТУ', update_tu: 'Обновление ТУ', delete_tu: 'Удаление ТУ',
    create_role: 'Создание роли', update_role: 'Обновление роли', delete_role: 'Удаление роли',
    add_comment: 'Комментарий',
  };

  const actionColors: Record<string, string> = {
    login: 'bg-green-100 text-green-700', logout: 'bg-gray-100 text-gray-700',
    create: 'bg-blue-100 text-blue-700', update: 'bg-yellow-100 text-yellow-700',
    delete: 'bg-red-100 text-red-700', import: 'bg-purple-100 text-purple-700',
    create_user: 'bg-blue-100 text-blue-700', update_user: 'bg-yellow-100 text-yellow-700',
    delete_user: 'bg-red-100 text-red-700', create_tu: 'bg-blue-100 text-blue-700',
    update_tu: 'bg-yellow-100 text-yellow-700', delete_tu: 'bg-red-100 text-red-700',
    create_role: 'bg-blue-100 text-blue-700', update_role: 'bg-yellow-100 text-yellow-700',
    delete_role: 'bg-red-100 text-red-700', add_comment: 'bg-indigo-100 text-indigo-700',
  };

  const uniqueActions = [...new Set(auditLog.map(l => l.action))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аудит действий</h1>
          <p className="text-sm text-gray-500 mt-1">История всех действий в системе ({auditLog.length} записей)</p>
        </div>
        {clearConfirm ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm text-red-700">Очистить весь журнал?</span>
            <button onClick={async () => { 
              try {
                await clearAuditLog(); 
                setClearConfirm(false);
              } catch (error) {
                console.error('Failed to clear audit log:', error);
                alert('Ошибка при очистке журнала');
              }
            }} className="text-xs bg-red-600 text-white px-3 py-1 rounded">Да, очистить</button>
            <button onClick={() => setClearConfirm(false)} className="text-xs border border-gray-200 px-3 py-1 rounded">Отмена</button>
          </div>
        ) : (
          <button onClick={() => setClearConfirm(true)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
            <Trash2 size={16} /> Очистить журнал
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Тип действия</label>
            <select value={filter.action} onChange={e => setFilter({ ...filter, action: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Все действия</option>
              {uniqueActions.map(a => <option key={a} value={a}>{actionLabels[a] || a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Поиск</label>
            <input type="text" value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} placeholder="По пользователю или описанию..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Дата</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Объект</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Пользователь</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Действие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Описание</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Изменения</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Нет записей</td></tr>
              ) : filteredLog.map(log => {
                const project = log.storeId ? projects.find(p => p.id === log.storeId) : null;
                const timestamp = new Date(log.timestamp);
                const dateStr = `${String(timestamp.getDate()).padStart(2, '0')}.${String(timestamp.getMonth() + 1).padStart(2, '0')}.${timestamp.getFullYear()}`;
                const timeStr = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;
                
                return (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                      <div>{dateStr}</div>
                      <div className="text-gray-400">{timeStr}</div>
                    </td>
                    <td className="px-4 py-3">
                      {log.storeId ? (
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">ID: {log.storeId.substring(0, 8)}...</div>
                          {project && (
                            <>
                              <div className="text-gray-700">№{project.storeNumber}</div>
                              <div className="text-gray-500 truncate max-w-[150px]" title={project.address}>{project.address}</div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-xs">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{log.details}</td>
                    <td className="px-4 py-3">
                      {log.oldValue && log.oldValue !== '—' && log.oldValue !== '' ? (
                        <div className="text-xs">
                          <span className="text-red-600 line-through">{log.oldValue}</span>
                          {' → '}
                          <span className="text-green-600">{log.newValue}</span>
                        </div>
                      ) : log.newValue ? (
                        <span className="text-xs text-green-600">{log.newValue}</span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
