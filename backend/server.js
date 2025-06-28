const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware
app.use(cors(config.server.cors));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api', require('./routes/api'));

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || config.server.port;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});