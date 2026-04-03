const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all activity logs (Super Admin only — enforced on frontend)
router.get('/', async (req, res) => {
    try {
        const { actorType, action, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let conditions = [];
        let values = [];
        let idx = 1;

        if (actorType) {
            conditions.push(`actorType = ?`);
            values.push(actorType);
        }
        if (action) {
            // LIKE is generally case-insensitive in MySQL
            conditions.push(`action LIKE ?`);
            values.push(`%${action}%`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Add limit and offset placeholders
        const logsSql = `SELECT * FROM activity_logs ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        const logsValues = [...values, parseInt(limit), parseInt(offset)];

        const [rows] = await pool.query(logsSql, logsValues);

        const countSql = `SELECT COUNT(*) as total FROM activity_logs ${where}`;
        const [countRes] = await pool.query(countSql, values);
        const total = parseInt(countRes[0].total);

        res.json({ success: true, logs: rows, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete all logs (Super Admin only)
router.delete('/clear', async (req, res) => {
    try {
        await pool.query('DELETE FROM activity_logs');
        res.json({ success: true, message: 'All logs cleared.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
