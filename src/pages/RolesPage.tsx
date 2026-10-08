import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Shield, Check } from 'lucide-react';

export default function RolesPage() {
  const { roles, users, addRole, updateRole, deleteRole, hasPermission } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[], isSystem: false });
  const [editData, setEditData] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!hasPermission('manage_roles')) {
    return <div className="text-center py-12 text-gray-500">Нет доступа к этой странице</div>;
  }

  const allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'add_comments', 'manage_users', 'manage_roles', 'manage_tus', 'view_audit', 'settings'];
  const permLabels: Record<string, string> = {
    view: 'Просмотр', create: 'Создание', edit: 'Редактирование', delete: 'Удаление',
    import: 'Импорт', export: 'Экспорт', add_comments: 'Комментарии',
    manage_users: 'Управление пользователями', manage_roles: 'Управление ролями',
    manage_tus: 'Управление ТУ', view_audit: 'Просмотр аудита', settings: 'Настройки',
  };

  const handleAdd = () => {
    if (!newRole.name) return;
    addRole(newRole);
    setNewRole({ name: '', description: '', permissions: [], isSystem: false });
    setShowAddForm(false);
  };

  const startEdit = (role: any) => {
    setEditingId(role.id);
    setEditData({ name: role.name, description: role.description, permissions: [...role.permissions] });
  };

  const saveEdit = () => {
    if (editingId && editData) {
      updateRole(editingId, editData);
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleDelete = (id: string) => {
    const success = deleteRole(id);
    if (!success) alert('Нельзя удалить роль, которая используется пользователями');
    setDeleteConfirm(null);
  };

  const togglePermission = (perm: string, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewRole(prev => ({ ...prev, permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm] }));
    } else if (editData) {
      setEditData({ ...editData, permissions: editData.permissions.includes(perm) ? editData.permissions.filter((p: string) => p !== perm) : [...editData.permissions, perm] });
    }
  };

  const getUserCount = (roleId: string) => users.filter(u => u.role === roleId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Роли и права доступа</h1>
          <p className="text-sm text-gray-500 mt-1">Настройка ролей и разрешений для пользователей</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Добавить роль
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Новая роль</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Название *</label>
              <input type="text" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Менеджер" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Описание</label>
              <input type="text" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">Разрешения:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allPermissions.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={newRole.permissions.includes(perm)} onChange={() => togglePermission(perm, 'new')} className="w-4 h-4 text-blue-600 rounded" />
                  {permLabels[perm]}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Создать</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Отмена</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {roles.map(role => {
          const isEditing = editingId === role.id;
          const userCount = getUserCount(role.id);
          return (
            <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Название</label>
                      <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Описание</label>
                      <input type="text" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Разрешения:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allPermissions.map(perm => (
                        <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-gray-50">
                          <input type="checkbox" checked={editData.permissions.includes(perm)} onChange={() => togglePermission(perm, 'edit')} className="w-4 h-4 text-blue-600 rounded" />
                          {permLabels[perm]}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Check size={14} />Сохранить</button>
                    <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Отмена</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        {role.isSystem && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Системная</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Пользователей с этой ролью: {userCount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(role)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                      {deleteConfirm === role.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(role.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Да</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs border border-gray-200 px-2 py-1 rounded">Нет</button>
                        </div>
                      ) : (
                        !role.isSystem && <button onClick={() => setDeleteConfirm(role.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                      )}
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
  );
}
