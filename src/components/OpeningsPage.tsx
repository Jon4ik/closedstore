import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateProjectStatus, parseDate } from '../utils/statusCalculator';
import { Search, Filter, Plus, Download } from 'lucide-react';
import Filters from './Filters';

export default function OpeningsPage() {
  const { getFilteredProjects, tus, filters, setFilters, openCard, openAddModal, hasPermission } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Фильтруем только Открытие
  const allFiltered = getFilteredProjects().filter(p => p.workType === 'Открытие');
  
  const sortedProjects = useMemo(() => {
    return [...allFiltered].sort((a, b) => {
      const dateA = a.installationDate ? parseDate(a.installationDate) : null;
      const dateB = b.installationDate ? parseDate(b.installationDate) : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return sortDir === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }, [allFiltered, sortDir]);

  const getTUName = (id: string) => tus.find(t => t.id === id)?.fullName || '—';

  const handleExport = async () => {
    const { exportToExcel } = await import('../utils/exportUtils');
    const dataToExport = sortedProjects.map(p => ({
      '№ магазина': p.storeNumber, 'Адрес': p.address, 'Город': p.city,
      'Монтаж': p.installationDate || '', 'Тех. открытие': p.techOpenDate || '',
      'ТУ': getTUName(p.tuId), 'Статус': calculateProjectStatus(p),
    }));
    exportToExcel(dataToExport, 'openings');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Поиск по номеру, адресу, городу..." value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Filter size={16} /> Фильтры
        </button>
        {hasPermission('create_openings') && (
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <Plus size={16} /> Добавить открытие
          </button>
        )}
        {hasPermission('export') && (
          <button onClick={handleExport} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50" title="Экспорт XLSX">
            <Download size={16} />
          </button>
        )}
        <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Дата монтажа {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {showFilters && <Filters />}

      <div className="text-sm text-gray-500">Найдено: {sortedProjects.length} объектов</div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">№</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Адрес</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Монтаж</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Тех.открытие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">ТУ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Статус</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map(project => {
                const status = calculateProjectStatus(project);
                return (
                  <tr key={project.id} className="border-b border-gray-50 hover:bg-green-50/50 cursor-pointer transition-colors"
                    style={{ backgroundColor: project.rowColor || undefined }}
                    onClick={() => openCard(project.id)}>
                    <td className="px-4 py-3 font-semibold text-green-700">{project.storeNumber}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[300px]"><div className="truncate" title={project.address}>{project.address}</div></td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.installationDate || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.techOpenDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{getTUName(project.tuId)}</td>
                    <td className="px-4 py-3"><StatusBadge status={status} /></td>
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

function StatusBadge({ status }: { status: string }) {
  const colorMap: { [key: string]: string } = {
    'Запланирован': 'bg-blue-100 text-blue-700', 'Монтаж': 'bg-purple-100 text-purple-700',
    'Техническое открытие': 'bg-cyan-100 text-cyan-700', 'Завершено': 'bg-green-100 text-green-700',
    'Отменено': 'bg-gray-200 text-gray-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorMap[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}
