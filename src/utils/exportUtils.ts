import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], filename: string) {
  console.log('Начало экспорта в Excel', { dataLength: data.length, filename });
  
  if (data.length === 0) {
    console.warn('Нет данных для экспорта');
    return;
  }

  try {
    // Создаем новый workbook
    const wb = XLSX.utils.book_new();
    
    // Создаем worksheet из данных
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Автоматическая ширина колонок
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;
    
    // Добавляем worksheet в workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    
    // Конвертируем в binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Создаем Blob
    const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Создаем URL для скачивания
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку и кликаем по ней
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    
    // Очищаем
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('Экспорт успешно завершен');
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    throw error;
  }
}

// Вспомогательная функция для конвертации string в ArrayBuffer
function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      const stringValue = value === null || value === undefined ? '' : String(value);
      // Экранируем кавычки и оборачиваем в кавычки если есть запятые
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
