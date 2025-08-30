# 🚀 Workflow разработки без постоянного деплоя в продакшн

## 🎯 **Проблема**
Локально все работает, но в продакшне Google OAuth не функционирует. Нужно тестировать локально с продакшн-конфигурацией.

## 🔧 **Решение: Многосредовая разработка**

### **Структура сред:**
- **`development`** - локальная разработка
- **`staging`** - тестирование продакшн-конфигурации
- **`production`** - финальный деплой

## 📋 **Быстрый старт**

### 1. **Переключение между средами**
```bash
# Переключиться на development (локальная разработка)
npm run switch-env dev

# Переключиться на staging (тестирование продакшн-конфигурации)
npm run switch-env staging

# Переключиться на production (финальная конфигурация)
npm run switch-env prod
```

### 2. **Запуск сервера**
```bash
# Development режим с автоперезагрузкой
npm run dev

# Тестирование продакшн-конфигурации локально
npm run test-prod

# Production режим
npm start
```

### 3. **Проверка конфигурации**
```bash
npm run check-env
```

## 🔄 **Workflow разработки**

### **Этап 1: Локальная разработка**
```bash
# 1. Переключаемся на development
npm run switch-env dev

# 2. Запускаем сервер
npm run dev

# 3. Разрабатываем и тестируем функционал
# 4. Google OAuth работает с localhost:3000
```

### **Этап 2: Тестирование продакшн-конфигурации**
```bash
# 1. Переключаемся на staging
npm run switch-env staging

# 2. Тестируем с продакшн-настройками
npm run test-prod

# 3. Проверяем:
#    - Google OAuth callback URL
#    - CORS настройки
#    - Session конфигурацию
#    - Логирование
```

### **Этап 3: Деплой в продакшн**
```bash
# 1. Переключаемся на production
npm run switch-env prod

# 2. Проверяем конфигурацию
npm run check-env

# 3. Коммитим и пушим
git add .
git commit -m "Fix OAuth configuration for production"
git push origin main

# 4. Render автоматически деплоит
```

## 🧪 **Тестирование OAuth локально**

### **Метод 1: Тест-продакшн конфигурация**
```bash
npm run test-prod
```
Этот скрипт:
- Создает временный `.env.test-prod`
- Запускает сервер с `NODE_ENV=production`
- Использует продакшн callback URL
- Автоматически очищает временные файлы

### **Метод 2: Ручное переключение**
```bash
# 1. Переключаемся на staging
npm run switch-env staging

# 2. Запускаем сервер
npm run dev

# 3. Тестируем OAuth
# 4. Возвращаемся к development
npm run switch-env dev
```

## 🔍 **Отладка проблем**

### **Проверка конфигурации**
```bash
npm run check-env
```

### **Проверка логов**
В логах должны появиться:
```
🌍 Загружена конфигурация для среды: staging
✅ Google OAuth настроен
Google OAuth callback URL: https://kbju-tracker-staging.onrender.com/auth/google/callback
```

### **Проверка переменных окружения**
```bash
# В staging режиме
echo $NODE_ENV          # должно быть "staging"
echo $GOOGLE_CALLBACK_URL  # должно быть staging URL
```

## 📁 **Структура файлов**

```
backend/
├── config/
│   ├── environments.js     # Конфигурация для разных сред
│   └── index.js           # Основной конфиг
├── scripts/
│   ├── switch-env.js      # Переключение сред
│   ├── test-prod-config.js # Тест продакшн-конфигурации
│   └── check-env.js       # Проверка переменных
└── .env                   # Текущая среда (автоматически создается)
```

## ⚠️ **Важные моменты**

### **1. Google Cloud Console**
Для каждой среды нужен свой callback URL:
- **Development**: `http://localhost:3000/auth/google/callback`
- **Staging**: `https://kbju-tracker-staging.onrender.com/auth/google/callback`
- **Production**: `https://kbju-tracker.onrender.com/auth/google/callback`

### **2. Переменные окружения**
Каждая среда имеет свои настройки:
- CORS origins
- Session параметры
- Logging уровень

### **3. Тестирование**
- **Development**: тестируем функционал
- **Staging**: тестируем продакшн-конфигурацию
- **Production**: только финальный деплой

## 🚀 **Преимущества подхода**

1. **Быстрое тестирование** - не нужно деплоить в продакшн
2. **Изоляция сред** - каждая среда имеет свои настройки
3. **Автоматизация** - скрипты для переключения
4. **Безопасность** - тестируем продакшн-конфигурацию локально
5. **Экономия времени** - быстрый цикл разработки

## 🔧 **Устранение неполадок**

### **Проблема: OAuth не работает в staging**
```bash
# 1. Проверяем конфигурацию
npm run check-env

# 2. Проверяем Google Cloud Console
# 3. Убеждаемся, что callback URL добавлен

# 4. Перезапускаем сервер
npm run test-prod
```

### **Проблема: Неправильные CORS настройки**
```bash
# 1. Проверяем текущую среду
npm run switch-env staging

# 2. Проверяем .env файл
cat .env

# 3. Перезапускаем сервер
npm run dev
```

Теперь вы можете разрабатывать и тестировать локально, не деплоя постоянно в продакшн! 🎉
