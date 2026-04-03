import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';

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
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and user data for valid credentials', async () => {
      const mockUser = { id: 1, name: 'Test User', username: 'testuser', status: 'Active' };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual(mockUser);
    });

    it('should return 401 for invalid credentials', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 403 for inactive account', async () => {
      const mockUser = { id: 1, name: 'Test User', username: 'testuser', status: 'Inactive' };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 200 and new user data on successful registration', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // For existing check
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }); // For insert

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          username: 'newuser',
          email: 'new@example.com',
          mobile: '1234567890',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe(2);
    });
  });
});
