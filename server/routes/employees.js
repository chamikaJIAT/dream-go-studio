const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY createdAt DESC');
        res.json({ success: true, employees: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add an employee
router.post('/', async (req, res) => {
    try {
        const { fullName, position, email, phone, joinDate, status, role, password } = req.body;
        const [result] = await pool.query(
            "INSERT INTO employees (fullName, position, email, phone, joinDate, status, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [fullName, position, email, phone, joinDate, status || 'Active', role || 'Staff', password || phone]
        );
        res.json({ success: true, employee: { id: result.insertId, fullName, position, email, phone, joinDate, status, role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update an employee
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, position, email, phone, joinDate, status, role } = req.body;
        await pool.query(
            "UPDATE employees SET fullName = ?, position = ?, email = ?, phone = ?, joinDate = ?, status = ?, role = ? WHERE id = ?",
            [fullName, position, email, phone, joinDate, status, role, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM employees WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
