// Jest globals are available without import
import request from 'supertest';
import express from 'express';
import greenSpacesRoutes from '../../routes/green-spaces';
import { supabaseAdmin } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: '1', email: 'test@example.com', role: 'user' };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    req.user = { id: '1', email: 'admin@example.com', role: 'admin' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/green-spaces', greenSpacesRoutes);

describe('Green Spaces Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/green-spaces', () => {
    it('fetches green spaces with pagination', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            name: 'Test Park',
            type: 'park',
            city: { id: '1', name: 'Almaty' },
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockData.data,
          error: null,
          count: 1,
        }),
      });

      const response = await request(app)
        .get('/api/green-spaces')
        .query({ page: '1', limit: '50' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('filters green spaces by city', async () => {
      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      const response = await request(app)
        .get('/api/green-spaces')
        .query({ city_id: '1' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/green-spaces/:id', () => {
    it('fetches a single green space', async () => {
      const mockGreenSpace = {
        id: '1',
        name: 'Test Park',
        type: 'park',
      };

      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockGreenSpace,
          error: null,
        }),
      });

      const response = await request(app).get('/api/green-spaces/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockGreenSpace);
    });

    it('returns 404 for non-existent green space', async () => {
      (supabaseAdmin.from as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      });

      const response = await request(app).get('/api/green-spaces/999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/green-spaces', () => {
    it('creates a new green space', async () => {
      const mockGreenSpace = {
        id: '1',
        name: 'New Park',
        type: 'park',
        coordinates: { lat: 43.2220, lng: 76.8512 },
      };

      (supabaseAdmin.from as any).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockGreenSpace,
          error: null,
        }),
      });

      const response = await request(app)
        .post('/api/green-spaces')
        .send({
          name: 'New Park',
          type: 'park',
          coordinates: { lat: 43.2220, lng: 76.8512 },
          city_id: '1',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('PUT /api/green-spaces/:id', () => {
    it('updates a green space', async () => {
      const mockUpdated = {
        id: '1',
        name: 'Updated Park',
        type: 'park',
      };

      (supabaseAdmin.from as any).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdated,
          error: null,
        }),
      });

      const response = await request(app)
        .put('/api/green-spaces/1')
        .send({
          name: 'Updated Park',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Park');
    });
  });

  describe('DELETE /api/green-spaces/:id', () => {
    it('deletes a green space', async () => {
      (supabaseAdmin.from as any).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const response = await request(app).delete('/api/green-spaces/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
});

