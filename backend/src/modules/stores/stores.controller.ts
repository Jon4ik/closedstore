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

  // Комментарии
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.storesService.getComments(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: { text: string }, @Request() req) {
    return this.storesService.addComment(id, req.user.sub, req.user.fullName || req.user.username, body.text);
  }

  @Delete('comments/:commentId')
  deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.storesService.deleteComment(commentId, req.user.sub, req.user.fullName || req.user.username);
  }
}
