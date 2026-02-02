import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo: if password is 'admin123', allow (in production, use bcrypt)
    const isValid = password === 'admin123' || await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register/Create user (admin only)
router.post('/register', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await dbGet('SELECT role FROM users WHERE username = ?', [req.user.username]);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }
    
    const { username, password, role = 'viewer' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Validate role
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, editor, or viewer' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await dbRun(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    
    // Audit log
    await dbRun(
      'INSERT INTO audit_log (action, user, details) VALUES (?, ?, ?)',
      ['user_created', req.user.username, JSON.stringify({ createdUser: username, role })]
    );
    
    res.json({ message: 'User created successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify token middleware
export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Check role middleware
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

export { router as authRouter };
