import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { userId, storeId, action, page = 1, limit = 100 } = query;
    const where: any = {};
    if (userId) where.userId = userId;
    if (storeId) where.storeId = storeId;
    if (action) where.action = action;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
        // ФИО пользователя берётся из справочника пользователей по userId
        include: { user: { select: { id: true, username: true, fullName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async clearAll() {
    await this.prisma.auditLog.deleteMany({});
    return { success: true, message: 'Audit log cleared' };
  }
}
