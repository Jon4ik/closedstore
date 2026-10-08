import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, Upload, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, ImportResult } from '../utils/exportUtils';

export default function ImportModal() {
  const { isImportModalOpen, closeImportModal, importProjects, tus, currentUser } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isImportModalOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name); setLoading(true);
    try { const result = await parseExcelFile(file); setImportResult(result); }
    catch { setImportResult({ data: [], errors: [{ row: 0, message: 'Ошибка чтения файла' }], headers: [] }); }
    setLoading(false);
  };

  const handleImport = () => {
    if (!importResult || importResult.data.length === 0) return;
    const projectsToImport = importResult.data.map((row: any) => ({
      storeNumber: row.storeNumber, address: row.address, city: row.city || row.address.split(',')[0].trim(),
      workType: row.workType as 'Закрытие' | 'Реконструкция',
      closureDate: row.closureDate, demolitionDate: row.demolitionDate, installationDate: row.installationDate,
      techOpenDate: row.techOpenDate, tuId: findTUId(row.responsibleName), rowColor: '',
      comment: row.comment || '', isDeleted: false, manualStatus: null, createdBy: currentUser?.id || 'system',
    }));
    importProjects(projectsToImport);
    setImported(true);
  };

  const handleClose = () => { setImportResult(null); setFileName(''); setImported(false); setLoading(false); closeImportModal(); };
  const findTUId = (name: string): string => {
    if (!name) return tus[0]?.id || '';
    const tu = tus.find(t => t.fullName.toLowerCase().includes(name.toLowerCase()));
    return tu?.id || tus[0]?.id || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">Импорт из Excel</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {imported ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Импорт завершён!</p>
              <p className="text-sm text-gray-500 mt-1">Добавлено {importResult?.data.length || 0} объектов</p>
              <button onClick={handleClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Закрыть</button>
            </div>
          ) : (
            <>
              {!importResult && (
                <div>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                    <FileSpreadsheet size={40} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Нажмите для выбора файла XLSX</p>
                    <p className="text-xs text-gray-500 mt-1">Поддерживаются файлы .xlsx и .xls</p>
                    {loading && <p className="text-sm text-blue-600 mt-3">Обработка файла...</p>}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Ожидаемые колонки:</p>
                    <p className="text-xs text-gray-500">Номер магазина, Адрес, Тип работ, Дата закрытия, Дата демонтажа, Дата монтажа, Дата тех. открытия, ТУ, Комментарий</p>
                  </div>
                </div>
              )}
              {importResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-900">Файл: {fileName}</p><p className="text-xs text-gray-500">Найдено {importResult.data.length} записей{importResult.errors.length > 0 && `, ${importResult.errors.length} ошибок`}</p></div>
                    <button onClick={() => setImportResult(null)} className="text-sm text-blue-600 hover:text-blue-700">Выбрать другой</button>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-red-600" /><span className="text-sm font-medium text-red-800">Ошибки ({importResult.errors.length}):</span></div>
                      <div className="max-h-32 overflow-y-auto space-y-1">{importResult.errors.map((err, i) => <p key={i} className="text-xs text-red-700">Строка {err.row}: {err.message}</p>)}</div>
                    </div>
                  )}
                  {importResult.data.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-64">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">№</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Адрес</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Тип</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Закрытие</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">ТУ</th>
                            </tr>
                          </thead>
                          <tbody>{importResult.data.slice(0, 20).map((row: any, idx: number) => (
                            <tr key={idx} className="border-t border-gray-100">
                              <td className="px-3 py-2 font-medium">{row.storeNumber}</td>
                              <td className="px-3 py-2 max-w-[200px] truncate">{row.address}</td>
                              <td className="px-3 py-2">{row.workType}</td>
                              <td className="px-3 py-2">{row.closureDate || '—'}</td>
                              <td className="px-3 py-2">{row.responsibleName || '—'}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {importResult.data.length > 0 && (
                    <button onClick={handleImport} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      <Upload size={16} /> Импортировать {importResult.data.length} объектов
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
