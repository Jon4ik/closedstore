import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({ value, onChange, placeholder = '+7(xxx)xxx-xx-xx', className = '' }: PhoneInputProps) {
  const formatPhone = (input: string): string => {
    // Удаляем все кроме цифр и +
    let digits = input.replace(/[^\d+]/g, '');
    
    // Если начинается с 8, заменяем на +7
    if (digits.startsWith('8')) {
      digits = '+7' + digits.slice(1);
    }
    
    // Если не начинается с +7, добавляем
    if (!digits.startsWith('+7') && digits.length > 0) {
      digits = '+7' + digits.replace(/^\+?7?/, '');
    }
    
    // Убираем + для обработки
    const numbers = digits.replace(/\+/g, '');
    
    // Форматируем по маске +7(xxx)xxx-xx-xx
    let formatted = '+7';
    if (numbers.length > 1) {
      formatted += '(' + numbers.slice(1, 4);
    }
    if (numbers.length >= 4) {
      formatted += ')';
    }
    if (numbers.length > 4) {
      formatted += numbers.slice(4, 7);
    }
    if (numbers.length > 7) {
      formatted += '-' + numbers.slice(7, 9);
    }
    if (numbers.length > 9) {
      formatted += '-' + numbers.slice(9, 11);
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      maxLength={18}
    />
  );
}
