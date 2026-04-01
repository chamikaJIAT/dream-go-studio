const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDB } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const galleryRoutes = require('./routes/gallery');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admins');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/old_bookings', require('./routes/old_bookings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/logs', require('./routes/logs'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Dream Go Studio API running' });
});

// Start Server & Initialize Database
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await initializeDB();
});
