import express from 'express';
import { dbGet, dbAll, dbRun } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all section definitions (admin/editor only, viewers see only shared sections)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userRecord = await dbGet('SELECT id, role FROM users WHERE username = ?', [req.user.username]);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    let sections;
    if (userRecord.role === 'admin' || userRecord.role === 'editor') {
      // Admins and editors see all sections
      sections = await dbAll('SELECT * FROM sections ORDER BY phase, section_code');
    } else {
      // Viewers see only sections they have access to
      const accessibleSections = await dbAll(
        `SELECT DISTINCT s.* FROM sections s
         INNER JOIN section_permissions sp ON s.section_code = sp.section_code
         WHERE sp.user_id = ?
         ORDER BY s.phase, s.section_code`,
        [userRecord.id]
      );
      sections = accessibleSections;
    }

    // Map snake_case to camelCase
    const mapped = sections.map(s => ({
      code: s.section_code,
      phase: s.phase,
      kickerAr: s.kicker_ar,
      titleAr: s.title_ar,
      purposeAr: s.purpose_ar,
      audienceAr: s.audience_ar,
      howAr: s.how_ar,
      kickerEn: s.kicker_en,
      titleEn: s.title_en,
      purposeEn: s.purpose_en,
      audienceEn: s.audience_en,
      howEn: s.how_en,
      guideAr: s.guide_ar,
      guideEn: s.guide_en,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      createdBy: s.created_by,
      updatedBy: s.updated_by
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section definition
router.get('/:sectionCode', verifyToken, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    
    const userRecord = await dbGet('SELECT id, role FROM users WHERE username = ?', [req.user.username]);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check access for viewers
    if (userRecord.role !== 'admin' && userRecord.role !== 'editor') {
      const hasAccess = await dbGet(
        'SELECT id FROM section_permissions WHERE section_code = ? AND user_id = ?',
        [sectionCode, userRecord.id]
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this section' });
      }
    }

    const section = await dbGet('SELECT * FROM sections WHERE section_code = ?', [sectionCode]);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Map to camelCase
    res.json({
      code: section.section_code,
      phase: section.phase,
      kickerAr: section.kicker_ar,
      titleAr: section.title_ar,
      purposeAr: section.purpose_ar,
      audienceAr: section.audience_ar,
      howAr: section.how_ar,
      kickerEn: section.kicker_en,
      titleEn: section.title_en,
      purposeEn: section.purpose_en,
      audienceEn: section.audience_en,
      howEn: section.how_en,
      guideAr: section.guide_ar,
      guideEn: section.guide_en,
      createdAt: section.created_at,
      updatedAt: section.updated_at,
      createdBy: section.created_by,
      updatedBy: section.updated_by
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Create new section (admin/editor only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot create sections' });
    }

    const {
      code, phase, kickerAr, titleAr, purposeAr, audienceAr, howAr,
      kickerEn, titleEn, purposeEn, audienceEn, howEn, guideAr, guideEn
    } = req.body;

    if (!code || !phase || !titleAr || !titleEn) {
      return res.status(400).json({ error: 'Code, phase, and titles (AR/EN) are required' });
    }

    // Check if section already exists
    const existing = await dbGet('SELECT section_code FROM sections WHERE section_code = ?', [code]);
    if (existing) {
      return res.status(409).json({ error: 'Section with this code already exists' });
    }

    await dbRun(
      `INSERT INTO sections (
        section_code, phase, kicker_ar, title_ar, purpose_ar, audience_ar, how_ar,
        kicker_en, title_en, purpose_en, audience_en, how_en, guide_ar, guide_en,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, phase, kickerAr || null, titleAr, purposeAr || null, audienceAr || null, howAr || null,
        kickerEn || null, titleEn, purposeEn || null, audienceEn || null, howEn || null,
        guideAr || null, guideEn || null, req.user.username, req.user.username
      ]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [code, 'section_created', req.user.username, JSON.stringify({ code, phase, titleAr, titleEn })]
    );

    res.status(201).json({ message: 'Section created successfully', code });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section (admin/editor only)
router.put('/:sectionCode', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot update sections' });
    }

    const { sectionCode } = req.params;
    const {
      phase, kickerAr, titleAr, purposeAr, audienceAr, howAr,
      kickerEn, titleEn, purposeEn, audienceEn, howEn, guideAr, guideEn
    } = req.body;

    const existing = await dbGet('SELECT section_code FROM sections WHERE section_code = ?', [sectionCode]);
    if (!existing) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await dbRun(
      `UPDATE sections SET
        phase = ?, kicker_ar = ?, title_ar = ?, purpose_ar = ?, audience_ar = ?, how_ar = ?,
        kicker_en = ?, title_en = ?, purpose_en = ?, audience_en = ?, how_en = ?,
        guide_ar = ?, guide_en = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE section_code = ?`,
      [
        phase, kickerAr || null, titleAr, purposeAr || null, audienceAr || null, howAr || null,
        kickerEn || null, titleEn, purposeEn || null, audienceEn || null, howEn || null,
        guideAr || null, guideEn || null, req.user.username, sectionCode
      ]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'section_updated', req.user.username, JSON.stringify(req.body)]
    );

    res.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete section (admin only)
router.delete('/:sectionCode', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete sections' });
    }

    const { sectionCode } = req.params;

    const existing = await dbGet('SELECT section_code FROM sections WHERE section_code = ?', [sectionCode]);
    if (!existing) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Delete related data (cascade)
    await dbRun('DELETE FROM section_links WHERE section_code = ?', [sectionCode]);
    await dbRun('DELETE FROM section_permissions WHERE section_code = ?', [sectionCode]);
    await dbRun('DELETE FROM sections_meta WHERE section_code = ?', [sectionCode]);
    await dbRun('DELETE FROM sections WHERE section_code = ?', [sectionCode]);

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      [sectionCode, 'section_deleted', req.user.username, JSON.stringify({ sectionCode })]
    );

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export { router as sectionDefinitionsRouter };
