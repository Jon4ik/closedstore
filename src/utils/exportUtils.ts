import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Данные');
  
  // Auto-width columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  
  // Add BOM for Excel UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(data: Record<string, any>[], filename: string) {
  // Simple PDF export using jsPDF
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF('landscape');
      
      const headers = Object.keys(data[0] || {});
      const rows = data.map(row => headers.map(h => String(row[h] || '')));
      
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      
      doc.save(`${filename}.pdf`);
    });
  });
}

export interface ImportResult {
  data: any[];
  errors: { row: number; message: string }[];
  headers: string[];
}

export async function parseExcelFile(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          resolve({ data: [], errors: [{ row: 0, message: 'Файл пуст или содержит только заголовки' }], headers: [] });
          return;
        }

        const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
        const rows = jsonData.slice(1);
        
        // Map columns
        const columnMap = mapColumns(headers);
        
        const parsedData: any[] = [];
        const errors: { row: number; message: string }[] = [];

        rows.forEach((row, idx) => {
          const rowNum = idx + 2; // 1-indexed, skip header
          const record: any = {};
          let hasError = false;

          // Store number
          const storeNum = row[columnMap.storeNumber];
          if (!storeNum && storeNum !== 0) {
            errors.push({ row: rowNum, message: 'Отсутствует номер магазина' });
            hasError = true;
          } else {
            record.storeNumber = String(storeNum).trim();
          }

          // Address
          record.address = String(row[columnMap.address] || '').trim();
          if (!record.address) {
            errors.push({ row: rowNum, message: 'Отсутствует адрес' });
            hasError = true;
          }

          // City - extract from address
          record.city = extractCity(record.address);

          // Work type
          const workTypeStr = String(row[columnMap.workType] || '').trim().toLowerCase();
          if (workTypeStr.includes('закрыт') || workTypeStr.includes('закры')) {
            record.workType = 'Закрытие';
          } else if (workTypeStr.includes('рекон') || workTypeStr.includes('ремонт')) {
            record.workType = 'Реконструкция';
          } else {
            record.workType = 'Закрытие'; // default
          }

          // Dates
          record.closureDate = parseExcelDate(row[columnMap.closureDate]);
          record.demolitionDate = parseExcelDate(row[columnMap.demolitionDate]);
          record.installationDate = parseExcelDate(row[columnMap.installationDate]);
          record.osvDate = parseExcelDate(row[columnMap.osvDate]);
          record.techOpenDate = parseExcelDate(row[columnMap.techOpenDate]);

          // Responsible
          record.responsibleName = String(row[columnMap.responsible] || '').trim();
          record.comment = String(row[columnMap.comment] || '').trim();

          if (!hasError) {
            parsedData.push(record);
          }
        });

        resolve({ data: parsedData, errors, headers });
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function mapColumns(headers: string[]): { [key: string]: number } {
  const map: { [key: string]: number } = {
    storeNumber: -1,
    address: -1,
    workType: -1,
    closureDate: -1,
    demolitionDate: -1,
    installationDate: -1,
    osvDate: -1,
    techOpenDate: -1,
    responsible: -1,
    comment: -1,
  };

  headers.forEach((h, idx) => {
    const lower = h.toLowerCase();
    if (lower.includes('номер') || lower.includes('№') || lower.includes('магазин') || lower === 'no') {
      map.storeNumber = idx;
    } else if (lower.includes('адрес')) {
      map.address = idx;
    } else if (lower.includes('тип') || lower.includes('вид')) {
      map.workType = idx;
    } else if (lower.includes('закрыт') && !lower.includes('тех')) {
      map.closureDate = idx;
    } else if (lower.includes('демонтаж') || lower.includes('дем.')) {
      map.demolitionDate = idx;
    } else if (lower.includes('монтаж') || lower.includes('монт.')) {
      map.installationDate = idx;
    } else if (lower.includes('осв') || lower.includes('открытие ос')) {
      map.osvDate = idx;
    } else if (lower.includes('тех') || lower.includes('открыт')) {
      map.techOpenDate = idx;
    } else if (lower.includes('ответ') || lower.includes('сотруд')) {
      map.responsible = idx;
    } else if (lower.includes('коммент') || lower.includes('примеч')) {
      map.comment = idx;
    }
  });

  // Fallback: assign by position if not found
  if (map.storeNumber === -1 && headers.length > 0) map.storeNumber = 0;
  if (map.address === -1 && headers.length > 1) map.address = 1;
  if (map.workType === -1 && headers.length > 2) map.workType = 2;

  return map;
}

function extractCity(address: string): string {
  const parts = address.split(',');
  if (parts.length > 0) {
    return parts[0].trim();
  }
  return address;
}

function parseExcelDate(value: any): string | null {
  if (!value) return null;
  
  if (typeof value === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const d = String(date.d).padStart(2, '0');
      const m = String(date.m).padStart(2, '0');
      const y = date.y;
      return `${d}.${m}.${y}`;
    }
  }
  
  const str = String(value).trim();
  if (!str) return null;
  
  // Try DD.MM.YYYY
  const parts = str.split(/[./-]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 2000) {
      return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
    }
  }
  
  // Try to parse as Date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }
  
  return null;
}
