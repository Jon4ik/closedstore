// Форматирование даты из ISO в ДД.ММ.ГГГГ
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  
  // Если уже в формате ДД.ММ.ГГГГ
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Если ISO формат
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return '—';
  }
};

// Валидация даты в формате ДД.ММ.ГГГГ
export const validateDate = (dateStr: string): boolean => {
  if (!dateStr) return true;
  
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

// Валидация номера магазина (только 4 цифры)
export const validateStoreNumber = (storeNumber: string): boolean => {
  if (!storeNumber) return false;
  return /^\d{1,4}$/.test(storeNumber);
};

// Валидация телефона
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Валидация email
export const validateEmail = (email: string): boolean => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
