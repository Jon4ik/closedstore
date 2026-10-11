import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions('view_audit')
  findAll(@Query() query: any) {
    return this.auditService.findAll(query);
  }

  @Delete('clear')
  @RequirePermissions('clear_audit')
  clearAll() {
    return this.auditService.clearAll();
  }
}
