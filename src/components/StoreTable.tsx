import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateProjectStatus, getNearestEvent } from '../utils/statusCalculator';
import { Search, Filter, Plus, Download, Upload, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Filters from './Filters';

export default function StoreTable() {
  const { getFilteredProjects, tus, filters, setFilters, openCard, openAddModal, openImportModal, deleteProject, currentUser, hasPermission } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const projects = getFilteredProjects();
  
  const sortedProjects = useMemo(() => {
    if (!sortField) return projects;
    return [...projects].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'storeNumber': aVal = a.storeNumber; bVal = b.storeNumber; break;
        case 'address': aVal = a.address; bVal = b.address; break;
        case 'workType': aVal = a.workType; bVal = b.workType; break;
        case 'status': aVal = calculateProjectStatus(a); bVal = calculateProjectStatus(b); break;
        case 'tu': 
          aVal = tus.find(t => t.id === a.tuId)?.fullName || '';
          bVal = tus.find(t => t.id === b.tuId)?.fullName || '';
          break;
        default: return 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDir, tus]);

  const paginatedProjects = sortedProjects.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedProjects.length / pageSize);
  const getTUName = (id: string) => tus.find(t => t.id === id)?.fullName || '—';

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    const { exportToExcel, exportToCSV } = await import('../utils/exportUtils');
    const dataToExport = sortedProjects.map(p => ({
      '№ магазина': p.storeNumber, 'Адрес': p.address, 'Город': p.city, 'Тип работ': p.workType,
      'Закрытие': p.closureDate || '', 'Демонтаж': p.demolitionDate || '', 'Монтаж': p.installationDate || '',
      'Тех. открытие': p.techOpenDate || '', 'ТУ': getTUName(p.tuId), 'Статус': calculateProjectStatus(p), 'Комментарий': p.comment,
    }));
    if (format === 'xlsx') exportToExcel(dataToExport, 'objects');
    else exportToCSV(dataToExport, 'objects');
  };

  const handleContextAction = (action: string, projectId: string) => {
    if (action === 'view') openCard(projectId);
    else if (action === 'delete') deleteProject(projectId);
    setContextMenu(null);
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
        {hasPermission('create') && (
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Добавить объект
          </button>
        )}
        {hasPermission('import') && (
          <button onClick={openImportModal} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Upload size={16} /> Импорт
          </button>
        )}
        {hasPermission('export') && (
          <button onClick={() => handleExport('xlsx')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50" title="Экспорт XLSX">
            <Download size={16} />
          </button>
        )}
      </div>

      {showFilters && <Filters />}

      <div className="text-sm text-gray-500">Найдено: {sortedProjects.length} объектов</div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap" onClick={() => handleSort('storeNumber')}>№ {sortField === 'storeNumber' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap" onClick={() => handleSort('address')}>Адрес {sortField === 'address' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap" onClick={() => handleSort('workType')}>Тип {sortField === 'workType' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Закрытие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Демонтаж</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Монтаж</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Тех.открытие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap" onClick={() => handleSort('tu')}>ТУ {sortField === 'tu' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Статус</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map(project => {
                const status = calculateProjectStatus(project);
                return (
                  <tr key={project.id} className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    style={{ backgroundColor: project.rowColor || undefined }}
                    onDoubleClick={() => openCard(project.id)} onClick={() => openCard(project.id)}>
                    <td className="px-4 py-3 font-semibold text-blue-700">{project.storeNumber}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[250px]"><div className="truncate" title={project.address}>{project.address}</div></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        project.workType === 'Закрытие' ? 'bg-orange-100 text-orange-700' : 
                        project.workType === 'Открытие' ? 'bg-green-100 text-green-700' : 
                        'bg-purple-100 text-purple-700'
                      }`}>{project.workType}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.closureDate || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.demolitionDate || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.installationDate || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{project.techOpenDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{getTUName(project.tuId)}</td>
                    <td className="px-4 py-3"><StatusBadge status={status} /></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); const rect = (e.target as HTMLElement).getBoundingClientRect(); setContextMenu({ id: project.id, x: rect.left, y: rect.bottom }); }}
                        className="p-1 hover:bg-gray-100 rounded"><MoreVertical size={16} className="text-gray-400" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Страница {page + 1} из {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button onClick={() => handleContextAction('view', contextMenu.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Открыть карточку</button>
            {hasPermission('delete') && (
              <button onClick={() => handleContextAction('delete', contextMenu.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Удалить (soft)</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: { [key: string]: string } = {
    'Запланирован': 'bg-blue-100 text-blue-700', 'Закрыт для покупателей': 'bg-yellow-100 text-yellow-700',
    'Демонтаж': 'bg-orange-100 text-orange-700', 'Монтаж': 'bg-purple-100 text-purple-700',
    'Техническое открытие': 'bg-cyan-100 text-cyan-700', 'Завершено': 'bg-green-100 text-green-700',
    'Просрочено': 'bg-red-100 text-red-700', 'Отменено': 'bg-gray-200 text-gray-700', 'Удален': 'bg-gray-100 text-gray-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorMap[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}
