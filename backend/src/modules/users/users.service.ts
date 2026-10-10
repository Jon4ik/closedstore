import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async create(data: any, userId?: string, userName?: string) {
    const exists = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (exists) throw new ConflictException('Логин уже занят');

    // Извлекаем roleId из объекта role если он передан
    let roleId = data.roleId || data.role;
    if (typeof data.role === 'object' && data.role.id) {
      roleId = data.role.id;
    }
    
    if (!roleId) {
      throw new ConflictException('Роль не указана');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        userName: data.userName || data.fullName,
        password: hashedPassword,
        fullName: data.fullName,
        role: {
          connect: { id: roleId }
        },
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: { role: true },
    });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'create_user',
          field: 'user',
          newValue: user.username,
          details: `Создан пользователь ${user.fullName}`,
        },
      });
    }

    return user;
  }

  async update(id: string, data: any, userId?: string, userName?: string) {
    const existing = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!existing) throw new NotFoundException('Пользователь не найден');

    // Подготовка данных для обновления
    const updateData: any = {
      username: data.username,
      userName: data.userName || data.fullName,
      fullName: data.fullName,
      isActive: data.isActive,
    };
    
    // Хэшируем пароль если он передан
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // Извлекаем roleId из объекта role если он передан
    let roleId = data.roleId || data.role;
    if (typeof data.role === 'object' && data.role.id) {
      roleId = data.role.id;
    }
    
    if (roleId) {
      updateData.role = {
        connect: { id: roleId }
      };
    }
    
    const user = await this.prisma.user.update({ 
      where: { id }, 
      data: updateData,
      include: { role: true } 
    });

    // Логирование
    if (userId) {
      for (const [key, newValue] of Object.entries(data)) {
        const oldValue = (existing as any)[key];
        if (String(oldValue) !== String(newValue)) {
          await this.prisma.auditLog.create({
            data: {
              userId,
              action: 'update_user',
              field: key,
              oldValue: String(oldValue || ''),
              newValue: String(newValue || ''),
              details: `Изменено поле "${key}" пользователя ${user.fullName}`,
            },
          });
        }
      }
    }

    return user;
  }

  async remove(id: string, userId?: string, userName?: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Пользователь не найден');

    const user = await this.prisma.user.delete({ where: { id } });

    // Логирование
    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'delete_user',
          field: 'user',
          oldValue: existing.username,
          details: `Удалён пользователь ${existing.fullName}`,
        },
      });
    }

    return user;
  }

  // Обновление профиля пользователя (свои настройки)
  async updateProfile(id: string, data: { fullName?: string; chatId?: string; telegramId?: string; theme?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.chatId !== undefined && { chatId: data.chatId }),
        ...(data.telegramId !== undefined && { telegramId: data.telegramId }),
        ...(data.theme && { theme: data.theme }),
      },
      include: { role: true },
    });

    return user;
  }

  // Смена пароля
  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Проверка старого пароля
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new ConflictException('Неверный текущий пароль');
    }

    // Хэширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Пароль успешно изменён' };
  }
}
