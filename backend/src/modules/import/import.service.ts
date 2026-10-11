import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as ExcelJS from 'exceljs';

const MAX_ROWS = 5000;
const MAX_CELL_LENGTH = 500;

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importFromExcel(buffer: Buffer, userId: string, userName: string) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Файл пуст или превышает лимит 5 МБ');
    }
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer);
    } catch {
      throw new BadRequestException('Не удалось прочитать Excel-файл');
    }
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new BadRequestException('В файле отсутствует лист с данными');
    if (worksheet.rowCount > MAX_ROWS + 1) throw new BadRequestException(`Допускается не более ${MAX_ROWS} строк данных`);

    const results: { imported: number; errors: Array<{ row: number; message: string }> } = { imported: 0, errors: [] };
    const cellText = (row: ExcelJS.Row, index: number) => String(row.getCell(index).text ?? row.getCell(index).value ?? '').trim();
    const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, fullName: true } });
    if (!actor) throw new BadRequestException('Не удалось определить пользователя импорта');

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (row.cellCount === 0) continue;
      const storeNumber = cellText(row, 1).slice(0, MAX_CELL_LENGTH);
      const address = cellText(row, 2).slice(0, MAX_CELL_LENGTH);
      const tuValue = cellText(row, 3).slice(0, MAX_CELL_LENGTH);

      if (!storeNumber || !address || !tuValue) {
        results.errors.push({ row: rowNumber, message: 'Заполните магазин (столбец A), адрес (B) и ТУ ID/ФИО (C)' });
        continue;
      }
      if (storeNumber.length > 100 || address.length > 300) {
        results.errors.push({ row: rowNumber, message: 'Слишком длинный номер магазина или адрес' });
        continue;
      }

      const tu = await this.prisma.tU.findFirst({
        where: { isActive: true, OR: [{ id: tuValue }, { fullName: { equals: tuValue, mode: 'insensitive' } }] },
        select: { id: true },
      });
      if (!tu) {
        results.errors.push({ row: rowNumber, message: `ТУ "${tuValue}" не найден или отключён` });
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          const project = await tx.storeProject.create({
            data: {
              storeNumber,
              address,
              city: address.includes(',') ? address.split(',')[0].trim() : address,
              workType: 'Закрытие',
              tuId: tu.id,
              createdBy: userId,
            },
            select: { id: true, storeNumber: true },
          });
          await tx.auditLog.create({
            data: {
              userId, userName: actor.fullName || userName || actor.id,
              storeId: project.id, action: 'import_row', field: 'project',
              newValue: project.storeNumber, details: `Импортирован объект из строки ${rowNumber}`,
            },
          });
        });
        results.imported += 1;
      } catch (error) {
        results.errors.push({ row: rowNumber, message: 'Не удалось сохранить строку; проверьте данные и ограничения БД' });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        userId, userName: actor.fullName || userName || actor.id,
        action: 'import', field: 'projects', newValue: String(results.imported),
        details: `Импорт Excel: успешно ${results.imported}, ошибок ${results.errors.length}`,
      },
    });
    return { ...results, totalRows: Math.max(worksheet.rowCount - 1, 0) };
  }
}
