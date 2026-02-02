import { initDb, dbRun, dbGet } from './db.js';
import bcrypt from 'bcryptjs';

async function createUsers() {
  try {
    console.log('Initializing database...');
    await initDb();
    console.log('Database initialized');
    
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'hazaa', password: 'admin123', role: 'admin' },
      { username: 'ghaida', password: 'editor123', role: 'editor' },
      { username: 'Reham', password: 'editor123', role: 'editor' }
    ];
    
    for (const user of users) {
      try {
        // Check if user exists
        const existing = await dbGet('SELECT id FROM users WHERE username = ?', [user.username]);
        
        if (existing) {
          console.log(`User ${user.username} already exists, updating password...`);
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await dbRun(
            'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',
            [hashedPassword, user.role, user.username]
          );
          console.log(`✓ Updated ${user.username} (${user.role})`);
        } else {
          console.log(`Creating user ${user.username}...`);
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await dbRun(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [user.username, hashedPassword, user.role]
          );
          console.log(`✓ Created ${user.username} (${user.role})`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.username}:`, error.message);
      }
    }
    
    console.log('\n✅ User initialization complete!');
    console.log('\nUsers created:');
    console.log('  - admin / admin123 (admin)');
    console.log('  - hazaa / admin123 (admin)');
    console.log('  - ghaida / editor123 (editor)');
    console.log('  - Reham / editor123 (editor)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing users:', error);
    process.exit(1);
  }
}

createUsers();
