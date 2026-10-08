import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.storesService.findAll(query);
  }

  @Get('dashboard')
  getDashboard() {
    return this.storesService.getDashboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.storesService.create(body, req.user.sub, req.user.username);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.storesService.update(id, body, req.user.sub, req.user.username);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.storesService.remove(id, req.user.sub, req.user.username);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.storesService.restore(id);
  }
}
