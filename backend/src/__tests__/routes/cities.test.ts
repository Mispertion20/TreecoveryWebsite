// Jest globals are available without import
import request from 'supertest';
import express from 'express';
import citiesRoutes from '../../routes/cities';
import { supabaseAdmin } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: '1', email: 'test@example.com', role: 'user' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/cities', citiesRoutes);

describe('Cities Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cities', () => {
    it('fetches all cities', async () => {
      const mockCities = [
        { id: '1', name: 'Almaty', name_ru: 'Алматы' },
        { id: '2', name: 'Astana', name_ru: 'Астана' },
      ];

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCities,
          error: null,
        }),
      });

      const response = await request(app).get('/api/cities');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/cities/:id', () => {
    it('fetches a single city', async () => {
      const mockCity = {
        id: '1',
        name: 'Almaty',
        name_ru: 'Алматы',
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCity,
          error: null,
        }),
      });

      const response = await request(app).get('/api/cities/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockCity);
    });

    it('returns 404 for non-existent city', async () => {
      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      });

      const response = await request(app).get('/api/cities/999');

      expect(response.status).toBe(404);
    });
  });
});

