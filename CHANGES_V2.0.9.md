# 📋 Список изменений v2.0.9

## ✅ Выполненные изменения

### 1. Таблица объектов - Комментарии и история
- ✅ В StoreCard комментарии теперь отображают ФИО пользователя из справочника users по userId
- ✅ Если пользователь не найден, отображается userName из комментария

### 2. Открытия - Тип работ по умолчанию
- ✅ Добавлен defaultWorkType в store
- ✅ openAddModal принимает параметр defaultWorkType
- ✅ StoreTable передает 'Открытие' при клике на "Добавить открытие"
- ✅ AddStoreModal использует defaultWorkType из store

---

## ⏳ Ожидаемые изменения

### 3. Логирование в аудит для всех подсистем
**Требуется:** Добавить логирование для всех действий во всех модулях

**Файлы для обновления:**
- `backend/src/modules/users/users.service.ts` - логирование создания/обновления/удаления пользователей
- `backend/src/modules/tus/tus.service.ts` - логирование создания/обновления/удаления ТУ
- `backend/src/modules/roles/roles.service.ts` - логирование создания/обновления/удаления ролей
- `backend/src/modules/auth/auth.service.ts` - уже есть логирование входа/выхода

**Пример кода для users.service.ts:**
```typescript
async create( any) {
  // ... существующий код ...
  const user = await this.prisma.user.create({ ... });
  
  // Добавить логирование
  await this.prisma.auditLog.create({
     {
      userId: userId, // ID текущего пользователя
      userName: userName, // Имя текущего пользователя
      action: 'create_user',
      field: 'user',
      newValue: user.username,
      details: `Создан пользователь ${user.fullName}`,
    },
  });
  
  return user;
}
```

### 4. Адаптивная темная тема
**Требуется:** 
1. Добавить поле `theme` в схему User (light/dark/system)
2. Создать ThemeContext для управления темой
3. Обновить все компоненты для поддержки темной темы
4. Добавить переключатель темы в профиле пользователя

**Файлы для создания/обновления:**
- `backend/prisma/schema.prisma` - добавить поле theme
- `src/context/ThemeContext.tsx` - создать контекст темы
- `src/App.tsx` - обернуть в ThemeProvider
- `tailwind.config.js` - добавить darkMode: 'class'
- Все компоненты - добавить классы dark:

**Пример tailwind.config.js:**
```javascript
export default {
  darkMode: 'class',
  // ... остальная конфигурация
}
```

**Пример ThemeContext.tsx:**
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'system', setTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### 5. Убрать из seed ТУ
**Требуется:** Удалить из `src/data/seed.ts` следующих ТУ:
- Беляева Анна
- Дрямова Валентина
- Зотов Денис

**Файл для обновления:**
- `src/data/seed.ts` - удалить указанные ТУ из массива seedTUs

### 6. Профиль пользователя
**Требуется:** Создать страницу профиля с возможностью:
- Изменить пароль
- Изменить имя (fullName)
- Указать ID чата для уведомлений в мессенджере
- Выбрать тему (light/dark/system)

**Файлы для создания/обновления:**
- `src/pages/ProfilePage.tsx` - создать страницу профиля
- `src/App.tsx` - добавить роут для профиля
- `backend/src/modules/users/users.service.ts` - добавить методы updateProfile, changePassword
- `backend/src/modules/users/users.controller.ts` - добавить endpoints
- `backend/prisma/schema.prisma` - добавить поля chatId, theme
- `src/components/Layout.tsx` - добавить кнопку перехода в профиль

**Пример ProfilePage.tsx:**
```typescript
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { currentUser, updateUser } = useStore();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [chatId, setChatId] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async () => {
    if (currentUser) {
      await updateUser(currentUser.id, { fullName, chatId });
      alert('Профиль обновлен');
    }
  };

  const handleChangePassword = async () => {
    // Вызов API для смены пароля
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Профиль</h1>
      
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label>Имя</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        
        <div>
          <label>ID чата для уведомлений</label>
          <input value={chatId} onChange={e => setChatId(e.target.value)} />
        </div>
        
        <div>
          <label>Тема</label>
          <select value={theme} onChange={e => setTheme(e.target.value as any)}>
            <option value="light">Светлая</option>
            <option value="dark">Темная</option>
            <option value="system">Системная</option>
          </select>
        </div>
        
        <button onClick={handleSave}>Сохранить</button>
      </div>
      
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2>Изменить пароль</h2>
        <input type="password" placeholder="Старый пароль" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
        <input type="password" placeholder="Новый пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <button onClick={handleChangePassword}>Изменить пароль</button>
      </div>
    </div>
  );
}
```

