const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { fileTypeFromBuffer } = require('file-type'); // Thêm thư viện file-type

const cache = new NodeCache({ stdTTL: 600 }); // Cache mặc định 10 phút
const staticDir = path.join(__dirname, '../public');

// Tạo thư mục public nếu chưa tồn tại
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir);
    console.log(`Directory created: ${staticDir}`);
}

class CdnService {
    // --- File Management ---
    
    // Lưu file vào thư mục public và cache
    static async saveFile(entity, type, buffer) {
        let fileExtension;
        let fileName;

        // Xác định đuôi file dựa trên entity và nội dung buffer
        if (entity === 'images') {
            // Xác định loại file dựa trên buffer (magic number)
            const fileType = await fileTypeFromBuffer(buffer);
            if (fileType) {
                fileExtension = fileType.ext; // Ví dụ: jpg, png
            } else {
                fileExtension = 'jpg'; // Mặc định là jpg nếu không xác định được
            }
            fileName = `${entity}_${type}_${Date.now()}.${fileExtension}`; // Ví dụ: images_php_1711429252630.jpg
        } else {
            // Các loại file khác (scores, student-term-averages, v.v.) vẫn dùng .xlsx
            fileExtension = 'xlsx';
            fileName = `${entity}_${type}_${Date.now()}.${fileExtension}`; // Ví dụ: scores_js_123456.xlsx
        }

        const filePath = path.join(staticDir, fileName);

        fs.writeFileSync(filePath, buffer);
        const cacheKey = `${entity}_${type}`; // Ví dụ: images_php
        cache.set(cacheKey, filePath);
        console.log(`File saved and cached: ${filePath}`);

        return `/static/${fileName}`;
    }

    // Lấy file từ cache
    static getFile(entity, type) {
        const cacheKey = `${entity}_${type}`;
        return cache.get(cacheKey);
    }

    // --- Proxy Management ---

    // Proxy và cache dữ liệu từ backend
    static async proxyRequest(backendUrl, cacheKey) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`Serving from cache: ${cacheKey}`);
            return cachedData;
        }

        const response = await fetch(backendUrl);
        const data = await response.text();
        cache.set(cacheKey, data);
        return data;
    }
}

module.exports = CdnService;