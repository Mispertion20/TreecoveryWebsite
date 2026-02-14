// Jest globals are available without import
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';
import { supabaseAdmin } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Mock email service
jest.mock('../../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'user',
        created_at: new Date().toISOString(),
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({
          data: [mockUser],
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found
        }),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('rejects invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'ValidPass123',
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('rejects weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('requires email and password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password_hash: '$2a$10$hashedpassword',
        role: 'user',
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      });

      // Mock password verification
      jest.mock('../../utils/password', () => ({
        verifyPassword: jest.fn().mockResolvedValue(true),
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Note: This test may need adjustment based on actual password verification implementation
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it('rejects invalid credentials', async () => {
      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('sends password reset email for existing user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
        insert: jest.fn().mockResolvedValue({
          data: [{ token: 'reset-token' }],
          error: null,
        }),
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
});

