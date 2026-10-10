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

  async create( any) {
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
    return this.prisma.user.create({
       {
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        role: {
          connect: { id: roleId }
        },
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: { role: true },
    });
  }

  async update(id: string,  any) {
    // Подготовка данных для обновления
    const updateData: any = {
      username: data.username,
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
    
    return this.prisma.user.update({ 
      where: { id }, 
      data: updateData,
      include: { role: true } 
    });
  }

  async remove(id: string) {
    // Полное удаление пользователя из БД
    return this.prisma.user.delete({ where: { id } });
  }
}
