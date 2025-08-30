require('dotenv').config();
const environments = require('./config/environments');

// Определяем текущую среду
const currentEnv = process.env.NODE_ENV || 'development';
const envConfig = environments[currentEnv];

console.log(`🌍 Загружена конфигурация для среды: ${currentEnv}`);

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
            origin: envConfig.cors.origin,
            credentials: true
        },
        port: process.env.PORT || 3000,
    },
    ai: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
        }
    },
    google: {
        callbackURL: envConfig.google.callbackURL
    },
    session: {
        secure: envConfig.session.secure,
        sameSite: envConfig.session.sameSite
    },
    logging: envConfig.logging,
    environment: currentEnv
}; 