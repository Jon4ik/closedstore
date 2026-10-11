import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PermissionsGuard],
})
export class UsersModule {}
