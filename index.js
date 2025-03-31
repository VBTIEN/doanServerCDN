const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cdnRoutes = require('./routes/cdnRoutes');
const path = require('path');

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Đây là origin của Vite React app
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Cấu hình middleware cơ bản
app.use(compression()); // Nén dữ liệu
//app.use(helmet());      // Bảo mật cơ bản
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Cho phép tài nguyên cross-origin
    })
);
app.use(cors(corsOptions));        // Thêm CORS
app.use(express.raw({ type: '*/*', limit: '10mb' })); // Nhận dữ liệu thô (file Excel)

// Phục vụ file tĩnh từ thư mục 'public'
app.use('/static', express.static(path.join(__dirname, 'public')));

// Kết nối routes
app.use('/cdn', cdnRoutes);

// Khởi động server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`scoremanagementCDN running at http://localhost:${PORT}`);
});