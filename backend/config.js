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
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        },
        port: process.env.PORT || 3000,
    },
    ai: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
        }
    },
    // другие конфигурации могут быть добавлены здесь
}; 