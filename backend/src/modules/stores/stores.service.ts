import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // Конвертация даты из формата "ДД.ММ.ГГГГ" в ISO-8601
  private convertDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    
    // Проверяем формат ДД.ММ.ГГГГ
    const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Если уже ISO формат, возвращаем как есть
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    throw new BadRequestException(`Некорректный формат даты: ${dateStr}. Ожидается формат ДД.ММ.ГГГГ`);
  }

  // Валидация дат
  private validateDates(data: any) {
    const dateFields = ['closureDate', 'demolitionDate', 'installationDate', 'techOpenDate'];
    const dates: { field: string; date: Date }[] = [];
    
    for (const field of dateFields) {
      if (data[field]) {
        try {
          const date = this.convertDate(data[field]);
          if (date) {
            dates.push({ field, date });
          }
        } catch (error) {
          throw new BadRequestException(`Некорректная дата в поле "${field}": ${data[field]}`);
        }
      }
    }
    
    // Проверяем порядок дат
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i].date > dates[i + 1].date) {
        throw new BadRequestException(
          `Дата "${dates[i + 1].field}" не может быть раньше даты "${dates[i].field}"`
        );
      }
    }
  }

  async findAll(query: any) {
    const { search, workType, status, tuId, city, page = 1, limit = 50 } = query;
    
    const where: any = { isDeleted: false };
    
    if (search) {
      where.OR = [
        { storeNumber: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (workType) where.workType = workType;
    if (status) where.status = status;
    if (tuId) where.tuId = tuId;
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      this.prisma.storeProject.findMany({
        where,
        include: { tu: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.storeProject.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const store = await this.prisma.storeProject.findUnique({
      where: { id },
      include: { tu: true, comments: { include: { user: true }, orderBy: { createdAt: 'desc' } } },
    });
    if (!store) throw new NotFoundException('Объект не найден');
    return store;
  }

  async create(data: any, userId: string, userName: string) {
    // Валидация дат
    this.validateDates(data);
    
    // Конвертация дат в ISO формат
    const convertedData = {
      ...data,
      closureDate: this.convertDate(data.closureDate),
      demolitionDate: this.convertDate(data.demolitionDate),
      installationDate: this.convertDate(data.installationDate),
      techOpenDate: this.convertDate(data.techOpenDate),
    };

    // Проверяем что tuId существует
    if (convertedData.tuId) {
      const tuExists = await this.prisma.tU.findUnique({ where: { id: convertedData.tuId } });
      if (!tuExists) {
        // Если TU не найден, используем первого доступного
        const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
        if (firstTU) {
          convertedData.tuId = firstTU.id;
        } else {
          throw new BadRequestException('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
        }
      }
    } else {
      // Если tuId не указан, используем первого доступного
      const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
      if (firstTU) {
        convertedData.tuId = firstTU.id;
      } else {
        throw new BadRequestException('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
      }
    }

    const store = await this.prisma.storeProject.create({
      data: { ...convertedData, createdBy: userId },
      include: { tu: true },
    });

    await this.prisma.auditLog.create({
      data: {
        storeId: store.id, userId,
        action: 'create', field: 'project',
        details: `Создан объект №${store.storeNumber}`,
        newValue: store.storeNumber,
      },
    });

    return store;
  }

  async update(id: string, data: any, userId: string, userName: string) {
    const existing = await this.prisma.storeProject.findUnique({ 
      where: { id },
      include: { tu: true }
    });
    if (!existing) throw new NotFoundException('Объект не найден');

    // Валидация дат если они есть в данных
    this.validateDates(data);
    
    // Конвертация дат в ISO формат
    const convertedData = { ...data };
    const dateFields = ['closureDate', 'demolitionDate', 'installationDate', 'techOpenDate'];
    for (const field of dateFields) {
      if (convertedData[field] !== undefined) {
        convertedData[field] = this.convertDate(convertedData[field]);
      }
    }

    const store = await this.prisma.storeProject.update({
      where: { id },
      data: convertedData,
      include: { tu: true },
    });

    // Audit - сравниваем нормализованные значения, чтобы не писать
    // ложные изменения дат (Date из БД vs строка ДД.ММ.ГГГГ из формы).
    // Без нормализации любое сохранение карточки фиксировалось как
    // "Изменено поле demolitionDate/closureDate", хотя дата не менялась.
    const skipKeys = ['id', 'createdAt', 'updatedAt', 'createdBy'];
    for (const [key, newValue] of Object.entries(data)) {
      if (skipKeys.includes(key)) continue;
      if (!(key in existing)) continue;

      const oldValue = (existing as any)[key];
      
      // Для дат сравниваем корректно (конвертируем оба значения в один формат)
      let hasChanged = false;
      if (dateFields.includes(key)) {
        // Пропускаем null/undefined значения
        if (!oldValue && !newValue) continue;
        if (!oldValue || !newValue) {
          hasChanged = true;
        } else {
          const oldDate = this.formatDateForAudit(oldValue);
          const newDate = this.formatDateForAudit(newValue);
          hasChanged = oldDate !== newDate;
        }
      } else {
        hasChanged = String(oldValue || '') !== String(newValue || '');
      }
      
      if (hasChanged) {
        let oldValueDisplay = String(oldValue || '');
        let newValueDisplay = String(newValue || '');
        
        // Для tuId записываем имя ТУ вместо ID
        if (key === 'tuId') {
          oldValueDisplay = existing.tu?.fullName || oldValue;
          if (newValue) {
            const newTu = await this.prisma.tU.findUnique({ where: { id: String(newValue) } });
            newValueDisplay = newTu?.fullName || String(newValue);
          }
        }
        
        // Для дат форматируем в dd.mm.yyyy
        if (dateFields.includes(key)) {
          oldValueDisplay = this.formatDateForAudit(oldValue);
          newValueDisplay = this.formatDateForAudit(newValue);
        }

        await this.prisma.auditLog.create({
          data: {
            storeId: id, userId,
            action: 'update', field: key,
            oldValue: oldValueDisplay,
            newValue: newValueDisplay,
            details: `Изменено поле "${key}"`,
          },
        });
      }
    }

    return store;
  }

  // Нормализация значений для корректного сравнения при аудите.
  private normalizeForCompare(key: string, value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const dateFields = ['closureDate', 'demolitionDate', 'installationDate', 'techOpenDate'];
    if (dateFields.includes(key)) {
      return this.formatDateForAudit(value);
    }
    if (typeof value === 'object' && !(value instanceof Date)) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
  
  // Форматирование даты для аудита
  private formatDateForAudit(dateStr: any): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    } catch {
      return String(dateStr);
    }
  }

  async remove(id: string, userId: string, userName: string) {
    const store = await this.prisma.storeProject.update({
      where: { id },
      data: { isDeleted: true, status: 'Удален' },
    });

    await this.prisma.auditLog.create({
      data: {
        storeId: id, userId,
        action: 'delete', field: 'project',
        oldValue: 'active', newValue: 'deleted',
        details: 'Объект удалён (soft delete)',
      },
    });

    return store;
  }

  async restore(id: string) {
    return this.prisma.storeProject.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  async getDashboard() {
    const projects = await this.prisma.storeProject.findMany({ where: { isDeleted: false } });
    
    return {
      total: projects.length,
      closures: projects.filter(p => p.workType === 'Закрытие').length,
      reconstructions: projects.filter(p => p.workType === 'Реконструкция').length,
      completed: projects.filter(p => p.status === 'Завершено').length,
      overdue: projects.filter(p => p.status === 'Просрочено').length,
      cancelled: projects.filter(p => p.status === 'Отменено').length,
    };
  }

  // Комментарии
  async getComments(storeId: string) {
    return this.prisma.comment.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(storeId: string, userId: string, userName: string, text: string) {
    // Проверяем существование объекта
    const store = await this.prisma.storeProject.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Объект не найден');

    const comment = await this.prisma.comment.create({
      data: {
        storeId,
        userId,
        text,
      },
    });

    // Аудит
    await this.prisma.auditLog.create({
      data: {
        storeId, userId,
        action: 'add_comment', field: 'comment',
        newValue: text.slice(0, 50),
        details: 'Добавлен комментарий',
      },
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string, userName: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    await this.prisma.comment.delete({ where: { id: commentId } });

    // Аудит
    await this.prisma.auditLog.create({
      data: {
        storeId: comment.storeId, userId,
        action: 'delete_comment', field: 'comment',
        oldValue: comment.text.slice(0, 50),
        details: 'Удалён комментарий',
      },
    });

    return { success: true };
  }
}
