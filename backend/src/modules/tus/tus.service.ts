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

  create(data: any) {
    return this.prisma.tU.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.tU.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.tU.delete({ where: { id } });
  }
}
