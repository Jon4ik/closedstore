import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (result === false) {
      setError('Неверное имя пользователя или пароль');
    } else if (result === 'disabled') {
      setError('Учетная запись отключена. Обратитесь к администратору.');
    }
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
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Введите логин"
                autoComplete="username" required maxLength={64}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль"
                autoComplete="current-password" required maxLength={128}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <LogIn size={16} /> Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
