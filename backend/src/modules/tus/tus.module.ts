import { Module } from '@nestjs/common';
import { TUsController } from './tus.controller';
import { TUsService } from './tus.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TUsController],
  providers: [TUsService, PrismaService],
})
export class TUsModule {}
