import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.rolesService.create(body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.rolesService.update(id, body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.rolesService.remove(id, req.user.sub, req.user.fullName || req.user.username);
  }
}
