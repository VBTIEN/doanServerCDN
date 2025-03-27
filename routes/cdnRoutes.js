const express = require('express');
const router = express.Router();
const cdnController = require('../controllers/cdnController');

// --- File Routes ---

// Nhận file từ backend
router.post('/upload-scores', cdnController.uploadScores);
router.post('/upload-student-term-averages', cdnController.uploadStudentTermAverages);
router.post('/upload-student-yearly-averages', cdnController.uploadStudentYearlyAverages);

// Nhận ảnh từ backend
router.post('/upload-images', cdnController.uploadImages);

// Tải file từ thư mục public dựa trên tên file
router.get('/download/:filename', cdnController.downloadFile);

// Phục vụ file từ cache
router.get('/:entity/:type', cdnController.getFile);

// --- Proxy Routes ---

// Proxy đến backend Laravel
router.get('/php/*', cdnController.proxyToPhp);

// Proxy đến backend Node.js
router.get('/js/*', cdnController.proxyToJs);

module.exports = router;