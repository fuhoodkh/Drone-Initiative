import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { initDb } from './db.js';
import { migrateSections } from './migrate-sections.js';
import { authRouter } from './routes/auth.js';
import { sectionsRouter } from './routes/sections.js';
import { sectionDefinitionsRouter } from './routes/section-definitions.js';
import { filesRouter } from './routes/files.js';
import { permissionsRouter } from './routes/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
// For Vercel: use /tmp/uploads (only writable location)
// For Render: use persistent disk if available, otherwise server/uploads
// For local: use server/uploads
const UPLOADS_DIR = process.env.VERCEL 
  ? '/tmp/uploads' 
  : (process.env.RENDER_DISK_PATH ? path.join(process.env.RENDER_DISK_PATH, 'uploads') : path.join(__dirname, 'uploads'));

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
app.use('/api/section-definitions', sectionDefinitionsRouter);
app.use('/api/files', filesRouter(upload));
app.use('/api/permissions', permissionsRouter);

// Debug: Log all registered routes
console.log('📋 Registered routes:');
console.log('  - /api/auth/*');
console.log('  - /api/sections/*');
console.log('  - /api/section-definitions/* (CRUD for section cards)');
console.log('  - /api/files/*');
console.log('  - /api/permissions/*');
console.log('    ✓ GET /api/permissions/users/list (FIRST - before parameterized routes)');
console.log('    ✓ GET /api/permissions/my-sections');
console.log('    ✓ POST /api/permissions/:sectionCode/share');
console.log('    ✓ DELETE /api/permissions/:sectionCode/share/:userId');
console.log('    ✓ GET /api/permissions/:sectionCode/access');

// Health check (works without database)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbInitialized ? 'initialized' : 'not initialized',
    environment: process.env.NODE_ENV || 'development'
  });
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

// Initialize database and start server (for local development)
let dbInitialized = false;

async function initializeApp() {
  if (dbInitialized) return;
  
  try {
    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    console.log('✓ Uploads directory ready');
    
    // Initialize database
    await initDb();
    console.log('✓ Database initialized');
    
    // Migrate sections from FALLBACK_SECTIONS if sections table is empty
    // This preserves all existing metadata, links, and permissions
    try {
      const result = await migrateSections();
      if (result.migrated > 0) {
        console.log(`✅ Migrated ${result.migrated} sections from original definitions`);
      }
    } catch (error) {
      console.error('⚠️ Section migration error (non-fatal):', error.message);
      // Don't fail startup if migration fails - sections might already exist
    }
    
    // Check if users exist, if not create default users
    const { dbGet, dbRun } = await import('./db.js');
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    
    if (!userCount || userCount.count === 0) {
      console.log('⚠️ No users found, creating default users...');
      const bcrypt = (await import('bcryptjs')).default;
      
      const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'hazaa', password: 'admin123', role: 'admin' },
        { username: 'ghaida', password: 'editor123', role: 'editor' },
        { username: 'Reham', password: 'editor123', role: 'editor' }
      ];
      
      for (const user of defaultUsers) {
        try {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await dbRun(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [user.username, hashedPassword, user.role]
          );
          console.log(`✓ Created user: ${user.username} (${user.role})`);
        } catch (err) {
          if (err.message.includes('UNIQUE')) {
            console.log(`⚠️ User ${user.username} already exists`);
          } else {
            console.error(`❌ Error creating user ${user.username}:`, err.message);
          }
        }
      }
      console.log('✅ Default users initialization complete');
    } else {
      console.log(`✓ Found ${userCount.count} existing user(s)`);
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    throw error;
  }
}

// For Vercel/serverless: initialize on first request with error handling
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    if (!dbInitialized) {
      try {
        await initializeApp();
      } catch (error) {
        console.error('Initialization error:', error);
        console.error('Error stack:', error.stack);
        // Don't block requests - allow app to work without DB for health checks
        // Only fail on actual database-dependent routes
        dbInitialized = false; // Allow retry on next request
      }
    }
    next();
  });
}

// For local development: start the server
if (!process.env.VERCEL) {
  async function startServer() {
    try {
      await initializeApp();
      
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
  
  startServer();
}

// Export app for Vercel
export default app;
