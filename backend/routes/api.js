const express = require('express');
const multer = require('multer');
const { analyzeFood } = require('../services/ai');
const userService = require('../services/userService');
const { isAuthenticated } = require('../services/auth');
const router = express.Router();

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Анализ изображения еды (требует аутентификации)
router.post('/analyze-food', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const imageBuffer = require('fs').readFileSync(req.file.path);
        const imageBase64 = imageBuffer.toString('base64');
        
        const result = await analyzeFood(imageBase64);
        
        // Сохраняем результат в БД пользователя
        const savedEntry = userService.saveFoodEntry(req.user.id, result);
        
        res.json({
            ...result,
            id: savedEntry.id,
            timestamp: savedEntry.timestamp
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка анализа изображения' });
    }
});

// Получение истории еды пользователя
router.get('/food-history', isAuthenticated, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = userService.getFoodHistory(req.user.id, limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения истории' });
    }
});

// Получение статистики пользователя
router.get('/stats', isAuthenticated, (req, res) => {
    try {
        const stats = userService.getUserStats(req.user.id);
        if (!stats) {
            return res.status(404).json({ error: 'Статистика не найдена' });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

// Обновление дневных целей
router.put('/daily-targets', isAuthenticated, (req, res) => {
    try {
        const { calories, protein, fats, carbs } = req.body;
        const targets = { calories, protein, fats, carbs };
        
        const updatedTargets = userService.updateDailyTargets(req.user.id, targets);
        res.json(updatedTargets);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления целей' });
    }
});

// Удаление записи о еде
router.delete('/food-entry/:entryId', isAuthenticated, (req, res) => {
    try {
        const { entryId } = req.params;
        const deletedEntry = userService.deleteFoodEntry(req.user.id, entryId);
        res.json({ message: 'Запись удалена', deletedEntry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение профиля пользователя
router.get('/profile', isAuthenticated, (req, res) => {
    try {
        const user = userService.getUserById(req.user.id);
        const userData = userService.getUserData(req.user.id);
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                createdAt: user.createdAt
            },
            preferences: userData.preferences
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения профиля' });
    }
});

module.exports = router;