const express = require('express');
const passport = require('passport');
const router = express.Router();

// Инициализация Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback после успешной аутентификации
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    })
);

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
