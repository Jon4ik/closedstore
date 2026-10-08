import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
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
  create(@Body() body: any) {
    return this.tusService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tusService.update(id, body);
  }
}
