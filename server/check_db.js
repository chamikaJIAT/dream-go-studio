const { pool } = require('./db');

async function checkHealth() {
    try {
        const [admins] = await pool.query("SELECT COUNT(*) as count FROM admins");
        const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
        const [bookings] = await pool.query("SELECT COUNT(*) as count FROM bookings");
        
        console.log(`Admins: ${admins[0].count}`);
        console.log(`Users: ${users[0].count}`);
        console.log(`Bookings: ${bookings[0].count}`);
        
        const [adminList] = await pool.query("SELECT username, role FROM admins");
        console.log("Current Admins:", JSON.stringify(adminList));
        
        process.exit(0);
    } catch (err) {
        console.error("Health Check Failed:", err.message);
        process.exit(1);
    }
}

checkHealth();
