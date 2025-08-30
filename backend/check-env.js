#!/usr/bin/env node

// Загружаем переменные окружения из .env файла
require('dotenv').config();

/**
 * Скрипт для проверки переменных окружения в продакшене
 * Запуск: node check-env.js
 */

console.log('🔍 Проверка переменных окружения...\n');

// Проверяем основные переменные
const requiredVars = [
    'NODE_ENV',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'SESSION_SECRET'
];

const optionalVars = [
    'PORT',
    'CORS_ORIGIN',
    'OPENAI_API_KEY'
];

console.log('📋 Обязательные переменные:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
    } else {
        console.log(`❌ ${varName}: НЕ УСТАНОВЛЕНА`);
    }
});

console.log('\n📋 Дополнительные переменные:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
    } else {
        console.log(`⚠️  ${varName}: не установлена (не критично)`);
    }
});

console.log('\n🔍 Проверка конфигурации:');

// Проверяем NODE_ENV
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'production') {
    console.log('✅ NODE_ENV: production');
    
    // Проверяем callback URL для продакшена
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    if (callbackUrl && callbackUrl.includes('kbju-tracker.onrender.com')) {
        console.log('✅ GOOGLE_CALLBACK_URL: корректный для Render');
    } else {
        console.log('❌ GOOGLE_CALLBACK_URL: должен содержать kbju-tracker.onrender.com');
    }
    
    // Проверяем SESSION_SECRET
    const sessionSecret = process.env.SESSION_SECRET;
    if (sessionSecret && sessionSecret.length > 10) {
        console.log('✅ SESSION_SECRET: установлен и достаточно длинный');
    } else {
        console.log('❌ SESSION_SECRET: должен быть длиннее 10 символов');
    }
    
} else if (nodeEnv === 'staging') {
    console.log('✅ NODE_ENV: staging');
    
    // Проверяем callback URL для staging
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    if (callbackUrl && callbackUrl.includes('staging')) {
        console.log('✅ GOOGLE_CALLBACK_URL: корректный для staging');
    } else {
        console.log('❌ GOOGLE_CALLBACK_URL: должен содержать staging');
    }
    
} else {
    console.log(`⚠️  NODE_ENV: ${nodeEnv || 'development'}`);
}

console.log('\n🔍 Рекомендации:');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Установите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET');
    console.log('   Получите их в Google Cloud Console → APIs & Services → Credentials');
}

if (!process.env.GOOGLE_CALLBACK_URL) {
    console.log('❌ Установите GOOGLE_CALLBACK_URL');
    console.log('   Для продакшена: https://kbju-tracker.onrender.com/auth/google/callback');
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-secret-key') {
    console.log('❌ Установите уникальный SESSION_SECRET');
    console.log('   Генерируйте случайную строку длиной минимум 32 символа');
}

if (process.env.NODE_ENV === 'production') {
    console.log('\n⚠️  ВНИМАНИЕ: В продакшне используется MemoryStore для сессий');
    console.log('   Это может вызывать проблемы на Render.com');
    console.log('   Рекомендуется настроить Redis или другое хранилище сессий');
}

console.log('\n🔍 Проверка завершена!');
