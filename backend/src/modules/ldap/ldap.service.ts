import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as ldap from 'ldapjs';
import * as crypto from 'crypto';

@Injectable()
export class LdapService {
  constructor(private prisma: PrismaService) {}

  // Шифрование пароля
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.padEnd(32, '0')), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Дешифрование пароля
  private decrypt(encrypted: string): string {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!';
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.padEnd(32, '0')), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Получить настройки LDAP
  async getSettings() {
    const settings = await this.prisma.ldapSettings.findFirst();
    if (!settings) {
      return null;
    }
    // Не возвращаем зашифрованный пароль
    return {
      ...settings,
      bindPassword: settings.bindPassword ? '••••••••' : '',
    };
  }

  // Сохранить настройки LDAP
  async saveSettings(data: {
    host: string;
    port: number;
    baseDn: string;
    bindDn: string;
    bindPassword?: string;
    useSsl: boolean;
    searchFilter: string;
    titleAttribute: string;
    titleValue: string;
    enabled: boolean;
  }) {
    const existing = await this.prisma.ldapSettings.findFirst();

    const settingsData = {
      host: data.host,
      port: data.port,
      baseDn: data.baseDn,
      bindDn: data.bindDn,
      useSsl: data.useSsl,
      searchFilter: data.searchFilter,
      titleAttribute: data.titleAttribute,
      titleValue: data.titleValue,
      enabled: data.enabled,
    };

    // Если пароль предоставлен, шифруем его
    if (data.bindPassword && data.bindPassword !== '••••••••') {
      (settingsData as any).bindPassword = this.encrypt(data.bindPassword);
    }

    if (existing) {
      return this.prisma.ldapSettings.update({
        where: { id: existing.id },
        data: settingsData,
      });
    } else {
      if (!data.bindPassword) {
        throw new BadRequestException('Необходимо указать пароль для подключения к LDAP');
      }
      return this.prisma.ldapSettings.create({
        data: {
          ...settingsData,
          bindPassword: this.encrypt(data.bindPassword),
        },
      });
    }
  }

  // Проверка подключения к LDAP
  async testConnection() {
    const settings = await this.prisma.ldapSettings.findFirst();
    if (!settings) {
      throw new NotFoundException('Настройки LDAP не найдены');
    }

    try {
      const client = ldap.createClient({
        url: `${settings.useSsl ? 'ldaps' : 'ldap'}://${settings.host}:${settings.port}`,
      });

      const password = this.decrypt(settings.bindPassword);

      return new Promise((resolve, reject) => {
        client.bind(settings.bindDn, password, (err) => {
          if (err) {
            reject(new BadRequestException('Ошибка подключения к LDAP: ' + err.message));
          } else {
            client.unbind();
            resolve({ success: true, message: 'Подключение успешно' });
          }
        });
      });
    } catch (error) {
      throw new BadRequestException('Ошибка подключения к LDAP: ' + error.message);
    }
  }

  // Синхронизация пользователей из AD
  async syncUsers(userId: string, userName: string) {
    const settings = await this.prisma.ldapSettings.findFirst();
    if (!settings || !settings.enabled) {
      throw new BadRequestException('Синхронизация LDAP не настроена или отключена');
    }

    try {
      const client = ldap.createClient({
        url: `${settings.useSsl ? 'ldaps' : 'ldap'}://${settings.host}:${settings.port}`,
      });

      const password = this.decrypt(settings.bindPassword);

      return new Promise(async (resolve, reject) => {
        client.bind(settings.bindDn, password, async (err) => {
          if (err) {
            reject(new BadRequestException('Ошибка подключения к LDAP: ' + err.message));
            return;
          }

          // Поиск пользователей с указанной должностью
          const opts: ldap.SearchOptions = {
            filter: `(&${settings.searchFilter}(${settings.titleAttribute}=${settings.titleValue}))`,
            scope: 'sub',
            attributes: ['cn', 'mail', 'sAMAccountName', 'userAccountControl', settings.titleAttribute],
          };

          const ldapUsers: any[] = [];

          client.search(settings.baseDn, opts, (err, res) => {
            if (err) {
              reject(new BadRequestException('Ошибка поиска в LDAP: ' + err.message));
              return;
            }

            res.on('searchEntry', (entry) => {
              ldapUsers.push(entry.object);
            });

            res.on('error', (err) => {
              reject(new BadRequestException('Ошибка обработки результатов LDAP: ' + err.message));
            });

            res.on('end', async () => {
              try {
                const results = {
                  added: 0,
                  updated: 0,
                  disabled: 0,
                  errors: [] as string[],
                };

                for (const ldapUser of ldapUsers) {
                  const username = ldapUser.sAMAccountName || ldapUser.cn;
                  const email = ldapUser.mail || '';
                  const fullName = ldapUser.cn || username;
                  
                  // Проверка статуса учетной записи (userAccountControl)
                  // 512 = активна, 514 = отключена
                  const isActive = !ldapUser.userAccountControl || 
                                   (ldapUser.userAccountControl & 2) === 0;

                  // Поиск существующего ТУ
                  const existingTU = await this.prisma.tU.findFirst({
                    where: {
                      OR: [
                        { email: email },
                        { fullName: fullName },
                      ],
                    },
                  });

                  if (existingTU) {
                    // Обновление существующего ТУ
                    await this.prisma.tU.update({
                      where: { id: existingTU.id },
                      data: {
                        fullName: fullName,
                        email: email,
                        isActive: isActive,
                      },
                    });
                    results.updated++;
                    if (!isActive) results.disabled++;
                  } else {
                    // Создание нового ТУ
                    try {
                      await this.prisma.tU.create({
                        data: {
                          fullName: fullName,
                          email: email,
                          position: settings.titleValue,
                          isActive: isActive,
                        },
                      });
                      results.added++;

                      // Логирование
                      await this.prisma.auditLog.create({
                        data: {
                          userId: userId,
                          userName: userName,
                          action: 'create_tu',
                          field: 'tu',
                          newValue: fullName,
                          details: `Создан ТУ ${fullName} из AD`,
                        },
                      });
                    } catch (error) {
                      results.errors.push(`Ошибка создания ТУ ${fullName}: ${error.message}`);
                    }
                  }
                }

                // Обновление времени последней синхронизации
                await this.prisma.ldapSettings.update({
                  where: { id: settings.id },
                  data: { lastSyncAt: new Date() },
                });

                client.unbind();
                resolve(results);
              } catch (error) {
                reject(new BadRequestException('Ошибка обработки пользователей: ' + error.message));
              }
            });
          });
        });
      });
    } catch (error) {
      throw new BadRequestException('Ошибка синхронизации с LDAP: ' + error.message);
    }
  }
}
