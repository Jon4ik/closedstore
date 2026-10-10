import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TUsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tU.findMany({ orderBy: { fullName: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.tU.findUnique({ where: { id } });
  }

  async create(data: any, userId?: string, userName?: string) {
    const tu = await this.prisma.tU.create({ data });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          userName: userName || 'Система',
          action: 'create_tu',
          field: 'tu',
          newValue: tu.fullName,
          details: `Создан ТУ ${tu.fullName}`,
        },
      });
    }

    return tu;
  }

  async update(id: string, data: any, userId?: string, userName?: string) {
    const existing = await this.prisma.tU.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('ТУ не найден');

    const tu = await this.prisma.tU.update({ where: { id }, data });

    // Логирование
    if (userId) {
      for (const [key, newValue] of Object.entries(data)) {
        const oldValue = (existing as any)[key];
        if (String(oldValue) !== String(newValue)) {
          await this.prisma.auditLog.create({
            data: {
              userId,
              userName: userName || 'Система',
              action: 'update_tu',
              field: key,
              oldValue: String(oldValue || ''),
              newValue: String(newValue || ''),
              details: `Изменено поле "${key}" ТУ ${tu.fullName}`,
            },
          });
        }
      }
    }

    return tu;
  }

  async remove(id: string, userId?: string, userName?: string) {
    const existing = await this.prisma.tU.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('ТУ не найден');

    const tu = await this.prisma.tU.delete({ where: { id } });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          userName: userName || 'Система',
          action: 'delete_tu',
          field: 'tu',
          oldValue: existing.fullName,
          details: `Удалён ТУ ${existing.fullName}`,
        },
      });
    }

    return tu;
  }
}
