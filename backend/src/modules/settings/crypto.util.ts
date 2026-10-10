import * as crypto from 'crypto';

// Ключ шифрования настраивается через переменную окружения SETTINGS_ENCRYPTION_KEY.
// Если ключ не задан — используется детерминированный вывод из JWT_SECRET
// (в production оба значения должны быть заданы в .env).
function getEncryptionKey(): Buffer {
  const secret =
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'default-secret-change-me';
  return crypto.createHash('sha256').update(secret).digest();
}

// AES-256-GCM: iv(12) | authTag(16) | ciphertext — всё в base64
export function encryptSecret(plain: string): string {
  if (!plain) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptSecret(encoded: string): string {
  if (!encoded) return '';
  try {
    const key = getEncryptionKey();
    const raw = Buffer.from(encoded, 'base64');
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}
