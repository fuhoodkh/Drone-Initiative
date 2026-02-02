import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For Vercel: use /tmp for database (only writable location)
// For local: use data directory
const DB_DIR = process.env.VERCEL 
  ? '/tmp/data' 
  : path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'platform.db');

let db = null;

export async function initDb() {
  // Ensure data directory exists
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    console.log('✓ Data directory ready:', DB_DIR);
  } catch (err) {
    console.error('Error creating data directory:', err);
    // On Vercel, /tmp should always be writable, but log the error
    if (process.env.VERCEL) {
      console.warn('Warning: Could not create DB directory, continuing anyway');
    } else {
      throw err;
    }
  }
  
  return new Promise((resolve, reject) => {
    const dbInstance = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }
      db = dbInstance;
      console.log('✓ Database connected:', DB_PATH);
      
      // Create tables
      db.serialize(() => {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'viewer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Sections metadata table
        db.run(`
          CREATE TABLE IF NOT EXISTS sections_meta (
            section_code TEXT PRIMARY KEY,
            owner TEXT,
            reviewer TEXT,
            approver TEXT,
            status TEXT DEFAULT 'draft',
            version TEXT DEFAULT 'v0.1',
            filename TEXT,
            filesize INTEGER,
            mime_type TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by TEXT
          )
        `);
        
        // Online links table
        db.run(`
          CREATE TABLE IF NOT EXISTS section_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_code TEXT NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (section_code) REFERENCES sections_meta(section_code)
          )
        `);
        
        // Section permissions (for sharing)
        db.run(`
          CREATE TABLE IF NOT EXISTS section_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_code TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            permission_type TEXT NOT NULL DEFAULT 'view',
            granted_by TEXT,
            granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(section_code, user_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (section_code) REFERENCES sections_meta(section_code)
          )
        `);
        
        // Audit log
        db.run(`
          CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_code TEXT,
            action TEXT NOT NULL,
            user TEXT,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Default admin user will be created by init-users.js script
        // This ensures proper bcrypt hashing
        
        // Wait for all table creation to complete
        db.run('SELECT 1', (err) => {
          if (err) {
            console.error('Database initialization error:', err);
            reject(err);
          } else {
            console.log('✓ Database tables initialized');
            resolve();
          }
        });
      });
    });
  });
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
