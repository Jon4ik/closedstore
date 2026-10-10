import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importFromExcel(buffer: any, userId: string, userName: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    
    const results = { imported: 0, errors: [] as any[] };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      try {
        const storeNumber = String(row.getCell(1).value || '').trim();
        const address = String(row.getCell(2).value || '').trim();
        
        if (!storeNumber || !address) {
          results.errors.push({ row: rowNumber, message: 'Missing store number or address' });
          return;
        }

        // Create store
        this.prisma.storeProject.create({
          data: {
            storeNumber,
            address,
            city: address.split(',')[0].trim(),
            workType: 'Закрытие',
            tuId: '', // Will need to be assigned
            createdBy: userId,
          },
        });

        results.imported++;
      } catch (error) {
        results.errors.push({ row: rowNumber, message: error.message });
      }
    });

    // Log import
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'import',
        field: 'projects',
        newValue: String(results.imported),
        details: `Импортировано ${results.imported} объектов`,
      },
    });

    return results;
  }
}
