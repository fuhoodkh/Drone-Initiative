import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'platform.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;

export async function initDb() {
  return new Promise((resolve, reject) => {
    const dbInstance = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }
      db = dbInstance;
      console.log('Database connected');
      
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
        
        // Create default admin user (password: admin123 - change in production!)
        db.run(`
          INSERT OR IGNORE INTO users (username, password_hash, role)
          VALUES ('admin', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin')
        `, (err) => {
          if (err) console.error('Error creating default admin:', err);
        });
      });
      
      resolve();
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
