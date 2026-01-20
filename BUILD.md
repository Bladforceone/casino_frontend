# 🚀 Production Build Guide

## Быстрый старт

### Development
```bash
npm run dev
```
Запускает dev сервер на http://localhost:5173

### Production Build
```bash
npm run build:prod
```
Создает оптимизированную production сборку в папке `dist/`

### Preview Production Build
```bash
npm run preview:prod
```
Запускает preview сервер для просмотра production сборки на http://localhost:4173

## 📦 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск development сервера |
| `npm run build` | Обычная сборка с проверкой типов |
| `npm run build:prod` | Production сборка с полной оптимизацией |
| `npm run preview` | Preview production сборки |
| `npm run preview:prod` | Preview на порту 4173 |
| `npm run type-check` | Проверка TypeScript типов без сборки |
| `npm run clean` | Очистка кэша и dist папки |

## 🎯 Production оптимизации

### Что включено в production сборку:

#### 1. **Минификация и сжатие**
- ✅ Terser минификация JavaScript
- ✅ CSS минификация
- ✅ Удаление комментариев
- ✅ Оптимизация имен переменных

#### 2. **Удаление debug кода**
- ✅ Удалены все `console.log()`
- ✅ Удалены все `console.info()` и `console.debug()`
- ✅ Удалены `debugger` statements

#### 3. **Code Splitting**
- ✅ React и ReactDOM в отдельном chunk (`react-vendor`)
- ✅ Zustand в отдельном chunk (`state-vendor`)
- ✅ Оптимальное разделение для кэширования

#### 4. **Оптимизация ресурсов**
- ✅ CSS Code Splitting
- ✅ Asset хеширование для кэширования
- ✅ Оптимизированная структура папок

#### 5. **Настройки производительности**
- ✅ Target: ESNext для современных браузеров
- ✅ Tree shaking неиспользуемого кода
- ✅ Sourcemaps отключены (для безопасности)

## 📁 Структура Production сборки

```
dist/
├── index.html                          # Главный HTML файл
├── assets/
│   ├── js/
│   │   ├── index-[hash].js            # Основной код приложения
│   │   ├── react-vendor-[hash].js     # React библиотеки
│   │   └── state-vendor-[hash].js     # Zustand
│   ├── css/
│   │   └── index-[hash].css           # Стили приложения
│   └── [other-assets]/                # Картинки, шрифты и т.д.
```

## 🌐 Деплой

### Развертывание на различных платформах:

#### **Vercel**
```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

#### **Netlify**
```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Build и deploy
npm run build:prod
netlify deploy --prod --dir=dist
```

#### **GitHub Pages**
```bash
# Build
npm run build:prod

# Деплой (используя gh-pages пакет)
npm i -g gh-pages
gh-pages -d dist
```

#### **Nginx / Apache**
1. Соберите проект: `npm run build:prod`
2. Скопируйте содержимое папки `dist/` на сервер
3. Настройте веб-сервер для SPA (все запросы на index.html)

**Пример конфигурации Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📊 Анализ размера бандла

Для анализа размера бандла можно использовать:

```bash
# Установить rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer

# Затем добавить в vite.config.ts и собрать
npm run build:prod
```

## ⚡ Оптимизация производительности

### Рекомендации:

1. **Lazy Loading компонентов**
   ```typescript
   const PaytableModal = lazy(() => import('@widgets/PaytableModal'));
   ```

2. **Мемоизация**
   - Используйте `useMemo` для тяжелых вычислений
   - Используйте `React.memo` для компонентов

3. **Оптимизация изображений**
   - Используйте WebP формат
   - Добавьте lazy loading для изображений

4. **CDN**
   - Рассмотрите использование CDN для статических ресурсов

## 🔒 Безопасность

### Production чеклист:

- ✅ Sourcemaps отключены
- ✅ Console logs удалены
- ✅ Environment variables правильно настроены
- ✅ Dependencies обновлены до последних стабильных версий

## 🐛 Troubleshooting

### Проблема: Белый экран после деплоя
**Решение:** Проверьте base path в `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/', // Для GitHub Pages
})
```

### Проблема: Большой размер бандла
**Решение:** 
1. Проверьте дублирование зависимостей
2. Используйте dynamic imports
3. Удалите неиспользуемые зависимости

### Проблема: Медленная загрузка
**Решение:**
1. Включите Gzip/Brotli сжатие на сервере
2. Настройте кэширование
3. Используйте CDN

## 📈 Метрики производительности

После сборки проверьте:
- **Lighthouse Score**: Стремитесь к 90+
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Bundle Size**: Основной chunk < 200KB

## 🔄 CI/CD пример

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Build
        run: npm run build:prod
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📞 Поддержка

Если возникли проблемы со сборкой, проверьте:
1. Node.js версия >= 16
2. NPM версия >= 8
3. Все зависимости установлены: `npm install`
4. Кэш очищен: `npm run clean`

---

**Удачного деплоя! 🚀**

