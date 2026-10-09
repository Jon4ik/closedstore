# 🔧 Решение проблем с Prisma

## Ошибка: "No command registered for `migrate`"

### Проблема

При запуске миграций появляется ошибка:
```
✘ [CLI.UNKNOWN_COMMAND] No command registered for `migrate`, did you mean `migration`?
```

### Причина

У вас установлена старая версия Prisma CLI (версия < 3.0), где команда называлась `prisma migration`, а не `prisma migrate`.

### Решение

#### Вариант 1: Обновить Prisma (рекомендуется)

```bash
cd backend

# Обновить Prisma до последней версии
npm install @prisma/client@latest prisma@latest

# Проверить версию
npx prisma --version

# Сгенерировать клиент заново
npx prisma generate

cd ..
```

После этого запустите инициализацию заново:
```bash
./init-db.sh --sql
```

#### Вариант 2: Использовать старую команду

Если по какой-то причине нельзя обновить Prisma, используйте старую команду:

```bash
cd backend

# Для Prisma < 3.0
npx prisma migration apply

cd ..
```

#### Вариант 3: Автоматическое определение команды

Скрипт `apply-migrations.sh` автоматически определяет правильную команду:

```bash
cd backend
chmod +x apply-migrations.sh
./apply-migrations.sh
```

### Проверка версии Prisma

```bash
cd backend
npx prisma --version
```

Должно показать версию 5.x.x или выше.

### Различия в командах

| Версия Prisma | Команда миграции | Команда генерации |
|---------------|------------------|-------------------|
| < 3.0 | `prisma migration apply` | `prisma generate` |
| >= 3.0 | `prisma migrate deploy` | `prisma generate` |
| >= 5.0 | `prisma migrate deploy` | `prisma generate` |

### Полная переустановка Prisma

Если обновление не помогло:

```bash
cd backend

# Удалить Prisma
rm -rf node_modules/@prisma
rm -rf node_modules/.prisma
npm uninstall @prisma/client prisma

# Установить заново
npm install @prisma/client@latest prisma@latest

# Сгенерировать клиент
npx prisma generate

cd ..
```

### Очистка кэша

Если проблемы продолжаются:

```bash
cd backend

# Очистить кэш npm
npm cache clean --force

# Удалить node_modules
rm -rf node_modules
rm -rf package-lock.json

# Установить заново
npm install
npm install @prisma/client@latest prisma@latest

# Сгенерировать клиент
npx prisma generate

cd ..
```

## Другие ошибки Prisma

### Ошибка: "Prisma Client not generated"

```bash
cd backend
npx prisma generate
cd ..
```

### Ошибка: "Schema file not found"

Убедитесь, что файл `prisma/schema.prisma` существует:

```bash
ls -la backend/prisma/schema.prisma
```

### Ошибка: "Database connection failed"

Проверьте настройки в `.env`:

```bash
cat .env | grep DB_
```

Убедитесь, что:
- PostgreSQL запущен
- База данных создана
- Пользователь имеет права
- Порт доступен

## Полезные команды Prisma

```bash
cd backend

# Просмотр статуса миграций
npx prisma migrate status

# Создание новой миграции
npx prisma migrate dev --name description

# Применение миграций
npx prisma migrate deploy

# Сброс базы данных
npx prisma migrate reset

# Открытие Prisma Studio (GUI)
npx prisma studio

# Форматирование схемы
npx prisma format

# Валидация схемы
npx prisma validate

cd ..
```

## Поддержка

Если проблема не решена:

1. Проверьте версию Prisma: `npx prisma --version`
2. Проверьте логи: `cat logs/backend.log`
3. Проверьте настройки БД: `cat .env | grep DB_`
4. Попробуйте полную переустановку (см. выше)

---

**Обновлено:** 2024  
**Версия Prisma:** 5.x.x (рекомендуется)
