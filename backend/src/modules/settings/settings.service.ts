import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LdapService } from './ldap.service';
import { encryptSecret } from './crypto.util';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private ldapService: LdapService,
  ) {}

  // Гарантируем существование записи настроек
  async ensureConfig() {
    let config = await this.prisma.ldapConfig.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await this.prisma.ldapConfig.create({ data: { id: 'default' } });
    }
    return config;
  }

  // Публичные настройки (без зашифрованного пароля) + флаг заполненности
  async getLdapConfig() {
    const config = await this.ensureConfig();
    const isConfigured = Boolean(config.url && config.bindDn && config.baseDn && config.bindPasswordEnc);
    return {
      enabled: config.enabled,
      url: config.url,
      bindDn: config.bindDn,
      baseDn: config.baseDn,
      searchFilter: config.searchFilter,
      titleAttribute: config.titleAttribute,
      lastSyncAt: config.lastSyncAt,
      hasPassword: Boolean(config.bindPasswordEnc),
      isConfigured,
    };
  }

  async updateLdapConfig(data: any, userId?: string) {
    const current = await this.ensureConfig();

    const update: any = {};
    for (const field of ['enabled', 'url', 'bindDn', 'baseDn', 'searchFilter', 'titleAttribute']) {
      if (data[field] !== undefined) update[field] = data[field];
    }

    // Пароль никогда не возвращается клиенту; пустая строка/undefined — не менять
    if (typeof data.bindPassword === 'string' && data.bindPassword.length > 0) {
      update.bindPasswordEnc = encryptSecret(data.bindPassword);
    } else if (data.bindPassword === '') {
      // явная очистка не предусмотрена — игнорируем
    }

    const config = await this.prisma.ldapConfig.update({ where: { id: current.id }, data: update });

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'update_settings',
          field: 'ldap',
          details: 'Изменены настройки LDAP',
        },
      });
    }

    return {
      enabled: config.enabled,
      url: config.url,
      bindDn: config.bindDn,
      baseDn: config.baseDn,
      searchFilter: config.searchFilter,
      titleAttribute: config.titleAttribute,
      lastSyncAt: config.lastSyncAt,
      hasPassword: Boolean(config.bindPasswordEnc),
      isConfigured: Boolean(config.url && config.bindDn && config.baseDn && config.bindPasswordEnc),
    };
  }

  // Синхронизация справочника ТУ с AD:
  // - ищем пользователей с title "Территориальный управляющий"
  // - добавляем новых в справочник ТУ
  // - если УЗ выключена в AD — деактивируем в системе
  async syncTusWithAd(userId?: string) {
    const persons = await this.ldapService.findTerritorialManagers();
    const tus = await this.prisma.tU.findMany();

    const created: string[] = [];
    const updated: string[] = [];
    const deactivated: string[] = [];

    for (const person of persons) {
      if (!person.displayName && !person.sAMAccountName) continue;

      const fullName = (person.displayName || person.sAMAccountName).trim();
      const adAccount = person.sAMAccountName || null;

      // Поиск существующей записи: по adAccount, иначе по ФИО
      let tu = tus.find((t) => adAccount && (t as any).adAccount === adAccount);
      if (!tu) {
        tu = tus.find((t) => t.fullName.toLowerCase() === fullName.toLowerCase());
      }

      if (tu) {
        const patch: any = {};
        if ((tu as any).adAccount !== adAccount && adAccount) (patch as any).adAccount = adAccount;
        if (tu.isActive === person.disabled) patch.isActive = !person.disabled;
        if (person.email && tu.email !== person.email) patch.email = person.email;
        if (person.phone && tu.phone !== person.phone) patch.phone = person.phone;

        if (Object.keys(patch).length > 0) {
          await this.prisma.tU.update({ where: { id: tu.id }, data: patch });
          updated.push(fullName);
          if (patch.isActive === false) deactivated.push(fullName);
        }
      } else {
        await this.prisma.tU.create({
          data: {
            fullName,
            position: person.title || 'Территориальный управляющий',
            phone: person.phone || null,
            email: person.email || null,
            isActive: !person.disabled,
          } as any,
        });
        created.push(fullName);
      }

      // Если учётка есть в системе (users) — синхронизируем активность
      if (adAccount) {
        const systemUser = await this.prisma.user.findFirst({ where: { username: adAccount } });
        if (systemUser && systemUser.isActive === person.disabled) {
          await this.prisma.user.update({
            where: { id: systemUser.id },
            data: { isActive: !person.disabled, adAccount },
          });
        }
      }
    }

    // Отключаем ТУ, которые есть в системе с признаком AD, но пропали из выборки AD как активные
    for (const tu of tus) {
      const inAd = persons.find((p) => (p.sAMAccountName && (tu as any).adAccount === p.sAMAccountName));
      if (!inAd && (tu as any).adAccount && tu.isActive) {
        // запись была создана из AD, но больше не находится — отключаем
        await this.prisma.tU.update({ where: { id: tu.id }, data: { isActive: false } });
        deactivated.push(tu.fullName);
      }
    }

    await this.prisma.ldapConfig.update({ where: { id: 'default' }, data: { lastSyncAt: new Date() } });

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'ldap_sync',
          field: 'tus',
          details: `Синхронизация ТУ с AD: добавлено ${created.length}, обновлено ${updated.length}, отключено ${deactivated.length}`,
        },
      });
    }

    return {
      total: persons.length,
      created,
      updated,
      deactivated,
    };
  }

  // Проверка подключения к AD (для страницы настроек)
  async testConnection(): Promise<{ success: boolean; found: number; error?: string }> {
    try {
      const persons = await this.ldapService.findTerritorialManagers();
      return { success: true, found: persons.length };
    } catch (e: any) {
      return { success: false, found: 0, error: e?.message || 'Ошибка подключения' };
    }
  }
}
