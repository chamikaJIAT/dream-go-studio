const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
    try {
        // 1. Total Bookings (from both bookings and old_bookings)
        const [bookingsCount] = await pool.query("SELECT COUNT(*) as count FROM bookings");
        const [oldBookingsCount] = await pool.query("SELECT COUNT(*) as count FROM old_bookings");
        const totalBookings = bookingsCount[0].count + oldBookingsCount[0].count;

        // 2. Pending Approvals
        const [pendingCount] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'");

        // 3. Gallery Photos
        const [photosCount] = await pool.query("SELECT COUNT(*) as count FROM gallery_images");

        // 4. Total Revenue (from old_bookings totalAmount)
        const [revenueRes] = await pool.query("SELECT SUM(totalAmount) as total FROM old_bookings");
        const totalRevenue = revenueRes[0].total || 0;

        res.json({
            success: true,
            stats: [
                { label: 'Total Bookings', value: totalBookings.toLocaleString(), icon: '📅', color: 'blue' },
                { label: 'Pending Approvals', value: pendingCount[0].count.toLocaleString(), icon: '⏳', color: 'orange' },
                { label: 'Gallery Photos', value: photosCount[0].count.toLocaleString(), icon: '🖼️', color: 'purple' },
                { label: 'Revenue (LKR)', value: `${(totalRevenue / 1000000).toFixed(1)}M`, icon: '💰', color: 'green' }
            ]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
