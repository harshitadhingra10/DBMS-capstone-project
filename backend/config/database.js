const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'realestate'
};

if (process.env.DB_SSL === 'true' || process.env.TIDB_ENABLE_SSL === 'true') {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
        return;
    }
    console.log('MySQL Connected Successfully!');
});

module.exports = db;