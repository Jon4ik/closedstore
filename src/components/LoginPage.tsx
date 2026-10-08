import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) setError('Неверное имя пользователя или пароль');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">РиЗ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Реконструкция — Закрытие</h1>
          <p className="text-sm text-gray-500 mt-1">Система управления проектами</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <LogIn size={16} /> Войти
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Тестовые аккаунты:</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Администратор:</span>
                <span className="font-mono text-gray-500">admin / admin123</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Менеджер:</span>
                <span className="font-mono text-gray-500">manager / manager123</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Наблюдатель:</span>
                <span className="font-mono text-gray-500">viewer / viewer123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
