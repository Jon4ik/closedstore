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

  async create(data: { username: string; password: string; fullName: string; roleId: string }) {
    const exists = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (exists) throw new ConflictException('Логин уже занят');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      include: { role: true },
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data, include: { role: true } });
  }

  async remove(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
