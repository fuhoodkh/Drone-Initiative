import { initDb, dbRun, dbGet } from './db.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addUser() {
  try {
    console.log('Initializing database...');
    await initDb();
    console.log('✓ Database initialized\n');

    // Check for command line arguments
    let username, password, role;
    
    if (process.argv.length >= 3) {
      // Command line mode
      username = process.argv[2];
      password = process.argv[3] || 'viewer123'; // Default password
      role = process.argv[4] || 'viewer'; // Default role
      console.log(`Creating user: ${username} (${role})`);
    } else {
      // Interactive mode
      username = await question('Enter username: ');
      if (!username || username.trim() === '') {
        console.error('❌ Username is required');
        process.exit(1);
      }

      password = await question('Enter password: ');
      if (!password || password.trim() === '') {
        console.error('❌ Password is required');
        process.exit(1);
      }

      const roleInput = await question('Enter role (viewer/editor/admin) [default: viewer]: ');
      role = roleInput.trim() || 'viewer';
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      console.error('❌ Invalid role. Must be admin, editor, or viewer');
      process.exit(1);
    }

    // Check if user exists
    const existing = await dbGet('SELECT id, username, role FROM users WHERE username = ?', [username.trim()]);
    
    if (existing) {
      console.log(`\n⚠️  User "${username}" already exists (${existing.role})`);
      const update = await question('Update password and role? (y/n) [n]: ');
      if (update.toLowerCase() === 'y' || update.toLowerCase() === 'yes') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbRun(
          'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',
          [hashedPassword, role, username.trim()]
        );
        console.log(`✓ Updated user "${username}" (${role})`);
      } else {
        console.log('Cancelled.');
        process.exit(0);
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      await dbRun(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username.trim(), hashedPassword, role]
      );
      console.log(`\n✓ Created user "${username}" (${role})`);
    }

    console.log('\n✅ User operation complete!');
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

addUser();
