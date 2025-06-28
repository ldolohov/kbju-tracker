const express = require('express');
const multer = require('multer');
const { analyzeFood } = require('../services/ai');
const router = express.Router();

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/analyze-food', upload.single('image'), async (req, res) => {
    try {
        const imageBuffer = require('fs').readFileSync(req.file.path);
        const imageBase64 = imageBuffer.toString('base64');
        
        const result = await analyzeFood(imageBase64);
        
        // Сохранить в БД
        // await saveFoodEntry(result);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка анализа изображения' });
    }
});

module.exports = router;