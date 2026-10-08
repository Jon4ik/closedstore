import React from 'react';
import { useStore } from '../store/useStore';
import { calculateProjectStatus, getNearestEvent, formatDate, parseDate } from '../utils/statusCalculator';
import { AlertTriangle, CheckCircle2, Clock, Package, CalendarClock, TrendingUp, Store, Wrench } from 'lucide-react';

export default function Dashboard() {
  const { getDashboardStats, getUpcomingEvents, getOverdueProjects, projects, openCard, employees } = useStore();
  const stats = getDashboardStats();
  const upcomingEvents = getUpcomingEvents();
  const overdueProjects = getOverdueProjects();

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.fullName || '—';
  };

  const statCards = [
    { label: 'Всего объектов', value: stats.total, icon: Store, color: 'bg-blue-50 text-blue-700' },
    { label: 'Закрытий', value: stats.closures, icon: Package, color: 'bg-orange-50 text-orange-700' },
    { label: 'Реконструкций', value: stats.reconstructions, icon: Wrench, color: 'bg-purple-50 text-purple-700' },
    { label: 'В работе', value: stats.inProgress, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
    { label: 'Просрочено', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
    { label: 'Завершено', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Ближайшие 7 дней', value: stats.upcoming7days, icon: CalendarClock, color: 'bg-yellow-50 text-yellow-700' },
  ];

  // Group upcoming events by day
  const groupedEvents: { [key: string]: { storeNumber: string; stage: string; date: Date; daysUntil: number; projectId: string }[] } = {};
  
  upcomingEvents.forEach(event => {
    const project = projects.find(p => p.storeNumber === event.storeNumber && !p.isDeleted);
    if (!project) return;
    
    let label: string;
    if (event.daysUntil === 0) label = 'Сегодня';
    else if (event.daysUntil === 1) label = 'Завтра';
    else label = formatDate(event.date);
    
    if (!groupedEvents[label]) groupedEvents[label] = [];
    groupedEvents[label].push({ ...event, projectId: project.id });
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Ближайшие события
            </h3>
          </div>
          <div className="p-4">
            {Object.keys(groupedEvents).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Нет предстоящих событий</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedEvents).map(([label, events]) => (
                  <div key={label}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                      label === 'Сегодня' ? 'text-red-600' : label === 'Завтра' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {label}
                    </p>
                    <div className="space-y-2">
                      {events.map((event, idx) => (
                        <button
                          key={idx}
                          onClick={() => openCard(event.projectId)}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Магазин №{event.storeNumber}
                            </p>
                            <p className="text-xs text-gray-500">{event.stage}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            event.daysUntil === 0 ? 'bg-red-100 text-red-700' :
                            event.daysUntil <= 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {event.daysUntil === 0 ? 'Сегодня' : `через ${event.daysUntil} дн.`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Projects */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Просроченные объекты
            </h3>
          </div>
          <div className="p-4">
            {overdueProjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Нет просроченных объектов</p>
            ) : (
              <div className="space-y-2">
                {overdueProjects.map(project => {
                  const status = calculateProjectStatus(project);
                  return (
                    <button
                      key={project.id}
                      onClick={() => openCard(project.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          №{project.storeNumber} — {project.address.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.workType} • {getEmployeeName(project.responsibleId)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All projects quick view */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Все активные объекты</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500">№</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Адрес</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ближайшее событие</th>
              </tr>
            </thead>
            <tbody>
              {projects.filter(p => !p.isDeleted).slice(0, 10).map(project => {
                const status = calculateProjectStatus(project);
                const event = getNearestEvent(project);
                return (
                  <tr
                    key={project.id}
                    onClick={() => openCard(project.id)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">{project.storeNumber}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{project.address}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.workType === 'Закрытие' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {project.workType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {event ? `${event.stage} — ${formatDate(event.date)}` : '—'}
                    </td>
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
    'Запланирован': 'bg-blue-100 text-blue-700',
    'Закрыт для покупателей': 'bg-yellow-100 text-yellow-700',
    'Демонтаж': 'bg-orange-100 text-orange-700',
    'Монтаж': 'bg-purple-100 text-purple-700',
    'ОСВ магазина': 'bg-indigo-100 text-indigo-700',
    'Техническое открытие': 'bg-cyan-100 text-cyan-700',
    'Завершено': 'bg-green-100 text-green-700',
    'Просрочено': 'bg-red-100 text-red-700',
    'Удален': 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
