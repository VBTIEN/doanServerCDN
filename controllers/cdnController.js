const CdnService = require('../services/cdnService');
const path = require('path');
const fs = require('fs');

const cdnController = {
    // --- File Handling ---

    uploadScores: async (req, res) => {
        const type = req.query.type;
        if (!type || !['php', 'js'].includes(type)) {
            return res.status(400).send('Invalid type parameter');
        }

        try {
            const url = await CdnService.saveFile('scores', type, req.body);
            res.json({ status: 'success', url });
        } catch (error) {
            console.error(`Error saving scores file: ${error.message}`);
            res.status(500).send('Error saving scores file');
        }
    },

    uploadStudentTermAverages: async (req, res) => {
        const type = req.query.type;
        if (!type || !['php', 'js'].includes(type)) {
            return res.status(400).send('Invalid type parameter');
        }

        try {
            const url = await CdnService.saveFile('student-term-averages', type, req.body);
            res.json({ status: 'success', url });
        } catch (error) {
            console.error(`Error saving student term averages file: ${error.message}`);
            res.status(500).send('Error saving student term averages file');
        }
    },

    uploadStudentYearlyAverages: async (req, res) => {
        const type = req.query.type;
        if (!type || !['php', 'js'].includes(type)) {
            return res.status(400).send('Invalid type parameter');
        }

        try {
            const url = await CdnService.saveFile('student-yearly-averages', type, req.body);
            res.json({ status: 'success', url });
        } catch (error) {
            console.error(`Error saving student yearly averages file: ${error.message}`);
            res.status(500).send('Error saving student yearly averages file');
        }
    },

    uploadImages: async (req, res) => {
        const type = req.query.type;
        if (!type || !['php', 'js'].includes(type)) {
            return res.status(400).send('Invalid type parameter');
        }

        try {
            const url = await CdnService.saveFile('images', type, req.body);
            res.json({ status: 'success', url });
        } catch (error) {
            console.error(`Error saving image: ${error.message}`);
            res.status(500).send('Error saving image');
        }
    },

    getFile: (req, res) => {
        const { entity, type } = req.params;
        const validEntities = ['scores', 'student-term-averages', 'student-yearly-averages', 'images'];
        if (!validEntities.includes(entity) || !['php', 'js'].includes(type)) {
            return res.status(400).send('Invalid entity or type parameter');
        }

        const filePath = CdnService.getFile(entity, type);
        if (filePath) {
            console.log(`Serving cached file: ${entity}_${type}`);
            return res.sendFile(filePath);
        }

        res.status(404).send('File not found in cache');
    },

    downloadFile: (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../public', filename);

        if (fs.existsSync(filePath)) {
            console.log(`Serving file for download: ${filePath}`);
            res.download(filePath, filename, (err) => {
                if (err) {
                    console.error(`Error sending file: ${err.message}`);
                    res.status(500).send('Error downloading file');
                }
            });
        } else {
            console.error(`File not found: ${filePath}`);
            res.status(404).send('File not found');
        }
    },

    // --- Proxy Handling ---

    proxyToPhp: async (req, res) => {
        const backendUrl = `http://localhost:8000${req.path.replace('/php', '')}`;
        const cacheKey = `php_${req.path}`;

        try {
            const data = await CdnService.proxyRequest(backendUrl, cacheKey);
            res.send(data);
        } catch (error) {
            console.error(`Error fetching from Laravel: ${error.message}`);
            res.status(500).send('Error fetching from Laravel backend');
        }
    },

    proxyToJs: async (req, res) => {
        const backendUrl = `http://localhost:3000${req.path.replace('/js', '')}`;
        const cacheKey = `js_${req.path}`;

        try {
            const data = await CdnService.proxyRequest(backendUrl, cacheKey);
            res.send(data);
        } catch (error) {
            console.error(`Error fetching from Node.js: ${error.message}`);
            res.status(500).send('Error fetching from Node.js backend');
        }
    },
};

module.exports = cdnController;