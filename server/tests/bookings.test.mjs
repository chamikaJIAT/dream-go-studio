import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bookingRoutes from '../routes/bookings.js';

// Mock dependencies
vi.mock('../db.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../logger.js', () => ({
  logActivity: vi.fn(),
}));

import { pool } from '../db.js';

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Bookings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    it('should return 200 and all bookings', async () => {
      const mockBookings = [
        { id: 1, customerName: 'Test Customer', packageTitle: 'Package A', packageIds: null },
        { id: 2, customerName: 'Another Customer', packageTitle: 'Package B', packageIds: [1, 2] }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockBookings });

      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.bookings.length).toBe(2);
    });
  });

  describe('POST /api/bookings', () => {
    it('should return 200 and bookingId on success', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 101 }] });

      const response = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Test Name',
          mobile: '0771234567',
          packageTitle: 'Standard Package',
          totalAmount: 5000,
          location: { lat: 6.9, lng: 79.8 }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.bookingId).toBe(101);
    });
  });
});
