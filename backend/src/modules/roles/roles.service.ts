import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(data: any) {
    return this.prisma.role.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.role.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
