import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export default function Filters() {
  const { filters, setFilters, resetFilters, tus, projects } = useStore();
  const cities = [...new Set(projects.filter(p => !p.isDeleted).map(p => p.city))].sort();
  const months: { value: string; label: string }[] = [];
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const now = new Date();
  for (let i = -2; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ value: `${d.getMonth() + 1}-${d.getFullYear()}`, label: `${monthNames[d.getMonth()]} ${d.getFullYear()}` });
  }

  const hasActiveFilters = filters.workType || filters.status || filters.tuId || filters.city || filters.month || filters.showOverdue || filters.showUpcoming;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Фильтры</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"><X size={14} />Сбросить все</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Месяц</label>
          <select value={filters.month} onChange={e => setFilters({ month: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Все месяцы</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Тип работ</label>
          <select value={filters.workType} onChange={e => setFilters({ workType: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Все типы</option>
            <option value="Закрытие">Закрытие</option>
            <option value="Реконструкция">Реконструкция</option>
            <option value="Открытие">Открытие</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Статус</label>
          <select value={filters.status} onChange={e => setFilters({ status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Все статусы</option>
            <option value="Запланирован">Запланирован</option>
            <option value="Закрыт для покупателей">Закрыт для покупателей</option>
            <option value="Демонтаж">Демонтаж</option>
            <option value="Монтаж">Монтаж</option>
            <option value="Техническое открытие">Техническое открытие</option>
            <option value="Завершено">Завершено</option>
            <option value="Просрочено">Просрочено</option>
            <option value="Отменено">Отменено</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">ТУ</label>
          <select value={filters.tuId} onChange={e => setFilters({ tuId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Все ТУ</option>
            {tus.filter(t => t.isActive).map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Город</label>
          <select value={filters.city} onChange={e => setFilters({ city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Все города</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.showOverdue} onChange={e => setFilters({ showOverdue: e.target.checked })} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
            <span className="text-sm text-gray-700">Просроченные</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.showUpcoming} onChange={e => setFilters({ showUpcoming: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Ближайшие 7 дней</span>
          </label>
        </div>
      </div>
    </div>
  );
}
