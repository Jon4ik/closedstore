import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TUsService } from './tus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tus')
@UseGuards(JwtAuthGuard)
export class TUsController {
  constructor(private tusService: TUsService) {}

  @Get()
  findAll() {
    return this.tusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tusService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.tusService.create(body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.tusService.update(id, body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tusService.remove(id, req.user.sub, req.user.fullName || req.user.username);
  }
}
