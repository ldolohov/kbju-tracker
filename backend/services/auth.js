const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('./userService');

// Проверяем наличие необходимых переменных окружения
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials не настроены!');
    console.warn('   Установите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env файле');
}

// Настройка Google OAuth стратегии
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Создаем или обновляем пользователя
        const user = userService.createOrUpdateUser({
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value
        });
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Сериализация пользователя для сессии
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Десериализация пользователя из сессии
passport.deserializeUser(async (userId, done) => {
    try {
        const user = userService.getUserById(userId);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Middleware для проверки аутентификации
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Необходима аутентификация' });
};

// Middleware для получения текущего пользователя
const getCurrentUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.user = req.user;
    }
    next();
};

module.exports = {
    passport,
    isAuthenticated,
    getCurrentUser
};
