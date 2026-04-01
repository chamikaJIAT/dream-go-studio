const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { logActivity } = require('../logger');

// Get all admins
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, username, password, role, permissions, createdAt FROM admins ORDER BY createdAt DESC');
        const parsedRows = rows.map(r => ({
            ...r,
            permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : (r.permissions || [])
        }));
        res.json({ success: true, admins: parsedRows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add an admin
router.post('/', async (req, res) => {
    try {
        const { name, username, password, role, permissions } = req.body;
        const [result] = await pool.query(
            "INSERT INTO admins (name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?)",
            [name, username, password, role, JSON.stringify(permissions || [])]
        );
        const newId = result.insertId;
        res.json({ success: true, admin: { id: newId, name, username, role, permissions } });

        // Log Admin Created
        logActivity({
            actorType: 'Admin',
            actorId: req.body.performingAdminId || null,
            actorName: req.body.performingAdminName || 'Super Admin',
            action: 'Created Admin',
            targetType: 'Admin',
            targetId: newId,
            details: `Admin account created for ${name} (${role}).`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update an admin
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, password, role, permissions } = req.body;
        await pool.query(
            "UPDATE admins SET name = ?, username = ?, password = ?, role = ?, permissions = ? WHERE id = ?",
            [name, username, password, role, JSON.stringify(permissions || []), id]
        );
        res.json({ success: true });

        // Log Admin Updated
        logActivity({
            actorType: 'Admin',
            actorId: req.body.performingAdminId || null,
            actorName: req.body.performingAdminName || 'Super Admin',
            action: 'Updated Admin',
            targetType: 'Admin',
            targetId: id,
            details: `Admin account '${name}' updated.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete an admin
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM admins WHERE id = ?", [id]);
        res.json({ success: true });

        // Log Admin Deleted
        logActivity({
            actorType: 'Admin',
            actorId: req.query.performingAdminId || null,
            actorName: req.query.performingAdminName || 'Super Admin',
            action: 'Deleted Admin',
            targetType: 'Admin',
            targetId: id,
            details: `Admin account (ID: ${id}) deleted.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
