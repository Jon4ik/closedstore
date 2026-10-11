import { Injectable, UnauthorizedException, TooManyRequestsException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

@Injectable()
export class AuthService {
  private readonly failedLogins = new Map<string, { count: number; firstAt: number }>();

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private assertLoginAllowed(username: string) {
    const key = username.trim().toLowerCase().slice(0, 64);
    const current = this.failedLogins.get(key);
    if (!current) return key;
    if (Date.now() - current.firstAt >= WINDOW_MS) {
      this.failedLogins.delete(key);
      return key;
    }
    if (current.count >= MAX_FAILURES) throw new TooManyRequestsException('Слишком много неудачных попыток. Повторите через 15 минут.');
    return key;
  }

  private recordFailure(key: string) {
    const now = Date.now();
    for (const [storedKey, entry] of this.failedLogins) {
      if (now - entry.firstAt >= WINDOW_MS) this.failedLogins.delete(storedKey);
    }
    if (this.failedLogins.size >= 10000 && !this.failedLogins.has(key)) {
      const oldestKey = this.failedLogins.keys().next().value;
      if (oldestKey) this.failedLogins.delete(oldestKey);
    }
    const current = this.failedLogins.get(key);
    if (!current || now - current.firstAt >= WINDOW_MS) {
      this.failedLogins.set(key, { count: 1, firstAt: now });
    } else {
      current.count += 1;
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, include: { role: true } });
    // Keep the external response identical for unknown users and bad passwords.
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверные учётные данные');
    }
    return user;
  }

  async login(username: string, password: string) {
    const key = this.assertLoginAllowed(String(username || ''));
    let user;
    try {
      user = await this.validateUser(String(username || ''), String(password || ''));
    } catch (error) {
      if (error instanceof UnauthorizedException) this.recordFailure(key);
      throw error;
    }
    this.failedLogins.delete(key);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.roleId,
      ver: user.tokenVersion,
    };

    await this.prisma.auditLog.create({
      data: { userId: user.id, userName: user.fullName, action: 'login', field: 'session', details: 'Вход в систему' },
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
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { username: true, fullName: true } });
      if (!user) throw new UnauthorizedException();
      await tx.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
      await tx.auditLog.create({
        data: { userId, userName: user.fullName, action: 'logout', field: 'session', details: 'Выход выполнен; все ранее выданные токены отозваны' },
      });
    });
    return { message: 'Выход выполнен; сессии отозваны' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, fullName: true, isActive: true, role: { select: { name: true, permissions: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { id: user.id, username: user.username, fullName: user.fullName, role: user.role.name, permissions: user.role.permissions };
  }
}
