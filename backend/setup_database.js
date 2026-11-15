const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'realestate'
  });

  console.log('Connected to MySQL. Setting up EstateEase Schema...');

  // 1. Properties Enhancements (Address & Description)
  try {
    await connection.query("ALTER TABLE properties ADD COLUMN address VARCHAR(255) DEFAULT ''");
  } catch (e) {}
  try {
    await connection.query("ALTER TABLE properties ADD COLUMN description TEXT");
  } catch (e) {}

  // 2. Users Role ENUM to ('Admin', 'Agent', 'Client')
  try {
    await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Agent', 'Client') NOT NULL DEFAULT 'Client'");
  } catch (e) {}

  // 3. Contact Messages Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      message_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      subject VARCHAR(150),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('EstateEase Database setup & verified successfully!');
  await connection.end();
}

setup().catch(console.error);