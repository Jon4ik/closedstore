import { Injectable, BadRequestException } from '@nestjs/common';
import * as ldap from 'ldapjs';
import { PrismaService } from '../../prisma.service';
import { decryptSecret } from './crypto.util';

export interface LdapPerson {
  sAMAccountName: string;
  displayName: string;
  title: string;
  email?: string;
  phone?: string;
  disabled: boolean; // учётная запись выключена в AD (UAC ACCOUNTDISABLE)
}

const UAC_ACCOUNTDISABLE = 0x2;
const UAC_LOCKOUT = 0x100;

@Injectable()
export class LdapService {
  constructor(private prisma: PrismaService) {}

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\5c')
      .replace(/\*/g, '\\2a')
      .replace(/\(/g, '\\28')
      .replace(/\)/g, '\\29')
      .replace(/\0/g, '\\00');
  }

  // Поиск пользователей AD с атрибутом title == "Территориальный управляющий"
  async findTerritorialManagers(title?: string): Promise<LdapPerson[]> {
    const config = await this.prisma.ldapConfig.findUnique({ where: { id: 'default' } });
    if (!config || !config.url || !config.bindDn || !config.baseDn || !config.bindPasswordEnc) {
      throw new BadRequestException('Настройки LDAP не заполнены. Сначала укажите их на странице «Настройки».');
    }

    const bindPassword = decryptSecret(config.bindPasswordEnc);
    if (!bindPassword) {
      throw new BadRequestException('Не удалось расшифровать пароль LDAP. Сохраните настройки повторно.');
    }

    const wantedTitle = title || 'Территориальный управляющий';
    const filter = `(&${config.searchFilter || '(objectClass=user)'}(${config.titleAttribute || 'title'}=${this.escape(wantedTitle)}))`;
    const attributes = [
      'sAMAccountName', 'displayName', 'cn', 'mail', 'telephoneNumber',
      config.titleAttribute || 'title', 'userAccountControl',
    ];

    const persons = await this.search(config.url, config.bindDn, bindPassword, config.baseDn, filter, attributes);
    return persons.map((p) => this.mapEntry(p));
  }

  private mapEntry(entry: any): LdapPerson {
    const get = (attr: string): string => {
      const raw = entry[attr];
      if (!raw) return '';
      if (Array.isArray(raw)) return String(raw[0] || '');
      if (typeof raw === 'object' && raw.buf) return raw.buf.toString('utf8');
      return String(raw);
    };

    const uac = parseInt(get('userAccountControl') || '0', 10) || 0;
    const disabled = (uac & UAC_ACCOUNTDISABLE) !== 0 || (uac & UAC_LOCKOUT) !== 0;

    return {
      sAMAccountName: get('sAMAccountName'),
      displayName: get('displayName') || get('cn'),
      title: get('title'),
      email: get('mail') || undefined,
      phone: get('telephoneNumber') || undefined,
      disabled,
    };
  }

  private search(url: string, bindDn: string, bindPassword: string, baseDn: string, filter: string, attributes: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const client = ldap.createClient({ url, timeout: 15000, connectTimeout: 15000 });

      const fail = (err: any) => {
        try { client.unbind(); } catch { /* ignore */ }
        reject(new BadRequestException(`Ошибка подключения к LDAP/AD: ${err?.message || err}`));
      };

      client.on('error', fail);
      client.on('connectError', fail);
      client.on('socketActivityTimeout', () => fail(new Error('Таймаут соединения с LDAP')));

      client.bind(bindDn, bindPassword, (err) => {
        if (err) return fail(err);

        client.search(baseDn, { scope: 'sub', filter, attributes }, (searchErr, res) => {
          if (searchErr) return fail(searchErr);

          const entries: any[] = [];
          res.on('searchEntry', (entry: any) => {
            const obj: any = {};
            const toObj = (a: any) => {
              if (a && typeof a.toJSON === 'function') return a.toJSON();
              return null;
            };
            const json = toObj(entry.object) || toObj(entry.pojo) || {};
            Object.assign(obj, json);
            // ldapjs v3: entry.attributes — массив {type, values}
            if (Array.isArray(entry.attributes)) {
              for (const a of entry.attributes) {
                const vals = Array.isArray(a.values) ? a.values : [a.values];
                obj[a.type] = vals.map((v: any) => (v && v.buffer ? Buffer.from(v.buffer).toString('utf8') : String(v)));
              }
            }
            entries.push(obj);
          });
          res.on('error', (e: any) => fail(e));
          res.on('end', () => {
            try { client.unbind(); } catch { /* ignore */ }
            resolve(entries);
          });
        });
      });
    });
  }
}
