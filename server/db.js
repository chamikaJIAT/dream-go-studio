const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234'
};

const pool = mysql.createPool({
    ...dbConfig,
    database: 'dream_go_studio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initializeDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS dream_go_studio;`);
        console.log("Database 'dream_go_studio' checked/created.");
        await connection.query(`USE dream_go_studio;`);

        // --- CREATE ALL TABLES IF THEY DON'T EXIST ---

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255),
                mobile VARCHAR(20) UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Customer',
                status VARCHAR(50) DEFAULT 'Active',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price VARCHAR(50),
                category VARCHAR(100),
                duration VARCHAR(50),
                imagePath VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customerId INT,
                customerName VARCHAR(255),
                mobile VARCHAR(20),
                packageIds JSON,
                packageTitle VARCHAR(255),
                category VARCHAR(100),
                hotelName VARCHAR(255),
                bookingDate VARCHAR(50),
                coupleName VARCHAR(255),
                birthdayPersonName VARCHAR(255),
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                totalAmount DECIMAL(12,2) DEFAULT 0.00,
                paidAmount DECIMAL(12,2) DEFAULT 0.00,
                pendingPaidAmount DECIMAL(12,2) DEFAULT 0.00,
                status VARCHAR(50) DEFAULT 'Pending',
                paymentStatus VARCHAR(50) DEFAULT 'Unpaid',
                paymentReceiptUrl VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS gallery_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                coverImage VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS gallery_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoryId INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                coverImage VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoryId) REFERENCES gallery_categories(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS gallery_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                eventId INT NOT NULL,
                url VARCHAR(500) NOT NULL,
                uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eventId) REFERENCES gallery_events(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                subject VARCHAR(255),
                message TEXT,
                status VARCHAR(50) DEFAULT 'Unread',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                position VARCHAR(100),
                email VARCHAR(255),
                phone VARCHAR(20),
                joinDate VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Active',
                role VARCHAR(50) DEFAULT 'Staff',
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                permissions JSON,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS old_bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customerName VARCHAR(255),
                mobile VARCHAR(20),
                category VARCHAR(100),
                bookingDate VARCHAR(50),
                location VARCHAR(500),
                totalAmount DECIMAL(12,2),
                notes TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                actorType ENUM('Admin', 'Customer', 'System') DEFAULT 'System',
                actorId INT,
                actorName VARCHAR(255),
                action VARCHAR(255) NOT NULL,
                targetType VARCHAR(100),
                targetId INT,
                details TEXT,
                ipAddress VARCHAR(45),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("All tables checked/created with IF NOT EXISTS.");


        // Insert default superadmin (IGNORE duplicates)
        await connection.query(
            "INSERT IGNORE INTO admins (name, username, password, role) VALUES (?, ?, ?, ?)",
            ['System Admin', 'admin', '1234', 'superadmin']
        );
        console.log("Default admin created: admin / 1234");

        connection.end();
        console.log("--- MySQL Initialization Complete ---");
    } catch (error) {
        console.error("Database initialization failed:", error.message);
    }
}

module.exports = { pool, initializeDB };

