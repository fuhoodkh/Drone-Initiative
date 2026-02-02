import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { dbGet, dbRun } from '../db.js';
import { verifyToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

export function filesRouter(upload) {
  const router = express.Router();
  
  // Upload file (admin/editor only)
  router.post('/:sectionCode', verifyToken, upload.single('file'), async (req, res) => {
    try {
      const { sectionCode } = req.params;
      
      if (req.user.role === 'viewer') {
        return res.status(403).json({ error: 'Viewers cannot upload files' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Update or create metadata
      const existing = await dbGet('SELECT * FROM sections_meta WHERE section_code = ?', [sectionCode]);
      
      if (existing) {
        // Delete old file if exists
        if (existing.filename) {
          try {
            await fs.unlink(path.join(UPLOADS_DIR, sectionCode, existing.filename));
          } catch (e) {
            // File might not exist, ignore
          }
        }
        
        await dbRun(
          `UPDATE sections_meta 
           SET filename = ?, filesize = ?, mime_type = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
           WHERE section_code = ?`,
          [req.file.filename, req.file.size, req.file.mimetype, req.user.username, sectionCode]
        );
      } else {
        await dbRun(
          `INSERT INTO sections_meta (section_code, filename, filesize, mime_type, updated_by)
           VALUES (?, ?, ?, ?, ?)`,
          [sectionCode, req.file.filename, req.file.size, req.file.mimetype, req.user.username]
        );
      }
      
      // Audit log
      await dbRun(
        'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
        [sectionCode, 'file_uploaded', req.user.username, JSON.stringify({
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        })]
      );
      
      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
  
  // Download file
  router.get('/:sectionCode', verifyToken, async (req, res) => {
    try {
      const { sectionCode } = req.params;
      const meta = await dbGet('SELECT * FROM sections_meta WHERE section_code = ?', [sectionCode]);
      
      if (!meta || !meta.filename) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const filePath = path.join(UPLOADS_DIR, sectionCode, meta.filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: 'File not found on disk' });
      }
      
      res.download(filePath, meta.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ error: 'Failed to download file' });
        } else {
          // Audit log
          dbRun(
            'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
            [sectionCode, 'file_downloaded', req.user.username, JSON.stringify({ filename: meta.filename })]
          ).catch(console.error);
        }
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
  
  // Delete file (admin/editor only)
  router.delete('/:sectionCode', verifyToken, async (req, res) => {
    try {
      const { sectionCode } = req.params;
      
      if (req.user.role === 'viewer') {
        return res.status(403).json({ error: 'Viewers cannot delete files' });
      }
      
      const meta = await dbGet('SELECT * FROM sections_meta WHERE section_code = ?', [sectionCode]);
      
      if (meta && meta.filename) {
        const filePath = path.join(UPLOADS_DIR, sectionCode, meta.filename);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          // File might not exist, continue
        }
        
        await dbRun(
          'UPDATE sections_meta SET filename = NULL, filesize = NULL, mime_type = NULL, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE section_code = ?',
          [req.user.username, sectionCode]
        );
        
        // Audit log
        await dbRun(
          'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
          [sectionCode, 'file_deleted', req.user.username, JSON.stringify({ filename: meta.filename })]
        );
      }
      
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });
  
  return router;
}
