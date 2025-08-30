# 🔐 Пошаговая настройка Google OAuth

## 🎯 **Цель**
Настроить Google OAuth для работы в продакшне, тестируя локально.

## 📋 **Что нужно сделать**

### **Шаг 1: Получить Google OAuth credentials**

1. **Перейдите в [Google Cloud Console](https://console.cloud.google.com/)**
2. **Выберите ваш проект** (или создайте новый)
3. **Перейдите в "APIs & Services" → "Credentials"**
4. **Нажмите "Create Credentials" → "OAuth 2.0 Client IDs"**
5. **Выберите "Web application"**
6. **Заполните форму:**
   - **Name**: `KBJU Tracker OAuth`
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     https://kbju-tracker.onrender.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/google/callback
     https://kbju-tracker.onrender.com/auth/google/callback
     ```

7. **Скопируйте полученные данные:**
   - **Client ID** (например: `123456789-abcdef.apps.googleusercontent.com`)
   - **Client Secret** (например: `GOCSPX-abcdefghijklmnop`)

### **Шаг 2: Создать .env файл**

Создайте файл `backend/.env` со следующим содержимым:

```bash
# Staging Environment
NODE_ENV=staging

# Google OAuth - ВАШИ РЕАЛЬНЫЕ ДАННЫЕ
GOOGLE_CLIENT_ID=ваш_реальный_client_id
GOOGLE_CLIENT_SECRET=ваш_реальный_client_secret

# Callback URL для staging
GOOGLE_CALLBACK_URL=https://kbju-tracker-staging.onrender.com/auth/google/callback

# Session Secret - ГЕНЕРИРУЙТЕ СЛУЧАЙНУЮ СТРОКУ
SESSION_SECRET=staging_session_secret_456_very_long_random_string_here

# Server Configuration
PORT=3000
CORS_ORIGIN=https://kbju-tracker-staging.onrender.com

# OpenAI API Key (если есть)
OPENAI_API_KEY=ваш_openai_api_key
```

### **Шаг 3: Протестировать локально**

```bash
# 1. Переключиться на staging
npm run switch-env staging

# 2. Протестировать OAuth
npm run test-prod

# 3. Открыть http://localhost:3000
# 4. Попробовать войти через Google
```

### **Шаг 4: Если работает - настроить production**

```bash
# 1. Переключиться на production
npm run switch-env prod

# 2. Проверить конфигурацию
npm run check-env

# 3. Деплой в продакшн
git add .
git commit -m "Configure Google OAuth for production"
git push origin main
```

## 🔍 **Проверка работоспособности**

### **В логах должно появиться:**
```
🌍 Загружена конфигурация для среды: staging
✅ Google OAuth настроен
Google OAuth callback URL: https://kbju-tracker-staging.onrender.com/auth/google/callback
```

### **В браузере:**
1. Откройте http://localhost:3000
2. Сфотографируйте блюдо
3. Нажмите "Аутентифицироваться"
4. Должно произойти перенаправление на Google

## ⚠️ **Частые проблемы и решения**

### **Проблема: "redirect_uri_mismatch"**
**Решение**: Проверьте, что callback URL в Google Cloud Console точно совпадает с `GOOGLE_CALLBACK_URL` в .env

### **Проблема: "invalid_client"**
**Решение**: Проверьте `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`

### **Проблема: "access_denied"**
**Решение**: Убедитесь, что OAuth consent screen настроен правильно

## 🚀 **Быстрые команды для проверки**

```bash
# Проверить переменные окружения
npm run check-env

# Протестировать OAuth конфигурацию
npm run test-oauth

# Переключиться между средами
npm run switch-env staging
npm run switch-env prod
```

## 📚 **Дополнительные ресурсы**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen Setup](https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery)

---

**После настройки Google OAuth должен работать корректно!** 🎉
