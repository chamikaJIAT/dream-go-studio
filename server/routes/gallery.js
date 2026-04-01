const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { logActivity } = require('../logger');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configured for gallery
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});


// ================= GALLERIES ================= //

// Get categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM gallery_categories ORDER BY createdAt DESC');
        res.json({ success: true, categories: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add category
router.post('/categories', async (req, res) => {
    try {
        const { name, description, performingAdminId, performingAdminName } = req.body;
        const [result] = await pool.query(
            "INSERT INTO gallery_categories (name, description) VALUES (?, ?)",
            [name, description]
        );
        const newId = result.insertId;
        res.json({ success: true, category: { id: newId, name, description } });

        // Log Category Added
        logActivity({
            actorType: 'Admin',
            actorId: performingAdminId || null,
            actorName: performingAdminName || 'Admin',
            action: 'Created Gallery Category',
            targetType: 'Gallery Category',
            targetId: newId,
            details: `Category '${name}' created.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ================= EVENTS ================= //

// Get events by category
router.get('/events/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [rows] = await pool.query('SELECT * FROM gallery_events WHERE categoryId = ? ORDER BY createdAt DESC', [categoryId]);
        res.json({ success: true, events: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add event
router.post('/events', upload.single('coverImage'), async (req, res) => {
    try {
        const { categoryId, title, performingAdminId, performingAdminName } = req.body;
        
        let coverImageUrl = '';
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            coverImageUrl = `${baseUrl}/uploads/gallery/${req.file.filename}`;
        }

        const [result] = await pool.query(
            "INSERT INTO gallery_events (categoryId, title, coverImage) VALUES (?, ?, ?)",
            [categoryId, title, coverImageUrl]
        );
        const newId = result.insertId;
        res.json({ success: true, event: { id: newId, categoryId, title, coverImage: coverImageUrl } });

        // Log Event Added
        logActivity({
            actorType: 'Admin',
            actorId: performingAdminId || null,
            actorName: performingAdminName || 'Admin',
            action: 'Created Gallery Event',
            targetType: 'Gallery Event',
            targetId: newId,
            details: `Event '${title}' created in category #${categoryId}.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ================= IMAGES ================= //

// Get images by event
router.get('/images/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const [rows] = await pool.query('SELECT * FROM gallery_images WHERE eventId = ? ORDER BY uploadedAt DESC', [eventId]);
        res.json({ success: true, images: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add image to event (with Multer upload)
router.post('/images', upload.array('images', 20), async (req, res) => {
    try {
        const { eventId, performingAdminId, performingAdminName } = req.body;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        let uploadedImages = [];

        for (const file of req.files) {
            const url = `${baseUrl}/uploads/gallery/${file.filename}`;
            const [result] = await pool.query(
                "INSERT INTO gallery_images (eventId, url) VALUES (?, ?)",
                [eventId, url]
            );
            uploadedImages.push({ id: result.insertId, eventId, url });
        }
        res.json({ success: true, images: uploadedImages });

        // Log Bulk Image Upload
        logActivity({
            actorType: 'Admin',
            actorId: performingAdminId || null,
            actorName: performingAdminName || 'Admin',
            action: 'Uploaded Gallery Images',
            targetType: 'Gallery Event',
            targetId: eventId,
            details: `Uploaded ${uploadedImages.length} images to event #${eventId}.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM gallery_categories WHERE id = ?", [id]);
        res.json({ success: true });

        // Log Category Deleted
        logActivity({
            actorType: 'Admin',
            actorId: req.query.performingAdminId || null,
            actorName: req.query.performingAdminName || 'Admin',
            action: 'Deleted Gallery Category',
            targetType: 'Gallery Category',
            targetId: id,
            details: `Category (ID: ${id}) deleted.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM gallery_events WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete photo
router.delete('/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM gallery_images WHERE id = ?", [id]);
        res.json({ success: true });

        // Log Image Deleted
        logActivity({
            actorType: 'Admin',
            actorId: req.query.performingAdminId || null,
            actorName: req.query.performingAdminName || 'Admin',
            action: 'Deleted Gallery Image',
            targetType: 'Gallery Image',
            targetId: id,
            details: `Image (ID: ${id}) deleted.`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
