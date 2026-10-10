import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async create(data: any, userId?: string, userName?: string) {
    const role = await this.prisma.role.create({ data });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          userName: userName || 'Система',
          action: 'create_role',
          field: 'role',
          newValue: role.name,
          details: `Создана роль ${role.name}`,
        },
      });
    }

    return role;
  }

  async update(id: string, data: any, userId?: string, userName?: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Роль не найдена');

    const role = await this.prisma.role.update({ where: { id }, data });

    // Логирование
    if (userId) {
      for (const [key, newValue] of Object.entries(data)) {
        const oldValue = (existing as any)[key];
        if (String(oldValue) !== String(newValue)) {
          await this.prisma.auditLog.create({
            data: {
              userId,
              userName: userName || 'Система',
              action: 'update_role',
              field: key,
              oldValue: String(oldValue || ''),
              newValue: String(newValue || ''),
              details: `Изменено поле "${key}" роли ${role.name}`,
            },
          });
        }
      }
    }

    return role;
  }

  async remove(id: string, userId?: string, userName?: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Роль не найдена');

    const role = await this.prisma.role.delete({ where: { id } });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          userName: userName || 'Система',
          action: 'delete_role',
          field: 'role',
          oldValue: existing.name,
          details: `Удалена роль ${existing.name}`,
        },
      });
    }

    return role;
  }
}
