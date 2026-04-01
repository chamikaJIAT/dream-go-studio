const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all messages
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY createdAt DESC');
        res.json({ success: true, messages: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a new message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const [result] = await pool.query(
            "INSERT INTO messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)",
            [name, email, subject, message, 'Unread']
        );
        res.json({ success: true, messageId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update message status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query(
            "UPDATE messages SET status = ? WHERE id = ?",
            [status, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM messages WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
