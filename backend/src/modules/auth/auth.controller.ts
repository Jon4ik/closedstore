import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/profile')
  async updateMyProfile(@Request() req, @Body() body: UpdateMyProfileDto) {
    return this.authService.updateMyProfile(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/change-password')
  async changeMyPassword(@Request() req, @Body() body: ChangeMyPasswordDto) {
    return this.authService.changeMyPassword(req.user.sub, body.currentPassword, body.newPassword);
  }
}
