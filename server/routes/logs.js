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

        if (actorType) {
            conditions.push('actorType = ?');
            values.push(actorType);
        }
        if (action) {
            conditions.push('action LIKE ?');
            values.push(`%${action}%`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT * FROM activity_logs ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [...values, parseInt(limit), parseInt(offset)]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM activity_logs ${where}`,
            values
        );

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