### 7. Убрать "Реконструкция — Закрытие" из header
**Требуется:** Удалить заголовок из Layout.tsx

**Файл для обновления:**
- `src/components/Layout.tsx` - удалить или скрыть заголовок

**Пример:**
```typescript
<header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
  <div className="flex items-center gap-3">
    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
      <Menu size={24} />
    </button>
    {/* Удалить или закомментировать: */}
    {/* <h2 className="text-lg font-semibold text-gray-800">Реконструкция — Закрытие</h2> */}
  </div>
  {/* ... остальной код ... */}
</header>
```

### 8. Динамический title
**Требуется:** Обновлять title страницы в зависимости от текущей страницы

**Файл для обновления:**
- `src/App.tsx` - добавить useEffect для обновления document.title

**Пример:**
```typescript
useEffect(() => {
  const titles: Record<string, string> = {
    dashboard: 'Панель управления',
    table: 'Таблица объектов',
    calendar: 'Календарь',
    users: 'Пользователи',
    roles: 'Роли',
    tus: 'Справочник ТУ',
    audit: 'Аудит',
    profile: 'Профиль',
  };
  
  document.title = `${titles[currentPage] || 'Главная'} - Реконструкция`;
}, [currentPage]);
```

### 9. Динамическое обновление данных после редактирования
**Требуется:** После любого изменения данных автоматически перезагружать данные из API

**Файлы для обновления:**
- `src/store/useStore.ts` - после addProject, updateProject, deleteProject вызывать loadProjects
- `src/store/useStore.ts` - после addTU, updateTU, deleteTU вызывать loadTUs
- `src/store/useStore.ts` - после addUser, updateUser, deleteUser вызывать loadUsers
- `src/store/useStore.ts` - после addRole, updateRole, deleteRole вызывать loadRoles

**Пример:**
```typescript
addProject: async (projectData) => {
  try {
    const project = await apiClient.createProject(projectData);
    await get().loadProjects(); // Уже есть
    await get().loadAuditLog(); // Уже есть
  } catch (error) {
    console.error('Failed to add project:', error);
    throw error;
  }
},
```

### 10. Возможность сворачивать боковое меню
**Требуется:** Добавить кнопку для сворачивания/разворачивания sidebar

**Файл для обновления:**
- `src/components/Layout.tsx` - добавить состояние sidebarCollapsed и кнопку

**Пример:**
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

<aside className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r ...`}>
  <div className="flex items-center justify-between h-16 px-4 border-b">
    {!sidebarCollapsed && <h1 className="text-lg font-bold text-blue-700">РиЗ</h1>}
    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
      {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  </div>
  
  <nav className="p-4 space-y-1">
    {navItems.map(item => (
      <button key={item.id} onClick={() => { onNavigate(item.id); }}
        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg ...`}>
        <item.icon size={18} />
        {!sidebarCollapsed && item.label}
      </button>
    ))}
  </nav>
</aside>

<div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
  {/* ... остальной код ... */}
</div>
```

---

## 📝 Приоритет изменений

1. **Высокий приоритет:**
   - Убрать из seed ТУ (простое изменение)
   - Убрать заголовок из header (простое изменение)
   - Динамический title (простое изменение)
   - Динамическое обновление данных (уже частично реализовано)

2. **Средний приоритет:**
   - Возможность сворачивать боковое меню
   - Логирование в аудит для всех подсистем

3. **Низкий приоритет (требует больше времени):**
   - Адаптивная темная тема
   - Профиль пользователя

---

## 🚀 Обновление на сервере

После внесения всех изменений:

```bash
cd ~/store-reconstruction
git pull
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d
```

---

**Версия:** 2.0.9  
**Дата:** 2026-10-10  
**Статус:** ⏳ В процессе реализации
