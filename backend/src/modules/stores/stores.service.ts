import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

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
    // Проверяем что tuId существует
    if (data.tuId) {
      const tuExists = await this.prisma.tU.findUnique({ where: { id: data.tuId } });
      if (!tuExists) {
        // Если TU не найден, используем первого доступного
        const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
        if (firstTU) {
          data.tuId = firstTU.id;
        } else {
          throw new Error('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
        }
      }
    } else {
      // Если tuId не указан, используем первого доступного
      const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
      if (firstTU) {
        data.tuId = firstTU.id;
      } else {
        throw new Error('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
      }
    }

    const store = await this.prisma.storeProject.create({
      data: { ...data, createdBy: userId },
      include: { tu: true },
    });

    await this.prisma.auditLog.create({
      data: {
        storeId: store.id, userId, userName,
        action: 'create', field: 'project',
        details: `Создан объект №${store.storeNumber}`,
        newValue: store.storeNumber,
      },
    });

    return store;
  }

  async update(id: string, data: any, userId: string, userName: string) {
    const existing = await this.prisma.storeProject.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Объект не найден');

    const store = await this.prisma.storeProject.update({
      where: { id },
      data,
      include: { tu: true },
    });

    // Audit
    for (const [key, newValue] of Object.entries(data)) {
      const oldValue = (existing as any)[key];
      if (String(oldValue) !== String(newValue)) {
        await this.prisma.auditLog.create({
          data: {
            storeId: id, userId, userName,
            action: 'update', field: key,
            oldValue: String(oldValue || ''),
            newValue: String(newValue || ''),
            details: `Изменено поле "${key}"`,
          },
        });
      }
    }

    return store;
  }

  async remove(id: string, userId: string, userName: string) {
    const store = await this.prisma.storeProject.update({
      where: { id },
      data: { isDeleted: true, status: 'Удален' },
    });

    await this.prisma.auditLog.create({
      data: {
        storeId: id, userId, userName,
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
}
