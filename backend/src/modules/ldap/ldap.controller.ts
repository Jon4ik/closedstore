import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { LdapService } from './ldap.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ldap')
@UseGuards(JwtAuthGuard)
export class LdapController {
  constructor(private ldapService: LdapService) {}

  @Get('settings')
  getSettings() {
    return this.ldapService.getSettings();
  }

  @Put('settings')
  saveSettings(@Body() body: any) {
    return this.ldapService.saveSettings(body);
  }

  @Post('test')
  testConnection() {
    return this.ldapService.testConnection();
  }

  @Post('sync')
  syncUsers(@Request() req) {
    return this.ldapService.syncUsers(req.user.sub, req.user.fullName || req.user.username);
  }
}
