import express from 'express';
import { dbGet, dbAll, dbRun } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all users (for sharing dropdown) - MUST be before parameterized routes
// Using exact path match to avoid conflicts with :sectionCode routes
router.get('/users/list', verifyToken, async (req, res) => {
  try {
    console.log('📋 GET /api/permissions/users/list - Request received');
    
    // Get current user from DB to check role
    const currentUser = await dbGet('SELECT role FROM users WHERE username = ?', [req.user.username]);
    if (!currentUser) {
      console.error('❌ Current user not found in database');
      return res.status(404).json({ error: 'Current user not found' });
    }
    
    if (currentUser.role === 'viewer') {
      console.log('❌ Viewer attempted to access user list');
      return res.status(403).json({ error: 'Viewers cannot view user list' });
    }
    
    console.log('✅ Fetching all users for:', req.user.username, 'role:', currentUser.role);
    const users = await dbAll(
      'SELECT id, username, role, created_at FROM users ORDER BY username'
    );
    
    console.log(`✅ Returning ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

// Get sections accessible to current user
router.get('/my-sections', verifyToken, async (req, res) => {
  try {
    // Get user from database to get ID
    const userRecord = await dbGet('SELECT id, role FROM users WHERE username = ?', [req.user.username]);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRecord.id;
    const role = userRecord.role;
    
    // Admins and editors see all sections - return all section codes from SECTIONS array
    // For now, return a list that frontend will filter, or return all known section codes
    if (role === 'admin' || role === 'editor') {
      // Return all section codes - frontend has the full list
      // We could also query sections_meta, but for now return a signal that means "all"
      return res.json(['*']); // Special marker for "all sections"
    }
    
    // Viewers only see shared sections
    const sharedSections = await dbAll(
      `SELECT DISTINCT section_code FROM section_permissions WHERE user_id = ?`,
      [userId]
    );
    
    res.json(sharedSections.map(s => s.section_code));
  } catch (error) {
    console.error('Error fetching accessible sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Share section with user (admin/editor only)
router.post('/:sectionCode/share', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const { username, permissionType = 'view' } = req.body;
    
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot share sections' });
    }
    
    // Get target user
    const targetUser = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if section exists
    const section = await dbGet('SELECT section_code FROM sections_meta WHERE section_code = ?', [sectionCode]);
    if (!section) {
      // Create section if it doesn't exist
      await dbRun(
        'INSERT INTO sections_meta (section_code) VALUES (?)',
        [sectionCode]
      );
    }
    
    // Grant permission
    await dbRun(
      `INSERT OR REPLACE INTO section_permissions 
       (section_code, user_id, permission_type, granted_by) 
       VALUES (?, ?, ?, ?)`,
      [sectionCode, targetUser.id, permissionType, req.user.username]
    );
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'section_shared', req.user.username, JSON.stringify({ targetUser: username, permissionType })]
    );
    
    res.json({ message: 'Section shared successfully' });
  } catch (error) {
    console.error('Error sharing section:', error);
    res.status(500).json({ error: 'Failed to share section' });
  }
});

// Revoke section access (admin/editor only)
router.delete('/:sectionCode/share/:userId', verifyToken, async (req, res) => {
  try {
    const { sectionCode, userId } = req.params;
    
    // Get current user from DB to check role
    const currentUser = await dbGet('SELECT role FROM users WHERE username = ?', [req.user.username]);
    if (!currentUser || currentUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot revoke access' });
    }
    
    await dbRun(
      'DELETE FROM section_permissions WHERE section_code = ? AND user_id = ?',
      [sectionCode, userId]
    );
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'access_revoked', req.user.username, JSON.stringify({ userId })]
    );
    
    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

// Get users who have access to a section
router.get('/:sectionCode/access', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    
    // Get current user from DB to check role
    const currentUser = await dbGet('SELECT role FROM users WHERE username = ?', [req.user.username]);
    if (!currentUser || currentUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot view access list' });
    }
    
    const accessList = await dbAll(
      `SELECT u.id, u.username, u.role, sp.permission_type, sp.granted_by, sp.granted_at
       FROM section_permissions sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.section_code = ?
       ORDER BY sp.granted_at DESC`,
      [sectionCode]
    );
    
    res.json(accessList);
  } catch (error) {
    console.error('Error fetching access list:', error);
    res.status(500).json({ error: 'Failed to fetch access list' });
  }
});

export { router as permissionsRouter };
