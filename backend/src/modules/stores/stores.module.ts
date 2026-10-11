import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { PrismaService } from '../../prisma.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  controllers: [StoresController],
  providers: [StoresService, PrismaService, PermissionsGuard],
})
export class StoresModule {}
