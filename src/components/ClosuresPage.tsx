import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateProjectStatus, getNearestEvent, parseDate } from '../utils/statusCalculator';
import { Search, Filter, Plus, Download, Upload } from 'lucide-react';
import Filters from './Filters';

export default function ClosuresPage() {
  const { getFilteredProjects, tus, filters, setFilters, openCard, openAddModal, openImportModal, hasPermission } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Фильтруем только Закрытие и Реконструкция
  const allFiltered = getFilteredProjects().filter(p => p.workType !== 'Открытие');
  
  const sortedProjects = useMemo(() => {
    return [...allFiltered].sort((a, b) => {
      const dateA = a.closureDate ? parseDate(a.closureDate) : null;
      const dateB = b.closureDate ? parseDate(b.closureDate) : null;
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
      '№ магазина': p.storeNumber, 'Адрес': p.address, 'Город': p.city, 'Тип работ': p.workType,
      'Закрытие': p.closureDate || '', 'Демонтаж': p.demolitionDate || '', 'Монтаж': p.installationDate || '',
      'Тех. открытие': p.techOpenDate || '', 'ТУ': getTUName(p.tuId), 'Статус': calculateProjectStatus(p),
    }));
    exportToExcel(dataToExport, 'closures_reconstructions');
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
        {hasPermission('create_closures') && (
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Добавить объект
          </button>
        )}
        {hasPermission('export') && (
          <button onClick={handleExport} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50" title="Экспорт XLSX">
            <Download size={16} />
          </button>
        )}
        <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Дата закрытия {sortDir === 'asc' ? '↑' : '↓'}
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
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Закрытие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Демонтаж</th>
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
                  <tr key={project.id} className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    style={{ backgroundColor: project.rowColor || undefined }}
                    onClick={() => openCard(project.id)}>
                    <td className="px-4 py-3 font-semibold text-blue-700">{project.storeNumber}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[250px]"><div className="truncate" title={project.address}>{project.address}</div></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        project.workType === 'Закрытие' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>{project.workType}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.closureDate || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.demolitionDate || '—'}</td>
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
    'Запланирован': 'bg-blue-100 text-blue-700', 'Закрыт для покупателей': 'bg-yellow-100 text-yellow-700',
    'Демонтаж': 'bg-orange-100 text-orange-700', 'Монтаж': 'bg-purple-100 text-purple-700',
    'Техническое открытие': 'bg-cyan-100 text-cyan-700', 'Завершено': 'bg-green-100 text-green-700',
    'Отменено': 'bg-gray-200 text-gray-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorMap[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}
