// Утилиты валидации для всего приложения

/**
 * Валидация формата даты ДД.ММ.ГГГГ
 */
export const validateDate = (dateStr: string): boolean => {
  if (!dateStr) return true; // Пустая дата допустима
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return false;
  const [, day, month, year] = match;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (y < 2000 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
};

/**
 * Валидация формата телефона
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Пустой телефон допустим
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Валидация формата email
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Пустой email допустим
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Форматирование сообщения об ошибке даты
 */
export const getDateErrorMessage = (fieldName: string, value: string): string => {
  return `Некорректная дата "${fieldName}": ${value}. Формат: ДД.ММ.ГГГГ`;
};

/**
 * Форматирование сообщения об ошибке телефона
 */
export const getPhoneErrorMessage = (value: string): string => {
  return `Некорректный формат телефона: ${value}. Пример: +7 (999) 123-45-67`;
};

/**
 * Форматирование сообщения об ошибке email
 */
export const getEmailErrorMessage = (value: string): string => {
  return `Некорректный формат email: ${value}. Пример: user@example.com`;
};
