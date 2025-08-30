#!/usr/bin/env node

// Загружаем переменные окружения из .env файла
require('dotenv').config();

/**
 * Скрипт для быстрого переключения между средами разработки
 * Запуск: node scripts/switch-env.js [environment]
 * Примеры: 
 *   node scripts/switch-env.js dev
 *   node scripts/switch-env.js staging
 *   node scripts/switch-env.js prod
 */

const fs = require('fs');
const path = require('path');

const environments = {
    dev: 'development',
    development: 'development',
    staging: 'staging',
    prod: 'production',
    production: 'production'
};

const targetEnv = process.argv[2] || 'dev';
const normalizedEnv = environments[targetEnv];

if (!normalizedEnv) {
    console.error('❌ Неизвестная среда:', targetEnv);
    console.log('Доступные среды: dev, staging, prod');
    process.exit(1);
}

console.log(`🔄 Переключение на среду: ${normalizedEnv}`);

// Создаем .env файл для выбранной среды
let envContent = '';

switch (normalizedEnv) {
    case 'development':
        envContent = `# Development Environment
NODE_ENV=development
GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || 'your_google_client_id'}
GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret'}
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=dev_session_secret_123
PORT=3000
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'your_openai_api_key'}
`;
        break;
        
    case 'staging':
        envContent = `# Staging Environment
NODE_ENV=staging
GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || 'your_google_client_id'}
GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret'}
GOOGLE_CALLBACK_URL=https://kbju-tracker-staging.onrender.com/auth/google/callback
SESSION_SECRET=staging_session_secret_456
PORT=3000
CORS_ORIGIN=https://kbju-tracker-staging.onrender.com
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'your_openai_api_key'}
`;
        break;
        
    case 'production':
        envContent = `# Production Environment
NODE_ENV=production
GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || 'your_google_client_id'}
GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret'}
GOOGLE_CALLBACK_URL=https://kbju-tracker.onrender.com/auth/google/callback
SESSION_SECRET=prod_session_secret_789
PORT=3000
CORS_ORIGIN=https://kbju-tracker.onrender.com
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'your_openai_api_key'}
`;
        break;
}

// Записываем в .env файл
const envPath = path.join(__dirname, '../.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Создан .env файл для среды:', normalizedEnv);
console.log('📁 Путь:', envPath);
console.log('\n📝 Содержимое:');
console.log(envContent);

console.log('\n🚀 Теперь можно запустить сервер:');
console.log(`   npm run dev          # для development`);
console.log(`   npm run test-prod    # для тестирования продакшн-конфигурации`);
console.log(`   npm start            # для production`);

// Проверяем конфигурацию
console.log('\n🔍 Проверяем конфигурацию...');
const { execSync } = require('child_process');
try {
    execSync('node check-env.js', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });
} catch (error) {
    console.log('⚠️  Ошибка при проверке конфигурации');
}
