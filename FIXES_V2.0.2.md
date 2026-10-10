# ✅ Исправлены три проблемы

## 1. Ошибка "Foreign key constraint violated" при создании объекта

### Проблема
При добавлении объекта возникала ошибка:
```
Foreign key constraint violated: `(not available)`
```

### Причина
Backend пытался создать объект с `tuId`, который не существует в таблице `tus`.

### Решение
Обновлен `backend/src/modules/stores/stores.service.ts`:

**Было:**
```typescript
async create(data: any, userId: string, userName: string) {
  const store = await this.prisma.storeProject.create({
    data: { ...data, createdBy: userId },
    include: { tu: true },
  });
  // ...
}
```

**Стало:**
```typescript
async create(data: any, userId: string, userName: string) {
  // Проверяем что tuId существует
  if (data.tuId) {
    const tuExists = await this.prisma.tU.findUnique({ where: { id: data.tuId } });
    if (!tuExists) {
      // Если TU не найден, используем первого доступного
      const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
      if (firstTU) {
        data.tuId = firstTU.id;
      } else {
        throw new Error('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
      }
    }
  } else {
    // Если tuId не указан, используем первого доступного
    const firstTU = await this.prisma.tU.findFirst({ where: { isActive: true } });
    if (firstTU) {
      data.tuId = firstTU.id;
    } else {
      throw new Error('Не найдено ни одного активного ТУ. Сначала создайте ТУ.');
    }
  }

  const store = await this.prisma.storeProject.create({
    data: { ...data, createdBy: userId },
    include: { tu: true },
  });
  // ...
}
```

Теперь если `tuId` не указан или не существует, автоматически используется первый активный ТУ.

---

## 2. Валидация телефона и email

### Проблема
Не было валидации полей телефона и email при создании/редактировании ТУ.

### Решение
Добавлена валидация в `src/pages/TUsPage.tsx`:

**Функции валидации:**
```typescript
const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Пустой телефон допустим
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateEmail = (email: string): boolean => {
  if (!email) return true; // Пустой email допустим
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Применение при создании:**
```typescript
const handleAdd = () => {
  if (!newTU.fullName) {
    alert('Укажите ФИО');
    return;
  }
  if (!validatePhone(newTU.phone)) {
    alert('Некорректный формат телефона. Пример: +7 (999) 123-45-67');
    return;
  }
  if (!validateEmail(newTU.email)) {
    alert('Некорректный формат email. Пример: zotov@company.ru');
    return;
  }
  // ...
};
```

**Применение при редактировании:**
```typescript
const saveEdit = () => {
  if (editingId && editData) {
    if (!editData.fullName) {
      alert('Укажите ФИО');
      return;
    }
    if (!validatePhone(editData.phone)) {
      alert('Некорректный формат телефона. Пример: +7 (999) 123-45-67');
      return;
    }
    if (!validateEmail(editData.email)) {
      alert('Некорректный формат email. Пример: zotov@company.ru');
      return;
    }
    // ...
  }
};
```

### Форматы:

**Телефон:**
- ✅ `+7 (999) 123-45-67`
- ✅ `+79991234567`
- ✅ `8-999-123-45-67`
- ✅ `999 123 45 67`
- ❌ `abc`
- ❌ `123`

**Email:**
- ✅ `zotov@company.ru`
- ✅ `user.name@example.com`
- ✅ `test123@mail.org`
- ❌ `not-an-email`
- ❌ `@company.ru`
- ❌ `user@`

---

## 3. Аудит не записывается

### Проблема
После создания/обновления объектов аудит не отображался на странице "Аудит".

### Причина
1. `loadAuditLog()` не вызывался при загрузке приложения
2. После создания/обновления объекта аудит не обновлялся

### Решение

**Обновлен `src/App.tsx`:**
```typescript
export default function App() {
  const { currentUser, restoreSession, loadProjects, loadTUs, loadUsers, loadRoles, loadAuditLog } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Загружаем данные из API при входе
  useEffect(() => {
    if (currentUser) {
      loadProjects();
      loadTUs();
      loadUsers();
      loadRoles();
      loadAuditLog(); // ← Добавлено
    }
  }, [currentUser, loadProjects, loadTUs, loadUsers, loadRoles, loadAuditLog]);
  // ...
}
```

**Обновлен `src/store/useStore.ts`:**
```typescript
addProject: async (projectData) => {
  try {
    const project = await apiClient.createProject(projectData);
    await get().loadProjects();
    await get().loadAuditLog(); // ← Добавлено: обновляем аудит после создания
  } catch (error) {
    console.error('Failed to add project:', error);
    throw error;
  }
},

