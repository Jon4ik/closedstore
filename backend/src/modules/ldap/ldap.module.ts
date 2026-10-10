import { Module } from '@nestjs/common';
import { LdapService } from './ldap.service';
import { LdapController } from './ldap.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [LdapController],
  providers: [LdapService, PrismaService],
  exports: [LdapService],
})
export class LdapModule {}
