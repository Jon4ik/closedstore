import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { LdapService } from './ldap.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, LdapService, PrismaService],
  exports: [SettingsService, LdapService],
})
export class SettingsModule {}
