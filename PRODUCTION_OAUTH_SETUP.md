# Настройка Google OAuth для продакшена

## Проблема
В продакшене на Render.com происходит следующее:
1. Пользователь фотографирует блюдо
2. Показывается кнопка "Аутентифицироваться"
3. При нажатии пользователь не перенаправляется на Google страницу входа
4. Происходит возврат в приложение без входа
5. Блюдо не распознается
6. Цикл повторяется

## Причины проблемы

### 1. Неправильный Callback URL в Google Cloud Console
В Google Cloud Console должен быть указан **точный** callback URL:
```
https://kbju-tracker.onrender.com/auth/google/callback
```

### 2. Неправильные переменные окружения в Render
В Render.com должны быть установлены следующие переменные:

```bash
NODE_ENV=production
GOOGLE_CLIENT_ID=ваш_google_client_id
GOOGLE_CLIENT_SECRET=ваш_google_client_secret
GOOGLE_CALLBACK_URL=https://kbju-tracker.onrender.com/auth/google/callback
SESSION_SECRET=случайная_строка_для_сессий
```

### 3. Проблемы с сессиями на Render
Render.com использует разные инстансы, что может вызывать проблемы с сессиями.

## Пошаговое решение

### Шаг 1: Проверить Google Cloud Console
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в "APIs & Services" → "Credentials"
4. Найдите ваш OAuth 2.0 Client ID
5. В "Authorized redirect URIs" добавьте:
   ```
   https://kbju-tracker.onrender.com/auth/google/callback
   ```

### Шаг 2: Обновить переменные окружения в Render
1. Перейдите в ваш проект на [Render.com](https://render.com/)
2. Выберите ваш сервис
3. Перейдите в "Environment"
4. Добавьте/обновите переменные:
   ```
   NODE_ENV=production
   GOOGLE_CLIENT_ID=ваш_google_client_id
   GOOGLE_CLIENT_SECRET=ваш_google_client_secret
   GOOGLE_CALLBACK_URL=https://kbju-tracker.onrender.com/auth/google/callback
   SESSION_SECRET=случайная_строка_для_сессий
   ```

### Шаг 3: Перезапустить сервис
После изменения переменных окружения перезапустите сервис в Render.

### Шаг 4: Проверить логи
В логах Render должны появиться сообщения:
```
✅ Google OAuth настроен
Google OAuth callback URL: https://kbju-tracker.onrender.com/auth/google/callback
```

## Альтернативные решения

### 1. Использование Redis для сессий
Для продакшена рекомендуется использовать Redis вместо MemoryStore:

```javascript
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    // ... остальные настройки
}));
```

### 2. Проверка CORS
Убедитесь, что CORS настроен правильно для вашего домена.

### 3. Проверка HTTPS
Google OAuth требует HTTPS в продакшене.

## Отладка

### Проверить логи в Render
1. Перейдите в ваш сервис на Render
2. Нажмите "Logs"
3. Ищите сообщения с эмодзи 🔐

### Проверить Network в браузере
1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Network
3. Попробуйте войти через Google
4. Проверьте запросы к `/auth/google` и `/auth/google/callback`

### Проверить Console в браузере
В консоли должны появиться сообщения от AuthService.

## Тестирование

После настройки:
1. Перейдите на ваш сайт
2. Попробуйте войти через Google
3. Должно произойти перенаправление на Google
4. После входа вы должны вернуться на сайт аутентифицированным

## Если проблема остается

1. Проверьте, что все переменные окружения установлены правильно
2. Убедитесь, что callback URL в Google Cloud Console точно совпадает
3. Проверьте логи на наличие ошибок
4. Убедитесь, что домен в Google Cloud Console совпадает с вашим
5. Попробуйте очистить кэш браузера
