const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
};

async function migrate() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query("ALTER TABLE bookings ADD COLUMN paidAmount DECIMAL(12,2) DEFAULT 0.00 AFTER totalAmount;");
        console.log("Column paidAmount added successfully.");
        await connection.end();
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column paidAmount already exists.");
        } else {
            console.error("Migration failed:", err.message);
        }
    }
}

migrate();
