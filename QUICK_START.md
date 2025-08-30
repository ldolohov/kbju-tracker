# 🚀 Быстрый старт для разработки

## 🎯 **Цель**
Тестировать Google OAuth локально с продакшн-конфигурацией, не деплоя постоянно в продакшн.

## ⚡ **Быстрые команды**

### **1. Переключение сред**
```bash
# Локальная разработка
npm run switch-env dev

# Тестирование продакшн-конфигурации
npm run switch-env staging

# Финальная конфигурация
npm run switch-env prod
```

### **2. Запуск сервера**
```bash
# Development (с автоперезагрузкой)
npm run dev

# Тест продакшн-конфигурации
npm run test-prod

# Production
npm start
```

### **3. Проверки**
```bash
# Проверка переменных окружения
npm run check-env

# Тест OAuth конфигурации
npm run test-oauth
```

## 🔄 **Workflow для исправления OAuth**

### **Шаг 1: Тестируем локально**
```bash
# 1. Переключаемся на staging
npm run switch-env staging

# 2. Тестируем OAuth
npm run test-prod

# 3. Проверяем в браузере: http://localhost:3000
```

### **Шаг 2: Если работает - деплоим**
```bash
# 1. Переключаемся на production
npm run switch-env prod

# 2. Проверяем конфигурацию
npm run check-env

# 3. Коммитим и пушим
git add .
git commit -m "Fix OAuth configuration"
git push origin main
```

### **Шаг 3: Если не работает - исправляем**
```bash
# 1. Проверяем Google Cloud Console
# 2. Добавляем callback URL: https://kbju-tracker.onrender.com/auth/google/callback
# 3. Возвращаемся к шагу 1
```

## 🧪 **Тестирование OAuth**

### **Локальное тестирование**
1. `npm run switch-env staging`
2. `npm run test-prod`
3. Откройте http://localhost:3000
4. Попробуйте войти через Google
5. Проверьте логи в терминале

### **Проверка конфигурации**
```bash
npm run test-oauth
```

Должно показать:
- ✅ Текущая среда
- ✅ OAuth переменные
- ✅ Callback URL
- 🔧 Инструкции по Google Cloud Console

## ⚠️ **Важные моменты**

1. **Google Cloud Console**: добавьте callback URL для каждой среды
2. **Переменные окружения**: используйте правильные для каждой среды
3. **Тестирование**: всегда тестируйте staging перед production
4. **Логи**: проверяйте логи для отладки

## 🆘 **Если что-то не работает**

1. **Проверьте конфигурацию**: `npm run check-env`
2. **Проверьте OAuth**: `npm run test-oauth`
3. **Проверьте логи**: в терминале должны быть эмодзи 🔐
4. **Проверьте Google Cloud Console**: callback URL должен совпадать

## 📚 **Подробная документация**

- `DEVELOPMENT_WORKFLOW.md` - полный workflow разработки
- `PRODUCTION_OAUTH_SETUP.md` - настройка OAuth для продакшна
- `env.example` - примеры переменных окружения

---

**Теперь вы можете разрабатывать локально, не деплоя постоянно в продакшн!** 🎉
