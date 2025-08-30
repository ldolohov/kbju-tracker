const passport = require('passport');
const userService = require('./userService');

// Проверяем наличие необходимых переменных окружения для Google OAuth
const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

if (!hasGoogleOAuth) {
    console.warn('⚠️  Google OAuth credentials не настроены!');
    console.warn('   Установите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env файле');
    console.warn('   Аутентификация будет отключена');
} else {
    console.log('✅ Google OAuth настроен');
    
    // Импортируем Google Strategy только при наличии credentials
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    
    // Настройка Google OAuth стратегии
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
                       (process.env.NODE_ENV === 'production' 
                        ? 'https://kbju-tracker.onrender.com/auth/google/callback'
                        : 'http://localhost:3000/auth/google/callback');
    
    console.log('Google OAuth callback URL:', callbackURL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('GOOGLE_CALLBACK_URL from env:', process.env.GOOGLE_CALLBACK_URL);
    
    // Добавляем scope для Google OAuth
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        scope: ['profile', 'email'] // Добавляем необходимые scope
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
}

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
    if (!hasGoogleOAuth) {
        // Если Google OAuth не настроен, пропускаем аутентификацию
        console.warn('⚠️  Аутентификация отключена - Google OAuth не настроен');
        return next();
    }
    
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Необходима аутентификация' });
};

// Middleware для получения текущего пользователя
const getCurrentUser = (req, res, next) => {
    if (!hasGoogleOAuth) {
        // Если Google OAuth не настроен, создаем заглушку пользователя
        req.user = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@example.com',
            picture: null
        };
        return next();
    }
    
    if (req.isAuthenticated()) {
        req.user = req.user;
    }
    next();
};

module.exports = {
    passport,
    isAuthenticated,
    getCurrentUser,
    hasGoogleOAuth
};
