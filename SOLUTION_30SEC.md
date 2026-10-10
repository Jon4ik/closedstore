# ⚡ БЫСТРОЕ РЕШЕНИЕ (30 секунд)

## Проблема

Backend не запускается в Docker:
```
Error: Cannot find module '/app/dist/main.js'
```

## ✅ РЕШЕНИЕ

Выполните одну команду:

```bash
chmod +x rebuild-backend-tsnode.sh && ./rebuild-backend-tsnode.sh
```

Это пересоберет backend с использованием ts-node (без компиляции).

## Проверка

```bash
# Проверить логи
docker compose logs --tail=20 backend

# Должны увидеть:
# 🚀 Backend running on http://localhost:4000
# 📚 Swagger docs: http://localhost:4000/api/docs

# Проверить API
curl http://localhost:4000/api/health
# {"status":"ok",...}
```

## Если не помогло

```bash
# Полная очистка
docker compose down --rmi all
docker system prune -a

# Пересборка
./rebuild-backend-tsnode.sh
```

## Альтернатива: Запустить локально

```bash
docker compose stop backend
cd backend
npm install
npx prisma generate
npm run start:dev
```

---

**Подробности:** [FINAL_SOLUTION.md](FINAL_SOLUTION.md)
