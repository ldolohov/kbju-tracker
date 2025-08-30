#!/usr/bin/env node

// Загружаем переменные окружения из .env файла
require('dotenv').config();

/**
 * Скрипт для быстрого тестирования OAuth конфигурации
 * Запуск: node scripts/test-oauth.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔐 Тестирование OAuth конфигурации...\n');

// Проверяем текущую среду
const currentEnv = process.env.NODE_ENV || 'development';
console.log(`🌍 Текущая среда: ${currentEnv}`);

// Проверяем переменные окружения
console.log('\n📋 Проверка OAuth переменных:');

const oauthVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL'
];

oauthVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        if (varName.includes('SECRET')) {
            console.log(`✅ ${varName}: ***${value.slice(-4)}`);
        } else {
            console.log(`✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`❌ ${varName}: НЕ УСТАНОВЛЕНА`);
    }
});

// Проверяем callback URL
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
if (callbackUrl) {
    if (callbackUrl.includes('localhost')) {
        console.log('🌐 Callback URL: локальная разработка');
    } else if (callbackUrl.includes('staging')) {
        console.log('🌐 Callback URL: staging среда');
    } else if (callbackUrl.includes('onrender.com')) {
        console.log('🌐 Callback URL: продакшн');
    } else {
        console.log('🌐 Callback URL: неизвестная среда');
    }
}

// Проверяем конфигурацию
console.log('\n🔍 Проверка конфигурации...');
try {
    execSync('node check-env.js', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });
} catch (error) {
    console.log('⚠️  Ошибка при проверке конфигурации');
}

// Рекомендации
console.log('\n💡 Рекомендации:');

if (currentEnv === 'development') {
    console.log('✅ Development режим - можно тестировать локально');
    console.log('🚀 Запуск: npm run dev');
} else if (currentEnv === 'staging') {
    console.log('🧪 Staging режим - тестируем продакшн-конфигурацию');
    console.log('🚀 Запуск: npm run test-prod');
} else if (currentEnv === 'production') {
    console.log('🚀 Production режим - готов к деплою');
    console.log('⚠️  Проверьте все настройки перед деплоем');
}

// Проверяем Google Cloud Console
console.log('\n🔧 Google Cloud Console:');
if (callbackUrl && !callbackUrl.includes('localhost')) {
    console.log('1. Перейдите в Google Cloud Console');
    console.log('2. APIs & Services → Credentials');
    console.log('3. Найдите ваш OAuth 2.0 Client ID');
    console.log(`4. В "Authorized redirect URIs" добавьте: ${callbackUrl}`);
} else {
    console.log('✅ Локальная разработка - Google Cloud Console не требуется');
}

console.log('\n🔐 Тестирование завершено!');
