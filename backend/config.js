require('dotenv').config();
module.exports = {
    database: {
        user: 'kbju_user',
        password: 'password',
        database: 'kbju_tracker',
        host: 'localhost',
        port: 5432,
    },
    server: {
        cors: {}, // разрешить все CORS-запросы
        port: 3000, // или любой другой порт
    },
    ai: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
        }
    },
    // другие конфигурации могут быть добавлены здесь
}; 