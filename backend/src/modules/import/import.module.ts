import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaService } from '../../prisma.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  controllers: [ImportController],
  providers: [ImportService, PrismaService, PermissionsGuard],
})
export class ImportModule {}
