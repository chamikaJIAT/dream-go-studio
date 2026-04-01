const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { logActivity } = require('../logger');

// Client Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query(
            "SELECT id, name, username, email, mobile, role, status FROM users WHERE username = ? AND password = ?",
            [username, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            if (user.status === 'Inactive') {
                return res.status(403).json({ success: false, message: "Your account is deactivated. Please contact support." });
            }
            res.json({ success: true, user });
            
            // Log Login
            logActivity({
                actorType: 'Customer',
                actorId: user.id,
                actorName: user.name,
                action: 'Login',
                details: `Customer ${user.name} logged in.`,
                ipAddress: req.ip
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query(
            "SELECT id, name, username, role, permissions FROM admins WHERE username = ? AND password = ?",
            [username, password]
        );
        
        if (rows.length > 0) {
            const adminData = rows[0];
            adminData.permissions = typeof adminData.permissions === 'string' 
                ? JSON.parse(adminData.permissions) 
                : (adminData.permissions || []);
            res.json({ success: true, user: adminData });

            // Log Admin Login
            logActivity({
                actorType: 'Admin',
                actorId: adminData.id,
                actorName: adminData.name,
                action: 'Login',
                details: `Admin ${adminData.name} (${adminData.role}) logged in.`,
                ipAddress: req.ip
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid admin credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Register new client
router.post('/register', async (req, res) => {
    try {
        const { name, email, mobile, password, username, role } = req.body;
        
        // Ensure username or mobile isn't already used
        const [existing] = await pool.query("SELECT id FROM users WHERE username = ? OR mobile = ?", [username, mobile]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Username or Mobile number already exists." });
        }

        const [result] = await pool.query(
            "INSERT INTO users (name, username, email, mobile, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            [name, username, email || null, mobile, password || mobile, role || 'Customer']
        );
        
        const newId = result.insertId;
        res.json({ success: true, user: { id: newId, name, username, email, mobile, role: role || 'Customer' } });

        // Log Register
        logActivity({
            actorType: 'Customer',
            actorId: newId,
            actorName: name,
            action: 'Register',
            details: `New customer ${name} registered.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get all users (for Admin Panel)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, username, email, mobile, role, status, createdAt FROM users WHERE role = 'Customer' ORDER BY createdAt DESC");
        res.json({ success: true, users: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
