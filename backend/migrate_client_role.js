const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('Migrating database to support Client role...');

  // 1. Modify users.role enum
  await new Promise((resolve, reject) => {
    db.query("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Agent', 'Client') NOT NULL DEFAULT 'Client'", (err) => {
      if (err) console.error('Modify role error:', err);
      else console.log('Successfully updated users.role to include Client!');
      resolve();
    });
  });

  // 2. Create seed Client users for the existing clients so they can log in
  const defaultPassword = bcrypt.hashSync('client123', 10);

  const clientAccounts = [
    { name: 'Nishtha (Client)', email: 'nishtha.client@example.com', phone: '9811111111', budget: 8000000 },
    { name: 'Muskan (Client)', email: 'muskan.client@example.com', phone: '9822222222', budget: 5000000 },
    { name: 'Harshita (Client)', email: 'harshita.client@example.com', phone: '9833333333', budget: 12000000 }
  ];

  for (const c of clientAccounts) {
    const exists = await new Promise(res => {
      db.query('SELECT user_id FROM users WHERE email = ?', [c.email], (e, r) => res(r && r.length > 0));
    });

    if (!exists) {
      await new Promise(res => {
        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [c.name, c.email, defaultPassword, 'Client'], (err, r) => {
          if (err) console.error('Error creating user for client ' + c.email, err);
          else console.log(`Created Client user account: ${c.email}`);
          res();
        });
      });
    }
  }

  console.log('Client role migration finished successfully!');
  process.exit(0);
}

migrate();
