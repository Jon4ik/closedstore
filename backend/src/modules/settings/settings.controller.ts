import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('ldap')
  async getLdap(@Request() req) {
    return this.settingsService.getLdapConfig();
  }

  @Put('ldap')
  @RequirePermissions('settings')
  async updateLdap(@Body() body: any, @Request() req) {
    const result = await this.settingsService.updateLdapConfig(body, req.user.sub);
    return result;
  }

  @Post('ldap/test')
  @RequirePermissions('settings')
  async testLdap() {
    return this.settingsService.testConnection();
  }

  @Post('ldap/sync-tus')
  @RequirePermissions('ldap_sync')
  async syncTus(@Request() req) {
    return this.settingsService.syncTusWithAd(req.user.sub);
  }
}
