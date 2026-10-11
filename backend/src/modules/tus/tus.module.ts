import { Module } from '@nestjs/common';
import { TUsController } from './tus.controller';
import { TUsService } from './tus.service';
import { PrismaService } from '../../prisma.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  controllers: [TUsController],
  providers: [TUsService, PrismaService, PermissionsGuard],
})
export class TUsModule {}
