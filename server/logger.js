const { pool } = require('./db');

/**
 * Logs an activity to the database.
 * @param {object} params
 * @param {'Admin'|'Customer'|'System'} params.actorType
 * @param {number|null} params.actorId
 * @param {string} params.actorName
 * @param {string} params.action - e.g. 'Created Booking'
 * @param {string|null} params.targetType - e.g. 'Booking', 'User'
 * @param {number|null} params.targetId
 * @param {string|null} params.details - Human-readable summary
 * @param {string|null} params.ipAddress
 */
async function logActivity({ actorType = 'System', actorId = null, actorName = 'System', action, targetType = null, targetId = null, details = null, ipAddress = null }) {
    try {
        await pool.query(
            `INSERT INTO activity_logs (actorType, actorId, actorName, action, targetType, targetId, details, ipAddress) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [actorType, actorId, actorName, action, targetType, targetId, details, ipAddress]
        );
    } catch (err) {
        // Logging should never crash the app — just print the error
        console.error('[Logger Error]', err.message);
    }
}

module.exports = { logActivity };
