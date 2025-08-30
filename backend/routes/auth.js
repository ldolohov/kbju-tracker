const express = require('express');
const passport = require('passport');
const router = express.Router();

// Инициализация Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback после успешной аутентификации
router.get('/google/callback', (req, res, next) => {
    console.log('🔐 Google OAuth Callback: Получен callback');
    console.log('🔐 Query params:', req.query);
    console.log('🔐 Session ID:', req.sessionID);
    console.log('🔐 User agent:', req.headers['user-agent']);
    
    // Проверяем наличие ошибки от Google
    if (req.query.error) {
        console.error('🔐 Google OAuth Error:', req.query.error);
        console.error('🔐 Error description:', req.query.error_description);
        return res.redirect('/?error=auth_failed&reason=' + encodeURIComponent(req.query.error_description || req.query.error));
    }
    
    passport.authenticate('google', { 
        failureRedirect: '/?error=auth_failed',
        successRedirect: '/?success=auth_success'
    })(req, res, next);
});

// Выход из системы
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.json({ message: 'Успешный выход' });
    });
});

// Проверка статуса аутентификации
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                picture: req.user.picture
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;
