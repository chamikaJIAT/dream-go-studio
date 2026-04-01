const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all old bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM old_bookings ORDER BY createdAt DESC');
        const parsedRows = rows.map(r => ({
            ...r,
            paymentHistory: typeof r.paymentHistory === 'string' ? JSON.parse(r.paymentHistory) : (r.paymentHistory || [])
        }));
        res.json({ success: true, old_bookings: parsedRows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const [result] = await pool.query(
            "INSERT INTO old_bookings (customerName, mobile, date, bookingDetails, totalAmount, paidAmount, status, paymentHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [data.customerName, data.mobile, data.date, data.bookingDetails, data.totalAmount, data.paidAmount, data.status, JSON.stringify(data.paymentHistory || [])]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        let updates = [];
        let values = [];

        ['customerName', 'mobile', 'date', 'bookingDetails', 'totalAmount', 'paidAmount', 'status'].forEach(field => {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        });

        if (data.paymentHistory !== undefined) {
            updates.push(`paymentHistory = ?`);
            values.push(JSON.stringify(data.paymentHistory));
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE old_bookings SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM old_bookings WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
