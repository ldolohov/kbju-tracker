const config = require('./config');

console.log('=== Проверка конфигурации AI ===');
console.log('OpenAI API Key:', config.ai.openai.apiKey ? '✅ Установлен' : '❌ Не установлен');
console.log('OpenAI Model:', config.ai.openai.model);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('===============================');

// Проверяем доступность модели
if (config.ai.openai.apiKey) {
    console.log('✅ Конфигурация готова для продакшена');
} else {
    console.log('❌ Установите OPENAI_API_KEY в переменных окружения');
}
