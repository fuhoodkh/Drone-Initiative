import express from 'express';
import { dbGet, dbAll, dbRun } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all sections metadata
router.get('/', verifyToken, async (req, res) => {
  try {
    const sections = await dbAll('SELECT * FROM sections_meta');
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section metadata
router.get('/:sectionCode', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    
    // Check if user has access to this section
    const userRecord = await dbGet('SELECT id, role FROM users WHERE username = ?', [req.user.username]);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Admins and editors have access to all sections
    if (userRecord.role !== 'admin' && userRecord.role !== 'editor') {
      // Viewers need explicit permission
      const hasAccess = await dbGet(
        'SELECT id FROM section_permissions WHERE section_code = ? AND user_id = ?',
        [sectionCode, userRecord.id]
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this section' });
      }
    }
    
    const meta = await dbGet('SELECT * FROM sections_meta WHERE section_code = ?', [sectionCode]);
    
    if (!meta) {
      return res.json(null);
    }
    
    // Get links
    const links = await dbAll(
      'SELECT id, title, url, created_at FROM section_links WHERE section_code = ? ORDER BY created_at DESC',
      [sectionCode]
    );
    
    // Map snake_case to camelCase for frontend
    const response = {
      section_code: meta.section_code,
      owner: meta.owner,
      reviewer: meta.reviewer,
      approver: meta.approver,
      status: meta.status,
      version: meta.version,
      filename: meta.filename,
      size: meta.filesize,
      mime_type: meta.mime_type,
      updatedAt: meta.updated_at,
      updated_by: meta.updated_by,
      links: links.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        createdAt: link.created_at
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Update section metadata (admin/editor only)
router.put('/:sectionCode', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const { owner, reviewer, approver, status, version } = req.body;
    
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot modify metadata' });
    }
    
    const existing = await dbGet('SELECT * FROM sections_meta WHERE section_code = ?', [sectionCode]);
    
    if (existing) {
      await dbRun(
        `UPDATE sections_meta 
         SET owner = ?, reviewer = ?, approver = ?, status = ?, version = ?, 
             updated_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE section_code = ?`,
        [owner, reviewer, approver, status, version, req.user.username, sectionCode]
      );
    } else {
      await dbRun(
        `INSERT INTO sections_meta (section_code, owner, reviewer, approver, status, version, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sectionCode, owner, reviewer, approver, status || 'draft', version || 'v0.1', req.user.username]
      );
    }
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'metadata_updated', req.user.username, JSON.stringify(req.body)]
    );
    
    res.json({ message: 'Metadata updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Add online link (admin/editor only)
router.post('/:sectionCode/links', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const { title, url } = req.body;
    
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot add links' });
    }
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL required' });
    }
    
    const result = await dbRun(
      'INSERT INTO section_links (section_code, title, url) VALUES (?, ?, ?)',
      [sectionCode, title, url]
    );
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'link_added', req.user.username, JSON.stringify({ title, url })]
    );
    
    res.json({ id: result.lastID, message: 'Link added successfully' });
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// Update online link (admin/editor only)
router.put('/:sectionCode/links/:linkId', verifyToken, async (req, res) => {
  try {
    const { sectionCode, linkId } = req.params;
    const { title, url } = req.body;
    
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot update links' });
    }
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL required' });
    }
    
    const existing = await dbGet('SELECT id FROM section_links WHERE id = ? AND section_code = ?', [linkId, sectionCode]);
    if (!existing) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await dbRun(
      'UPDATE section_links SET title = ?, url = ? WHERE id = ? AND section_code = ?',
      [title, url, linkId, sectionCode]
    );
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'link_updated', req.user.username, JSON.stringify({ linkId, title, url })]
    );
    
    res.json({ message: 'Link updated successfully' });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Remove online link (admin/editor only)
router.delete('/:sectionCode/links/:linkId', verifyToken, async (req, res) => {
  try {
    const { sectionCode, linkId } = req.params;
    
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot remove links' });
    }
    
    await dbRun('DELETE FROM section_links WHERE id = ? AND section_code = ?', [linkId, sectionCode]);
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'link_removed', req.user.username, JSON.stringify({ linkId })]
    );
    
    res.json({ message: 'Link removed successfully' });
  } catch (error) {
    console.error('Error removing link:', error);
    res.status(500).json({ error: 'Failed to remove link' });
  }
});

// Get audit log for a section (admin only)
router.get('/:sectionCode/audit', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { sectionCode } = req.params;
    const logs = await dbAll(
      'SELECT * FROM audit_log WHERE section_code = ? ORDER BY timestamp DESC LIMIT 50',
      [sectionCode]
    );
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export { router as sectionsRouter };
