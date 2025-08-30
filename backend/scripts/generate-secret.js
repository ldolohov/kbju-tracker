#!/usr/bin/env node

/**
 * Скрипт для генерации случайного SESSION_SECRET
 * Запуск: node scripts/generate-secret.js
 */

const crypto = require('crypto');

console.log('🔐 Генерация случайного SESSION_SECRET...\n');

// Генерируем случайную строку длиной 64 символа
const secret = crypto.randomBytes(32).toString('hex');

console.log('✅ Сгенерирован SESSION_SECRET:');
console.log(`   ${secret}`);
console.log('\n📝 Скопируйте это значение в ваш .env файл:');
console.log(`   SESSION_SECRET=${secret}`);

console.log('\n🔒 Рекомендации по безопасности:');
console.log('1. Храните SESSION_SECRET в секрете');
console.log('2. Не коммитьте .env файл в git');
console.log('3. Используйте разные секреты для разных сред');
console.log('4. Регулярно обновляйте секреты');

console.log('\n🌍 Для разных сред:');
console.log(`   Development:  SESSION_SECRET=dev_${secret.slice(0, 16)}`);
console.log(`   Staging:      SESSION_SECRET=staging_${secret.slice(0, 16)}`);
console.log(`   Production:   SESSION_SECRET=prod_${secret.slice(0, 16)}`);

console.log('\n🔐 Генерация завершена!');
