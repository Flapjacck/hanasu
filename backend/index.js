const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Hanasu OCR Backend API',
        version: '1.0.0',
        endpoints: {
            'POST /ocr': 'Extract text from uploaded image',
            'GET /health': 'Health check'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// OCR endpoint
app.post('/ocr', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;
        const languages = req.body.languages || 'en,ja'; // Default to English and Japanese

        console.log(`Processing image: ${imagePath}`);        // Run Python OCR script
        const options = {
            mode: 'text',
            pythonPath: 'python', // Adjust if needed
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [imagePath, languages]
        };

        console.log('Starting Python OCR script...');
        
        // Add timeout for Python script
        const pythonProcess = PythonShell.run('ocr_processor.py', options, (err, results) => {
            // Clean up uploaded file
            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            });

            if (err) {
                console.error('Python script error:', err);
                return res.status(500).json({ 
                    error: 'OCR processing failed',
                    details: err.message 
                });
            }

            if (!results || results.length === 0) {
                return res.status(500).json({ 
                    error: 'No output from Python script',
                    details: 'The OCR script ran but produced no output'
                });
            }

            try {
                console.log('Python script output:', results[0]);
                const ocrResult = JSON.parse(results[0]);
                res.json({
                    success: true,
                    filename: req.file.originalname,
                    text_extracted: ocrResult.text_extracted,
                    confidence_scores: ocrResult.confidence_scores,
                    processing_time: ocrResult.processing_time
                });
            } catch (parseErr) {
                console.error('JSON parse error:', parseErr);
                res.status(500).json({ 
                    error: 'Failed to parse OCR results',
                    raw_output: results
                });
            }
        });

        // Set timeout for the request (30 seconds)
        setTimeout(() => {
            if (!res.headersSent) {
                pythonProcess.kill();
                res.status(408).json({ 
                    error: 'OCR processing timeout',
                    details: 'The OCR process took too long and was terminated'
                });
            }
        }, 30000);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OCR endpoint: POST http://localhost:${PORT}/ocr`);
});
