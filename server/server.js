import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { initDb } from './db.js';
import { authRouter } from './routes/auth.js';
import { sectionsRouter } from './routes/sections.js';
import { filesRouter } from './routes/files.js';
import { permissionsRouter } from './routes/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from platform directory
app.use(express.static(path.join(__dirname, '..', 'platform')));
// Also serve docs directory for logo and other assets
app.use('/docs', express.static(path.join(__dirname, '..', 'docs')));

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const sectionCode = req.params.sectionCode || 'default';
    const sectionDir = path.join(UPLOADS_DIR, sectionCode);
    await fs.mkdir(sectionDir, { recursive: true });
    cb(null, sectionDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX'));
    }
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/files', filesRouter(upload));
app.use('/api/permissions', permissionsRouter);

// Debug: Log all registered routes
console.log('📋 Registered routes:');
console.log('  - /api/auth/*');
console.log('  - /api/sections/*');
console.log('  - /api/files/*');
console.log('  - /api/permissions/*');
console.log('    ✓ GET /api/permissions/users/list (FIRST - before parameterized routes)');
console.log('    ✓ GET /api/permissions/my-sections');
console.log('    ✓ POST /api/permissions/:sectionCode/share');
console.log('    ✓ DELETE /api/permissions/:sectionCode/share/:userId');
console.log('    ✓ GET /api/permissions/:sectionCode/access');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve platform index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'platform', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    console.log('✓ Uploads directory ready');
    
    // Initialize database
    await initDb();
    console.log('✓ Database initialized');

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Platform files: ${path.join(__dirname, '..', 'platform')}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
      console.log(`✓ Test: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
