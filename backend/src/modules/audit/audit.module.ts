import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaService } from '../../prisma.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService, PermissionsGuard],
})
export class AuditModule {}
