#!/usr/bin/env node

// Загружаем переменные окружения из .env файла
require('dotenv').config();

/**
 * Скрипт для локального тестирования с продакшн-конфигурацией
 * Запуск: node scripts/test-prod-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Тестирование продакшн-конфигурации локально...\n');

// Создаем временный .env файл для тестирования
const testEnvContent = `# Временный файл для тестирования продакшн-конфигурации
NODE_ENV=production
GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || 'test_client_id'}
GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || 'test_client_secret'}
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=test_session_secret_for_local_testing_12345
PORT=3000
CORS_ORIGIN=http://localhost:3000
`;

const testEnvPath = path.join(__dirname, '../.env.test-prod');
fs.writeFileSync(testEnvPath, testEnvContent);

console.log('✅ Создан временный .env.test-prod файл');
console.log('📝 Содержимое:');
console.log(testEnvContent);

console.log('\n🚀 Запуск сервера с продакшн-конфигурацией на порту 3000...');
console.log('⚠️  ВАЖНО: Остановите сервер Ctrl+C после тестирования!');
console.log('📁 Файл .env.test-prod будет автоматически удален');
console.log('🌐 Сервер будет доступен по адресу: http://localhost:3000');
console.log('🔐 Callback URL: http://localhost:3000/auth/google/callback\n');

// Запускаем сервер с тестовой конфигурацией
const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3000',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback'
    },
    stdio: 'inherit'
});

// Обработка завершения
process.on('SIGINT', () => {
    console.log('\n🛑 Останавливаю тестовый сервер...');
    server.kill('SIGINT');
    
    // Удаляем временный файл
    if (fs.existsSync(testEnvPath)) {
        fs.unlinkSync(testEnvPath);
        console.log('🗑️  Временный .env.test-prod файл удален');
    }
    
    process.exit(0);
});

server.on('close', (code) => {
    console.log(`\n🔚 Тестовый сервер завершен с кодом ${code}`);
    
    // Удаляем временный файл
    if (fs.existsSync(testEnvPath)) {
        fs.unlinkSync(testEnvPath);
        console.log('🗑️  Временный .env.test-prod файл удален');
    }
});
