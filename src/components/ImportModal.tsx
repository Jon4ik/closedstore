import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, Upload, FileSpreadsheet } from 'lucide-react';

export default function ImportModal() {
  const { isImportModalOpen, closeImportModal, importProjects } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isImportModalOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      await importProjects(selectedFile);
      setImported(true);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Ошибка импорта: ' + (error as Error).message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImported(false);
    setLoading(false);
    closeImportModal();
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Импорт завершён!</p>
              <p className="text-sm text-gray-500 mt-1">Данные успешно загружены в базу данных</p>
              <button onClick={handleClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Закрыть</button>
            </div>
          ) : (
            <>
              <div>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <FileSpreadsheet size={40} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Нажмите для выбора файла XLSX</p>
                  <p className="text-xs text-gray-500 mt-1">Поддерживаются файлы .xlsx и .xls</p>
                  {selectedFile && (
                    <p className="text-sm text-blue-600 mt-3 font-medium">{selectedFile.name}</p>
                  )}
                  {loading && <p className="text-sm text-blue-600 mt-3">Загрузка файла...</p>}
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Ожидаемые колонки:</p>
                  <p className="text-xs text-gray-500">Номер магазина, Адрес, Тип работ, Дата закрытия, Дата демонтажа, Дата монтажа, Дата тех. открытия, ТУ, Комментарий</p>
                </div>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {loading ? 'Загрузка...' : 'Импортировать'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
