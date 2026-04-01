const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { logActivity } = require('../logger');

// Get all packages
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM packages ORDER BY createdAt DESC');
        res.json({ success: true, packages: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a new package
router.post('/', async (req, res) => {
    try {
        const { title, description, price, category, duration, imagePath } = req.body;
        const [result] = await pool.query(
            "INSERT INTO packages (title, description, price, category, duration, imagePath) VALUES (?, ?, ?, ?, ?, ?)",
            [title, description, price, category, duration || null, imagePath || null]
        );
        const newId = result.insertId;
        res.json({ success: true, package: { id: newId, title, description, price, category } });

        // Log Package Added
        logActivity({
            actorType: 'Admin',
            actorId: req.body.adminId || null,
            actorName: req.body.adminName || 'Admin',
            action: 'Created Package',
            targetType: 'Package',
            targetId: newId,
            details: `Package '${title}' added.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update a package
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category } = req.body;
        await pool.query(
            "UPDATE packages SET title = ?, description = ?, price = ?, category = ? WHERE id = ?",
            [title, description, price, category, id]
        );
        res.json({ success: true });

        // Log Package Updated
        logActivity({
            actorType: 'Admin',
            actorId: req.body.adminId || null,
            actorName: req.body.adminName || 'Admin',
            action: 'Updated Package',
            targetType: 'Package',
            targetId: id,
            details: `Package '${title}' (ID: ${id}) updated.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a package
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM packages WHERE id = ?", [id]);
        res.json({ success: true });

        // Log Package Deleted
        logActivity({
            actorType: 'Admin',
            actorId: req.body.adminId || null,
            actorName: req.body.adminName || 'Admin',
            action: 'Deleted Package',
            targetType: 'Package',
            targetId: id,
            details: `Package (ID: ${id}) deleted.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
