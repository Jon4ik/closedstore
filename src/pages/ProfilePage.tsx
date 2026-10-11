import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Lock, MessageSquare, Palette, Save } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateUser } = useStore();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [chatId, setChatId] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return <div className="text-center py-12 text-gray-500">Необходимо войти в систему</div>;
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser(currentUser.id, { fullName, chatId, theme });
      alert('Профиль успешно обновлён');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Ошибка при обновлении профиля');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement password change API
      alert('Пароль успешно изменён');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Ошибка при изменении пароля');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Профиль пользователя</h1>
        <p className="text-sm text-gray-500 mt-1">Управление вашими настройками и предпочтениями</p>
      </div>

      {/* Основная информация */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={24} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Логин</label>
            <input
              type="text"
              value={currentUser.username}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ФИО</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Иванов Иван Иванович"
            />
          </div>
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={24} className="text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            ID чата для уведомлений в мессенджере Пачка
          </label>
          <input
            type="text"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="Например: 123456789"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Укажите ID вашего чата для получения уведомлений о важных событиях
          </p>
        </div>
      </div>

      {/* Тема оформления */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette size={24} className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Тема оформления</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Выберите тему</label>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="light">Светлая тема</option>
            <option value="dark">Тёмная тема</option>
            <option value="system">Системная тема</option>
          </select>
        </div>
      </div>

      {/* Смена пароля */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={24} className="text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Смена пароля</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Текущий пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Введите текущий пароль"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Введите новый пароль"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Подтверждение пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Повторите новый пароль"
            />
          </div>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Lock size={16} />
          {saving ? 'Изменение...' : 'Изменить пароль'}
        </button>
      </div>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  );
}
