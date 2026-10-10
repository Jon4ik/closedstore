# ✅ ИСПРАВЛЕНИЕ БЕЛОЙ СТРАНИЦЫ FRONTEND

## Проблема

Frontend показывает белую страницу на http://localhost:5001

## Причина

В `package.json` отсутствовали критические зависимости:
- `zustand` - для управления состоянием
- `idb` - для IndexedDB
- `xlsx` - для экспорта Excel
- `jspdf` - для экспорта PDF
- `jspdf-autotable` - для таблиц в PDF

## ✅ РЕШЕНИЕ

### Шаг 1: Скопируйте файлы на сервер

На вашем локальном компьютере:
```bash
git add .
git commit -m "Fix: add missing dependencies"
git push
```

На сервере:
```bash
cd ~/store-reconstruction
git pull
```

### Шаг 2: Пересоберите frontend контейнер

```bash
cd ~/store-reconstruction

# Пересобрать frontend
chmod +x rebuild-frontend.sh
./rebuild-frontend.sh
```

Или вручную:
```bash
docker compose stop frontend
docker compose rm -f frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Шаг 3: Проверьте работоспособность

В браузере откройте:
- **Frontend**: http://localhost:5001
- **Health check**: http://localhost:5001/health (должен вернуть "OK")
- **API через nginx**: http://localhost:5001/api/health

---

## 🔍 Проверка

### Проверьте логи frontend:

```bash
docker compose logs -f frontend
```

Должны увидеть:
```
nginx/1.31.6
start worker processes
```

### Проверьте содержимое контейнера:

```bash
# Войти в контейнер frontend
docker compose exec frontend sh

# Проверить наличие файлов
ls -la /usr/share/nginx/html/

# Должны увидеть:
# index.html
# assets/
#   index-*.css
#   index-*.js

# Выйти
exit
```

### Проверьте nginx конфигурацию:

```bash
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

Должны увидеть правильную конфигурацию с `try_files $uri $uri/ /index.html;`

---

## 🐛 Если белая страница осталась

### Проверка 1: JavaScript ошибки

Откройте браузер, нажмите F12, перейдите на вкладку Console. Если видите ошибки JavaScript, скопируйте их и покажите мне.

### Проверка 2: Сетевые запросы

В браузере (F12 → Network) проверьте, загружаются ли файлы:
- `index.html` - должен загрузиться
- `assets/index-*.js` - должен загрузиться
- `assets/index-*.css` - должен загрузиться

### Проверка 3: Пересобрать с нуля

```bash
# Полная очистка
docker compose down
docker system prune -a

# Пересборка всего
docker compose build --no-cache
docker compose up -d
```

---

## 📋 Что было исправлено

### package.json
Добавлены зависимости:
```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "idb": "^8.0.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2"
  }
}
```

### vite.config.js
Добавлены настройки сборки:
```javascript
{
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}
```

---

## ✅ Проверочный чеклист

После пересборки:

- [ ] `docker compose ps` показывает frontend и backend
- [ ] `docker compose logs frontend` показывает nginx без ошибок
- [ ] http://localhost:5001/health возвращает "OK"
- [ ] http://localhost:5001 открывает приложение (не белая страница)
- [ ] В консоли браузера (F12) нет критических ошибок JavaScript
- [ ] В Network (F12) загружаются index.html, *.js, *.css

---

## 📞 Если проблема не решена

Пришлите вывод команд:

```bash
# Логи frontend
docker compose logs frontend

# Содержимое контейнера
docker compose exec frontend ls -la /usr/share/nginx/html/

# Проверка nginx конфигурации
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Ошибки из консоли браузера (F12 → Console)
```

---

**Время исправления:** ~2 минуты  
**Команда:** `chmod +x rebuild-frontend.sh && ./rebuild-frontend.sh`
