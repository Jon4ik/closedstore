import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Shield, Users, Database, Save, Trash2, Settings } from 'lucide-react';

type Tab = 'users' | 'roles' | 'database' | 'audit';

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings, users, roles, auditLog, addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, dbConfig, updateDbConfig, hasPermission } = useStore();
  const [tab, setTab] = useState<Tab>('users');
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: roles[0]?.id || '' });
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });

  if (!isSettingsOpen || !hasPermission('settings')) return null;

  const allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'add_comments', 'manage_users', 'manage_roles', 'manage_tus', 'view_audit', 'settings'];
  const permLabels: Record<string, string> = {
    view: 'Просмотр', create: 'Создание', edit: 'Редактирование', delete: 'Удаление',
    import: 'Импорт', export: 'Экспорт', add_comments: 'Комментарии',
    manage_users: 'Управление пользователями', manage_roles: 'Управление ролями',
    manage_tus: 'Управление ТУ', view_audit: 'Просмотр аудита', settings: 'Настройки',
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) return;
    addUser({ ...newUser, isActive: true });
    setNewUser({ username: '', password: '', fullName: '', role: roles[0]?.id || '' });
  };

  const handleAddRole = () => {
    if (!newRole.name) return;
    addRole({ ...newRole, isSystem: false });
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const togglePermission = (perm: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }));
  };

  const tabs = [
    { id: 'users' as Tab, label: 'Пользователи', icon: Users },
    { id: 'roles' as Tab, label: 'Роли', icon: Shield },
    { id: 'database' as Tab, label: 'База данных', icon: Database },
    { id: 'audit' as Tab, label: 'Аудит', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={closeSettings} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Настройки системы</h2>
          <button onClick={closeSettings} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Добавить пользователя</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="Логин" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="ФИО" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Пароль" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <button onClick={handleAddUser} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Добавить</button>
              </div>
              <div className="space-y-2">
                {users.map(u => {
                  const role = roles.find(r => r.id === u.role);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div>
                        <p className={`text-sm font-medium ${u.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{u.fullName}</p>
                        <p className="text-xs text-gray-500">@{u.username} • {role?.name || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={u.role} onChange={e => updateUser(u.id, { role: e.target.value })} className="text-xs border border-gray-200 rounded px-2 py-1">
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <button onClick={() => updateUser(u.id, { isActive: !u.isActive })} className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Активен' : 'Отключён'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {tab === 'roles' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Добавить роль</p>
                <input type="text" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} placeholder="Название роли" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="text" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} placeholder="Описание" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Разрешения:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map(perm => (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={newRole.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="w-4 h-4 text-blue-600 rounded" />
                        {permLabels[perm]}
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={handleAddRole} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Добавить роль</button>
              </div>
              <div className="space-y-2">
                {roles.map(role => (
                  <div key={role.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      {!role.isSystem && <button onClick={() => deleteRole(role.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(p => <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{permLabels[p] || p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Database Tab */}
          {tab === 'database' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">Настройте подключение к PostgreSQL для персистентного хранения данных. Текущие данные сохраняются в IndexedDB браузера.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Хост</label>
                  <input type="text" value={dbConfig.host} onChange={e => updateDbConfig({ host: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Порт</label>
                  <input type="number" value={dbConfig.port} onChange={e => updateDbConfig({ port: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">База данных</label>
                  <input type="text" value={dbConfig.database} onChange={e => updateDbConfig({ database: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Пользователь</label>
                  <input type="text" value={dbConfig.username} onChange={e => updateDbConfig({ username: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Пароль</label>
                  <input type="password" value={dbConfig.password} onChange={e => updateDbConfig({ password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={dbConfig.ssl} onChange={e => updateDbConfig({ ssl: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">SSL</span>
                  </label>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Save size={16} />Сохранить конфигурацию</button>
            </div>
          )}

          {/* Audit Tab */}
          {tab === 'audit' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">Последние действия в системе ({auditLog.length} записей)</p>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {auditLog.length === 0 ? <p className="text-sm text-gray-400 italic">Нет записей</p> :
                  [...auditLog].reverse().slice(0, 100).map(log => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-gray-50 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                        <span className="text-xs font-medium text-gray-700">{log.userName}</span>
                      </div>
                      <p className="text-gray-700">{log.details}</p>
                      {log.oldValue && log.oldValue !== '—' && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-red-600">{log.oldValue}</span> → <span className="text-green-600">{log.newValue}</span>
                        </p>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
