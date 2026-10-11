import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('view_users')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('view_users')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('manage_users')
  create(@Body() body: CreateUserDto, @Request() req) {
    return this.usersService.create(body, req.user.sub, req.user.username);
  }

  @Put(':id')
  @RequirePermissions('manage_users')
  update(@Param('id') id: string, @Body() body: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, body, req.user.sub, req.user.username);
  }

  @Delete(':id')
  @RequirePermissions('manage_users')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.sub, req.user.username);
  }
}
