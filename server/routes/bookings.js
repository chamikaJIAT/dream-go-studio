const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { logActivity } = require('../logger');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Safe filename handling
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});


// Get all bookings (For Admin)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM bookings ORDER BY createdAt DESC');
        // Parse JSON packageIds for React to process just like Firebase did
        const parsedRows = rows.map(r => ({
            ...r,
            packageIds: typeof r.packageIds === 'string' ? JSON.parse(r.packageIds) : r.packageIds
        }));
        res.json({ success: true, bookings: parsedRows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get User Bookings
router.get('/user/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const [rows] = await pool.query('SELECT * FROM bookings WHERE customerId = ? ORDER BY createdAt DESC', [customerId]);
        const parsedRows = rows.map(r => ({
            ...r,
            packageIds: typeof r.packageIds === 'string' ? JSON.parse(r.packageIds) : r.packageIds
        }));
        res.json({ success: true, bookings: parsedRows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a booking
router.post('/', async (req, res) => {
    try {
        const booking = req.body;
        const [result] = await pool.query(
            `INSERT INTO bookings 
            (customerId, customerName, mobile, packageIds, packageTitle, category, hotelName, bookingDate, coupleName, birthdayPersonName, latitude, longitude, totalAmount, status, paymentStatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                booking.customerId || null, booking.customerName, booking.mobile, 
                JSON.stringify(booking.packageIds || []), booking.packageTitle || '', booking.category || '', 
                booking.hotelName || '', booking.bookingDate || '', booking.coupleName || '', booking.birthdayPersonName || '', 
                booking.location?.lat || null, booking.location?.lng || null, 
                booking.totalAmount || 0,
                booking.status || 'Pending', 'Unpaid'
            ]
        );
        const newId = result.insertId;
        res.json({ success: true, bookingId: newId });

        // Log Create Booking
        logActivity({
            actorType: 'Customer',
            actorId: booking.customerId || null,
            actorName: booking.customerName || 'Customer',
            action: 'Created Booking',
            targetType: 'Booking',
            targetId: newId,
            details: `New booking created for ${booking.customerName} (Package: ${booking.packageTitle})`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update Booking
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus, bookingDate, packageIds, packageTitle } = req.body;
        
        let updates = [];
        let values = [];

        if (status) { updates.push('status = ?'); values.push(status); }
        if (paymentStatus) { 
            updates.push('paymentStatus = ?'); 
            values.push(paymentStatus); 

            // If admin marks payment as Success, transfer pending to paid
            if (paymentStatus === 'Success') {
                updates.push('paidAmount = paidAmount + pendingPaidAmount');
                updates.push('pendingPaidAmount = 0');
            }
        }
        if (bookingDate) { updates.push('bookingDate = ?'); values.push(bookingDate); }
        if (packageIds) { updates.push('packageIds = ?'); values.push(JSON.stringify(packageIds)); }
        if (packageTitle) { updates.push('packageTitle = ?'); values.push(packageTitle); }
        if (req.body.totalAmount !== undefined) { updates.push('totalAmount = ?'); values.push(req.body.totalAmount); }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        res.json({ success: true });

        // Log Update Booking
        const adminName = req.body.adminName || 'Admin';
        const actionDesc = paymentStatus === 'Success' ? 'Verified Payment' : status ? `Changed Status to ${status}` : 'Updated Booking Details';
        logActivity({
            actorType: 'Admin',
            actorId: req.body.adminId || null,
            actorName: adminName,
            action: actionDesc,
            targetType: 'Booking',
            targetId: id,
            details: `Booking #${id} updated by ${adminName}.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload Payment Receipt
router.post('/:id/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const { id } = req.params;
        const amountPaid = parseFloat(req.body.amountPaid) || 0;

        // Construct the accessible URL relative to the backend base domain
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const paymentReceiptUrl = `${baseUrl}/uploads/receipts/${req.file.filename}`;

        await pool.query(
            "UPDATE bookings SET paymentReceiptUrl = ?, paymentStatus = 'Pending Verification', pendingPaidAmount = ? WHERE id = ?",
            [paymentReceiptUrl, amountPaid, id]
        );
        res.json({ success: true, paymentReceiptUrl });

        // Log Receipt Upload
        // We don't have user info in req.body for this multipart request easily, but we can log the action
        logActivity({
            actorType: 'Customer',
            action: 'Uploaded Receipt',
            targetType: 'Booking',
            targetId: id,
            details: `Payment receipt uploaded. Pending verification for LKR ${amountPaid}.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