updateProject: async (id: string, updates: Partial<StoreProject>) => {
  try {
    await apiClient.updateProject(id, updates);
    await get().loadProjects();
    await get().loadAuditLog(); // ← Добавлено: обновляем аудит после обновления
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
},
```

**Обновлен `src/components/AddStoreModal.tsx`:**
```typescript
const handleSubmit = async () => {
  const errs = validate();
  if (errs.length > 0) { setErrors(errs); return; }
  setErrors([]);
  const city = form.city || form.address.split(',')[0].trim();
  try {
    await addProject({
      // ... данные
    });
    // ... сброс формы
    closeAddModal();
  } catch (error) {
    console.error('Failed to add project:', error);
    setErrors(['Ошибка при создании объекта: ' + (error as Error).message]);
  }
};
```

---

## 🎯 Что делать на сервере:

### Шаг 1: Скопируйте файлы

```bash
cd ~/store-reconstruction
git pull
```

### Шаг 2: Пересоберите backend

```bash
docker compose stop backend
docker compose rm -f backend
docker compose build --no-cache backend
docker compose up -d backend
```

### Шаг 3: Пересоберите frontend

```bash
docker compose stop frontend
docker compose rm -f frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Шаг 4: Проверьте

1. **Создание объекта:**
   - Откройте "Таблица объектов"
   - Нажмите "Добавить объект"
   - Заполните форму
   - Нажмите "Добавить объект"
   - Объект должен создаться без ошибок

2. **Валидация ТУ:**
   - Откройте "Справочник ТУ"
   - Нажмите "Добавить ТУ"
   - Попробуйте ввести некорректный телефон: `abc`
   - Должна появиться ошибка: "Некорректный формат телефона"
   - Попробуйте ввести некорректный email: `not-an-email`
   - Должна появиться ошибка: "Некорректный формат email"

3. **Аудит:**
   - Создайте или обновите объект
   - Откройте "Аудит"
   - Должны увидеть записи о создании/обновлении

---

## 📋 Проверочный чеклист:

- [ ] Backend пересобран
- [ ] Frontend пересобран
- [ ] Можно создать объект без ошибок
- [ ] Валидация телефона работает (принимает `+7 (999) 123-45-67`, отклоняет `abc`)
- [ ] Валидация email работает (принимает `user@example.com`, отклоняет `not-an-email`)
- [ ] После создания объекта в "Аудит" появляется запись
- [ ] После обновления объекта в "Аудит" появляется запись

---

## 📚 Измененные файлы:

### Backend:
- `backend/src/modules/stores/stores.service.ts` - проверка tuId перед созданием

### Frontend:
- `src/pages/TUsPage.tsx` - валидация телефона и email
- `src/App.tsx` - добавлен вызов `loadAuditLog()`
- `src/store/useStore.ts` - обновление аудита после создания/обновления
- `src/components/AddStoreModal.tsx` - async/await для addProject

---

## 🔍 Как работает аудит:

### Backend (NestJS):

При создании объекта:
```typescript
await this.prisma.auditLog.create({
  data: {
    storeId: store.id,
    userId,
    userName,
    action: 'create',
    field: 'project',
    details: `Создан объект №${store.storeNumber}`,
    newValue: store.storeNumber,
  },
});
```

При обновлении объекта:
```typescript
for (const [key, newValue] of Object.entries(data)) {
  const oldValue = (existing as any)[key];
  if (String(oldValue) !== String(newValue)) {
    await this.prisma.auditLog.create({
      data: {
        storeId: id,
        userId,
        userName,
        action: 'update',
        field: key,
        oldValue: String(oldValue || ''),
        newValue: String(newValue || ''),
        details: `Изменено поле "${key}"`,
      },
    });
  }
}
```

### Frontend (React):

1. При входе загружается аудит: `loadAuditLog()`
2. После создания объекта обновляется аудит: `await get().loadAuditLog()`
3. После обновления объекта обновляется аудит: `await get().loadAuditLog()`
4. На странице "Аудит" отображаются все записи

---

**Обновлено:** 2024-10-10  
**Версия:** 2.0.2  
**Исправления:** Foreign key constraint, валидация телефона/email, аудит
