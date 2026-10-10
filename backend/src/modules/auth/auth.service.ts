import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Неверные учётные данные');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Учетная запись отключена. Обратитесь к администратору.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учётные данные');
    }

    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.roleId,
      permissions: user.role.permissions,
    };

    // Log login
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        field: 'session',
        details: 'Вход в систему',
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.roleId,
        permissions: user.role.permissions,
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'logout',
        field: 'session',
        details: 'Выход из системы',
      },
    });
    return { message: 'Выход выполнен' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role.name,
      permissions: user.role.permissions,
    };
  }
}
