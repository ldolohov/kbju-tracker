const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const config = require('./config');

// Импортируем аутентификацию
const { passport, hasGoogleOAuth } = require('./services/auth');

const app = express();

// Middleware
app.use(cors(config.server.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Настройка сессий
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    console.warn('⚠️  ВНИМАНИЕ: Используется MemoryStore для сессий в продакшн!');
    console.warn('   Это может вызвать проблемы с памятью и масштабированием.');
    console.warn('   Рекомендуется настроить Redis или другое хранилище сессий.');
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Временно отключаем для локального тестирования
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        sameSite: 'lax' // Временно используем lax для локального тестирования
    }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        authenticated: req.isAuthenticated(),
        authDisabled: !hasGoogleOAuth
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || config.server.port;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
    
    if (hasGoogleOAuth) {
        console.log('✅ Google OAuth настроен');
    } else {
        console.log('⚠️  Google OAuth не настроен - аутентификация отключена');
    }
});