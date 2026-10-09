# 🔧 Быстрое исправление ошибки Prisma

## Проблема

```
✘ [CLI.UNKNOWN_COMMAND] No command registered for `migrate`, did you mean `migration`?
```

## Решение (30 секунд)

Выполните эти команды:

```bash
# 1. Запустите скрипт исправления
chmod +x fix-prisma.sh
./fix-prisma.sh

# 2. Запустите инициализацию базы данных
chmod +x init-db.sh
./init-db.sh --sql

# 3. Запустите проект
chmod +x start.sh
./start.sh
```

## Что делает скрипт fix-prisma.sh?

1. Обновляет Prisma до последней версии (5.x.x)
2. Генерирует Prisma client заново
3. Проверяет версию Prisma

## Альтернативное решение вручную

```bash
cd backend

# Обновить Prisma
npm install @prisma/client@latest prisma@latest

# Сгенерировать клиент
npx prisma generate

cd ..

# Запустить инициализацию
./init-db.sh --sql
```

## Проверка

После исправления проверьте версию Prisma:

```bash
cd backend
npx prisma --version
```

Должно показать версию 5.x.x или выше.

## Если не помогло

Используйте скрипт автоматического определения команды:

```bash
cd backend
chmod +x apply-migrations.sh
./apply-migrations.sh
cd ..
```

Этот скрипт автоматически определит, какую команду использовать (`migrate` или `migration`).

## Подробная документация

[TROUBLESHOOTING_PRISMA.md](TROUBLESHOOTING_PRISMA.md)

---

**Время исправления:** ~30 секунд  
**Решение:** Обновить Prisma до версии 5.x.x
