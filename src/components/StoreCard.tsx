import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateProjectStatus, calculateStages, getNearestEvent, getOverdueInfo, formatDate } from '../utils/statusCalculator';
import { X, Edit3, Check, AlertTriangle, Clock, MapPin, User, Calendar, MessageSquare, History, ChevronDown, ChevronUp } from 'lucide-react';

export default function StoreCard() {
  const { selectedProjectId, isCardOpen, closeCard, projects, employees, auditLog, updateProject, currentUser, isEditing, setEditing } = useStore();
  const [editData, setEditData] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const project = projects.find(p => p.id === selectedProjectId);
  if (!project || !isCardOpen) return null;

  const status = calculateProjectStatus(project);
  const stages = calculateStages(project);
  const nearestEvent = getNearestEvent(project);
  const overdueInfo = getOverdueInfo(project);
  const responsible = employees.find(e => e.id === project.responsibleId);
  const projectAudit = auditLog.filter(l => l.storeId === project.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleStartEdit = () => {
    setEditData({
      closureDate: project.closureDate || '',
      demolitionDate: project.demolitionDate || '',
      installationDate: project.installationDate || '',
      osvDate: project.osvDate || '',
      techOpenDate: project.techOpenDate || '',
      responsibleId: project.responsibleId,
      comment: project.comment,
      manualStatus: project.manualStatus,
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!editData) return;
    updateProject(project.id, {
      closureDate: editData.closureDate || null,
      demolitionDate: editData.demolitionDate || null,
      installationDate: editData.installationDate || null,
      osvDate: editData.osvDate || null,
      techOpenDate: editData.techOpenDate || null,
      responsibleId: editData.responsibleId,
      comment: editData.comment,
      manualStatus: editData.manualStatus,
    });
    setEditing(false);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(null);
  };

  const getStatusColor = (stageStatus: string) => {
    switch (stageStatus) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'planned': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusLabel = (stageStatus: string) => {
    switch (stageStatus) {
      case 'completed': return 'Выполнен';
      case 'current': return 'Текущий';
      case 'overdue': return 'Просрочен';
      case 'planned': return 'Запланирован';
      default: return 'Не начат';
    }
  };

  const mainStatusColors: { [key: string]: string } = {
    'Запланирован': 'bg-blue-100 text-blue-800 border-blue-200',
    'Закрыт для покупателей': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Демонтаж': 'bg-orange-100 text-orange-800 border-orange-200',
    'Монтаж': 'bg-purple-100 text-purple-800 border-purple-200',
    'ОСВ магазина': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Техническое открытие': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Завершено': 'bg-green-100 text-green-800 border-green-200',
    'Просрочено': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={closeCard} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Объект №{project.storeNumber}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{project.workType}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <Edit3 size={14} />
                Редактировать
              </button>
            )}
            <button onClick={closeCard} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`rounded-xl border px-4 py-3 ${mainStatusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">Текущий статус</p>
                <p className="text-lg font-bold">{status}</p>
              </div>
              {overdueInfo && (
                <div className="flex items-center gap-2 bg-red-200/50 px-3 py-1.5 rounded-lg">
                  <AlertTriangle size={16} className="text-red-700" />
                  <span className="text-sm font-medium text-red-800">
                    Просрочка: {overdueInfo.days} дн.
                  </span>
                </div>
              )}
              {nearestEvent && !overdueInfo && (
                <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg">
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    {nearestEvent.daysUntil === 0 ? 'Сегодня' : `Через ${nearestEvent.daysUntil} дн.`}: {nearestEvent.stage}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Адрес</p>
                  <p className="text-sm font-medium text-gray-900">{project.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Ответственный</p>
                  {isEditing ? (
                    <select
                      value={editData?.responsibleId || project.responsibleId}
                      onChange={e => setEditData({ ...editData, responsibleId: e.target.value })}
                      className="mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1"
                    >
                      {employees.filter(e => e.isActive).map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{responsible?.fullName || '—'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Тип работ</p>
                  <p className="text-sm font-medium text-gray-900">{project.workType}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {project.comment && (
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Комментарий</p>
                    {isEditing ? (
                      <textarea
                        value={editData?.comment || ''}
                        onChange={e => setEditData({ ...editData, comment: e.target.value })}
                        className="mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1 w-full"
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{project.comment}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Таймлайн
            </h3>
            <div className="space-y-0">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      stage.status === 'completed' ? 'bg-green-500 border-green-500' :
                      stage.status === 'current' ? 'bg-yellow-500 border-yellow-500 animate-pulse' :
                      stage.status === 'overdue' ? 'bg-red-500 border-red-500' :
                      stage.status === 'planned' ? 'bg-blue-500 border-blue-500' :
                      'bg-white border-gray-300'
                    }`} />
                    {idx < stages.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        stage.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          stage.status === 'current' ? 'text-gray-900' :
                          stage.status === 'overdue' ? 'text-red-700' :
                          'text-gray-600'
                        }`}>
                          {stage.name}
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="ДД.ММ.ГГГГ"
                            value={editData?.[getStageField(stage.name)] || ''}
                            onChange={e => setEditData({ ...editData, [getStageField(stage.name)]: e.target.value })}
                            className="mt-1 text-sm border border-gray-200 rounded px-2 py-1 w-32"
                          />
                        ) : (
                          <p className={`text-sm mt-0.5 ${
                            stage.date ? 'text-gray-700' : 'text-gray-400 italic'
                          }`}>
                            {stage.date || 'Не назначено'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                          stage.status === 'current' ? 'bg-yellow-100 text-yellow-700' :
                          stage.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          stage.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {getStatusLabel(stage.status)}
                        </span>
                        {stage.daysUntil !== null && stage.status !== 'completed' && (
                          <span className="text-xs text-gray-500">
                            {stage.daysUntil === 0 ? 'Сегодня' : `${stage.daysUntil} дн.`}
                          </span>
                        )}
                        {stage.daysOverdue !== null && (
                          <span className="text-xs text-red-600 font-medium">
                            +{stage.daysOverdue} дн. просрочки
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Status Override */}
          {isEditing && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ручная установка статуса</label>
              <select
                value={editData?.manualStatus || ''}
                onChange={e => setEditData({ ...editData, manualStatus: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Автоматически</option>
                <option value="Запланирован">Запланирован</option>
                <option value="Закрыт для покупателей">Закрыт для покупателей</option>
                <option value="Демонтаж">Демонтаж</option>
                <option value="Монтаж">Монтаж</option>
                <option value="ОСВ магазина">ОСВ магазина</option>
                <option value="Техническое открытие">Техническое открытие</option>
                <option value="Завершено">Завершено</option>
              </select>
            </div>
          )}

          {/* History */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <History size={16} />
              История изменений ({projectAudit.length})
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showHistory && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {projectAudit.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей</p>
                ) : (
                  projectAudit.map(log => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </span>
                        <span className="text-xs text-gray-500">{log.userName}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{getFieldLabel(log.field)}:</span>{' '}
                        <span className="text-red-600 line-through">{log.oldValue}</span>{' → '}
                        <span className="text-green-600">{log.newValue}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Save/Cancel buttons */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Check size={16} />
                Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStageField(stageName: string): string {
  switch (stageName) {
    case 'Закрыт для покупателей': return 'closureDate';
    case 'Демонтаж': return 'demolitionDate';
    case 'Монтаж': return 'installationDate';
    case 'ОСВ магазина': return 'osvDate';
    case 'Техническое открытие': return 'techOpenDate';
    default: return '';
  }
}

function getFieldLabel(field: string): string {
  const labels: { [key: string]: string } = {
    storeNumber: 'Номер магазина',
    address: 'Адрес',
    workType: 'Тип работ',
    closureDate: 'Дата закрытия',
    demolitionDate: 'Дата демонтажа',
    installationDate: 'Дата монтажа',
    osvDate: 'Дата ОСВ',
    techOpenDate: 'Дата тех. открытия',
    responsibleId: 'Ответственный',
    comment: 'Комментарий',
    manualStatus: 'Статус',
  };
  return labels[field] || field;
}
