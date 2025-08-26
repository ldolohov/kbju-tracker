# KBJU Tracker - Трекер питания с AI анализом

Приложение для отслеживания питания с использованием искусственного интеллекта для анализа фотографий блюд.

## Функции

- 📸 Анализ фотографий блюд с помощью OpenAI
- 📊 Отслеживание калорий, белков, жиров и углеводов
- 📈 Статистика и аналитика питания
- 📱 Адаптивный дизайн
- 💾 Локальное хранение данных

## Деплой на Render

### 1. Подготовка

1. Убедитесь, что у вас есть аккаунт на [Render.com](https://render.com)
2. Получите API ключ от OpenAI на [platform.openai.com](https://platform.openai.com)

### 2. Создание Web Service на Render

1. Зайдите в Dashboard Render
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте следующие параметры:

**Основные настройки:**
- **Name:** kbju-tracker (или любое другое)
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (или платный, если нужен)

**Environment Variables:**
- `OPENAI_API_KEY` = ваш_ключ_openai
- `OPENAI_MODEL` = gpt-5
- `NODE_ENV` = production
- `PORT` = 10000 (Render автоматически установит правильный порт)

### 3. Деплой

1. Нажмите "Create Web Service"
2. Render автоматически задеплоит ваше приложение
3. Дождитесь завершения деплоя (обычно 2-5 минут)

### 4. Проверка

После успешного деплоя:
- Ваше приложение будет доступно по URL вида: `https://your-app-name.onrender.com`
- Frontend и backend будут работать на одном домене
- API будет доступен по `/api` эндпоинтам

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в production режиме
npm start
```

## Структура проекта

```
kbju-tracker/
├── backend/           # Express сервер
│   ├── routes/       # API маршруты
│   ├── services/     # Бизнес-логика
│   ├── models/       # Модели данных
│   └── server.js     # Основной файл сервера
├── frontend/         # Статические файлы
│   ├── css/         # Стили
│   ├── js/          # JavaScript
│   └── index.html   # Главная страница
└── package.json     # Зависимости проекта
```

## Технологии

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **AI:** OpenAI GPT-4 Vision
- **Хранение:** LocalStorage (браузер)
- **Деплой:** Render

## Поддержка

Если возникли проблемы с деплоем или работой приложения, проверьте:
1. Правильность API ключа OpenAI
2. Логи в Render Dashboard
3. Консоль браузера на наличие ошибок 