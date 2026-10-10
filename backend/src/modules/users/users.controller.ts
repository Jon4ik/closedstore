import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.usersService.create(body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.usersService.update(id, body, req.user.sub, req.user.fullName || req.user.username);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.sub, req.user.fullName || req.user.username);
  }

  @Put('profile/:id')
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateProfile(id, body);
  }

  @Post('change-password/:id')
  changePassword(@Param('id') id: string, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.usersService.changePassword(id, body.oldPassword, body.newPassword);
  }
}
