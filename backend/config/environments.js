/**
 * Конфигурация для разных сред разработки
 */

const environments = {
    development: {
        google: {
            callbackURL: 'http://localhost:3000/auth/google/callback'
        },
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5000']
        },
        session: {
            secure: false,
            sameSite: 'lax'
        },
        logging: 'verbose'
    },
    
    staging: {
        google: {
            callbackURL: 'https://kbju-tracker-staging.onrender.com/auth/google/callback'
        },
        cors: {
            origin: ['https://kbju-tracker-staging.onrender.com']
        },
        session: {
            secure: true,
            sameSite: 'none'
        },
        logging: 'debug'
    },
    
    production: {
        google: {
            callbackURL: 'https://kbju-tracker.onrender.com/auth/google/callback'
        },
        cors: {
            origin: ['https://kbju-tracker.onrender.com']
        },
        session: {
            secure: true,
            sameSite: 'none'
        },
        logging: 'info'
    }
};

module.exports = environments;
