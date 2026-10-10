import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Save, TestTube, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../api/client';

export default function SettingsPage() {
  const { hasPermission } = useStore();
  const [ldapSettings, setLdapSettings] = useState({
    host: '',
    port: 389,
    baseDn: '',
    bindDn: '',
    bindPassword: '',
    useSsl: false,
    searchFilter: '(objectClass=user)',
    titleAttribute: 'title',
    titleValue: 'Территориальный управляющий',
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await apiClient.getLdapSettings();
      if (settings) {
        setLdapSettings({
          host: settings.host || '',
          port: settings.port || 389,
          baseDn: settings.baseDn || '',
          bindDn: settings.bindDn || '',
          bindPassword: settings.bindPassword || '',
          useSsl: settings.useSsl || false,
          searchFilter: settings.searchFilter || '(objectClass=user)',
          titleAttribute: settings.titleAttribute || 'title',
          titleValue: settings.titleValue || 'Территориальный управляющий',
          enabled: settings.enabled || false,
        });
      }
    } catch (error) {
      console.error('Failed to load LDAP settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await apiClient.saveLdapSettings(ldapSettings);
      setMessage({ type: 'success', text: 'Настройки LDAP сохранены' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка сохранения: ' + (error as Error).message });
    }
    setLoading(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const result = await apiClient.testLdapConnection();
      setMessage({ type: 'success', text: 'Подключение к LDAP успешно' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка подключения: ' + (error as Error).message });
    }
    setTesting(false);
  };

  const handleSync = async () => {
    if (!ldapSettings.enabled) {
      setMessage({ type: 'error', text: 'Синхронизация LDAP отключена. Включите её в настройках.' });
      return;
    }
    setSyncing(true);
    setMessage(null);
    try {
      const result = await apiClient.syncLdapUsers();
      setMessage({ 
        type: 'success', 
        text: `Синхронизация завершена. Добавлено: ${result.added}, Обновлено: ${result.updated}, Отключено: ${result.disabled}` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка синхронизации: ' + (error as Error).message });
    }
    setSyncing(false);
  };

  if (!hasPermission('settings')) {
    return <div className="text-center py-12 text-gray-500">Нет доступа к этой странице</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-sm text-gray-500 mt-1">Конфигурация синхронизации с LDAP/Active Directory</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
        </div>
      )}

      {/* LDAP Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Настройки LDAP</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ldapSettings.enabled}
              onChange={e => setLdapSettings({ ...ldapSettings, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Включить синхронизацию с LDAP</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Хост LDAP сервера</label>
              <input
                type="text"
                value={ldapSettings.host}
                onChange={e => setLdapSettings({ ...ldapSettings, host: e.target.value })}
                placeholder="ldap://ad.company.ru"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Порт</label>
              <input
                type="number"
                value={ldapSettings.port}
                onChange={e => setLdapSettings({ ...ldapSettings, port: parseInt(e.target.value) || 389 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base DN</label>
            <input
              type="text"
              value={ldapSettings.baseDn}
              onChange={e => setLdapSettings({ ...ldapSettings, baseDn: e.target.value })}
              placeholder="DC=company,DC=ru"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bind DN (пользователь для подключения)</label>
            <input
              type="text"
              value={ldapSettings.bindDn}
              onChange={e => setLdapSettings({ ...ldapSettings, bindDn: e.target.value })}
              placeholder="CN=ldap_user,OU=Service,DC=company,DC=ru"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Пароль Bind DN</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={ldapSettings.bindPassword}
                onChange={e => setLdapSettings({ ...ldapSettings, bindPassword: e.target.value })}
                placeholder="Пароль для подключения к LDAP"
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Пароль хранится в зашифрованном виде</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ldapSettings.useSsl}
              onChange={e => setLdapSettings({ ...ldapSettings, useSsl: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm text-gray-700">Использовать SSL (LDAPS)</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Фильтр поиска</label>
              <input
                type="text"
                value={ldapSettings.searchFilter}
                onChange={e => setLdapSettings({ ...ldapSettings, searchFilter: e.target.value })}
                placeholder="(objectClass=user)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Атрибут должности</label>
              <input
                type="text"
                value={ldapSettings.titleAttribute}
                onChange={e => setLdapSettings({ ...ldapSettings, titleAttribute: e.target.value })}
                placeholder="title"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Значение должности для синхронизации</label>
            <input
              type="text"
              value={ldapSettings.titleValue}
              onChange={e => setLdapSettings({ ...ldapSettings, titleValue: e.target.value })}
              placeholder="Территориальный управляющий"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save size={16} />
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !ldapSettings.host}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            <TestTube size={16} />
            {testing ? 'Проверка...' : 'Тест подключения'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || !ldapSettings.enabled}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Синхронизация...' : 'Синхронизировать с AD'}
          </button>
        </div>
      </div>
    </div>
  );
}
