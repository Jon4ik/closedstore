import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Shield, Users, Database, Save, Trash2, Settings, Edit2, Check, Phone, Mail, Eye, EyeOff } from 'lucide-react';

type Tab = 'users' | 'roles' | 'tus' | 'database' | 'audit';

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings, users, roles, tus, auditLog, addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, addTU, updateTU, dbConfig, updateDbConfig, hasPermission } = useStore();
  const [tab, setTab] = useState<Tab>('users');
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: roles[0]?.id || '' });
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  const [newTU, setNewTU] = useState({ fullName: '', position: 'Технический управляющий', phone: '', email: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingTUID, setEditingTUID] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<any>(null);
  const [editRoleData, setEditRoleData] = useState<any>(null);
  const [editTUData, setEditTUData] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [dbSaved, setDbSaved] = useState(false);

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

  const handleAddTU = () => {
    if (!newTU.fullName) return;
    addTU({ ...newTU, isActive: true });
    setNewTU({ fullName: '', position: 'Технический управляющий', phone: '', email: '' });
  };

  const startEditUser = (user: any) => {
    setEditingUserId(user.id);
    setEditUserData({ username: user.username, fullName: user.fullName, role: user.role, isActive: user.isActive });
  };

  const saveEditUser = () => {
    if (editingUserId && editUserData) {
      updateUser(editingUserId, editUserData);
      setEditingUserId(null);
      setEditUserData(null);
    }
  };

  const startEditRole = (role: any) => {
    setEditingRoleId(role.id);
    setEditRoleData({ name: role.name, description: role.description, permissions: [...role.permissions] });
  };

  const saveEditRole = () => {
    if (editingRoleId && editRoleData) {
      updateRole(editingRoleId, editRoleData);
      setEditingRoleId(null);
      setEditRoleData(null);
    }
  };

  const startEditTU = (tu: any) => {
    setEditingTUID(tu.id);
    setEditTUData({ fullName: tu.fullName, position: tu.position, phone: tu.phone, email: tu.email, isActive: tu.isActive });
  };

  const saveEditTU = () => {
    if (editingTUID && editTUData) {
      updateTU(editingTUID, editTUData);
      setEditingTUID(null);
      setEditTUData(null);
    }
  };

  const togglePermission = (perm: string, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
      }));
    } else if (editRoleData) {
      setEditRoleData({
        ...editRoleData,
        permissions: editRoleData.permissions.includes(perm)
          ? editRoleData.permissions.filter((p: string) => p !== perm)
          : [...editRoleData.permissions, perm]
      });
    }
  };

  const handleSaveDb = () => {
    setDbSaved(true);
    setTimeout(() => setDbSaved(false), 3000);
  };

  const tabs = [
    { id: 'users' as Tab, label: 'Пользователи', icon: Users },
    { id: 'roles' as Tab, label: 'Роли', icon: Shield },
    { id: 'tus' as Tab, label: 'Справочник ТУ', icon: Users },
    { id: 'database' as Tab, label: 'База данных', icon: Database },
    { id: 'audit' as Tab, label: 'Аудит', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={closeSettings} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Настройки системы</h2>
          <button onClick={closeSettings} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="flex border-b border-gray-100 px-6 flex-shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
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
                  const isEditing = editingUserId === u.id;
                  return (
                    <div key={u.id} className="p-3 rounded-lg border border-gray-100">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Логин</label>
                              <input type="text" value={editUserData.username} onChange={e => setEditUserData({ ...editUserData, username: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">ФИО</label>
                              <input type="text" value={editUserData.fullName} onChange={e => setEditUserData({ ...editUserData, fullName: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Роль</label>
                              <select value={editUserData.role} onChange={e => setEditUserData({ ...editUserData, role: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm">
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Статус</label>
                              <select value={editUserData.isActive ? 'active' : 'inactive'} onChange={e => setEditUserData({ ...editUserData, isActive: e.target.value === 'active' })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm">
                                <option value="active">Активен</option>
                                <option value="inactive">Отключён</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={saveEditUser} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"><Check size={14} />Сохранить</button>
                            <button onClick={() => { setEditingUserId(null); setEditUserData(null); }} className="px-3 py-1.5 border border-gray-200 rounded text-sm hover:bg-gray-50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${u.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{u.fullName}</p>
                            <p className="text-xs text-gray-500">@{u.username} • {role?.name || '—'} • {u.isActive ? 'Активен' : 'Отключён'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEditUser(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                            {u.id !== 'user-1' && <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                          </div>
                        </div>
                      )}
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
                        <input type="checkbox" checked={newRole.permissions.includes(perm)} onChange={() => togglePermission(perm, 'new')} className="w-4 h-4 text-blue-600 rounded" />
                        {permLabels[perm]}
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={handleAddRole} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Добавить роль</button>
              </div>
              <div className="space-y-2">
                {roles.map(role => {
                  const isEditing = editingRoleId === role.id;
                  return (
                    <div key={role.id} className="p-3 rounded-lg border border-gray-100">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Название</label>
                              <input type="text" value={editRoleData.name} onChange={e => setEditRoleData({ ...editRoleData, name: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Описание</label>
                              <input type="text" value={editRoleData.description} onChange={e => setEditRoleData({ ...editRoleData, description: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Разрешения:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {allPermissions.map(perm => (
                                <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={editRoleData.permissions.includes(perm)} onChange={() => togglePermission(perm, 'edit')} className="w-4 h-4 text-blue-600 rounded" />
                                  {permLabels[perm]}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={saveEditRole} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"><Check size={14} />Сохранить</button>
                            <button onClick={() => { setEditingRoleId(null); setEditRoleData(null); }} className="px-3 py-1.5 border border-gray-200 rounded text-sm hover:bg-gray-50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{role.name}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => startEditRole(role)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                              {!role.isSystem && <button onClick={() => deleteRole(role.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map(p => <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{permLabels[p] || p}</span>)}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TUs Tab */}
          {tab === 'tus' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Добавить ТУ</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={newTU.fullName} onChange={e => setNewTU({ ...newTU, fullName: e.target.value })} placeholder="ФИО" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" value={newTU.position} onChange={e => setNewTU({ ...newTU, position: e.target.value })} placeholder="Должность" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" value={newTU.phone} onChange={e => setNewTU({ ...newTU, phone: e.target.value })} placeholder="Телефон" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" value={newTU.email} onChange={e => setNewTU({ ...newTU, email: e.target.value })} placeholder="Email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <button onClick={handleAddTU} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Добавить</button>
              </div>
              <div className="space-y-2">
                {tus.map(tu => {
                  const isEditing = editingTUID === tu.id;
                  return (
                    <div key={tu.id} className="p-3 rounded-lg border border-gray-100">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500">ФИО</label>
                              <input type="text" value={editTUData.fullName} onChange={e => setEditTUData({ ...editTUData, fullName: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Должность</label>
                              <input type="text" value={editTUData.position} onChange={e => setEditTUData({ ...editTUData, position: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Телефон</label>
                              <input type="text" value={editTUData.phone} onChange={e => setEditTUData({ ...editTUData, phone: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Email</label>
                              <input type="text" value={editTUData.email} onChange={e => setEditTUData({ ...editTUData, email: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Статус</label>
                              <select value={editTUData.isActive ? 'active' : 'inactive'} onChange={e => setEditTUData({ ...editTUData, isActive: e.target.value === 'active' })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm">
                                <option value="active">Активен</option>
                                <option value="inactive">Неактивен</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={saveEditTU} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"><Check size={14} />Сохранить</button>
                            <button onClick={() => { setEditingTUID(null); setEditTUData(null); }} className="px-3 py-1.5 border border-gray-200 rounded text-sm hover:bg-gray-50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${tu.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{tu.fullName}</p>
                            <p className="text-xs text-gray-500">{tu.position}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {tu.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} />{tu.phone}</span>}
                              {tu.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} />{tu.email}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEditTU(tu)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Database Tab */}
          {tab === 'database' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">Настройте подключение к PostgreSQL. После сохранения конфигурации данные будут синхронизироваться с сервером БД.</p>
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
              <button onClick={handleSaveDb} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Save size={16} />{dbSaved ? 'Сохранено!' : 'Сохранить конфигурацию'}
              </button>
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
