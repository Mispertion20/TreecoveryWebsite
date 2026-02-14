import { describe, it, expect, vi, beforeEach } from 'vitest';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import api from '../../services/api';

// Mock the API client
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('GreenSpaces API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGreenSpaces', () => {
    it('fetches green spaces without filters', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.getGreenSpaces();

      expect(result).toEqual(mockResponse.data);
      expect(api.get).toHaveBeenCalledWith('/green-spaces?');
    });

    it('fetches green spaces with filters', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', name: 'Park' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.getGreenSpaces({
        city_id: '1',
        type: 'park',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse.data);
      expect(api.get).toHaveBeenCalledWith('/green-spaces?city_id=1&type=park&page=1&limit=10');
    });

    it('excludes undefined/null/empty values from query params', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      await greenSpacesApi.getGreenSpaces({
        city_id: '1',
        type: undefined,
        search: '',
        page: 1,
      });

      expect(api.get).toHaveBeenCalledWith('/green-spaces?city_id=1&page=1');
    });
  });

  describe('getGreenSpace', () => {
    it('fetches a single green space by ID', async () => {
      const mockResponse = {
        data: { id: '1', name: 'Test Park' },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.getGreenSpace('1');

      expect(result).toEqual(mockResponse.data);
      expect(api.get).toHaveBeenCalledWith('/green-spaces/1');
    });
  });

  describe('createGreenSpace', () => {
    it('creates a new green space', async () => {
      const mockData = {
        type: 'park' as const,
        species_ru: 'New Park',
        latitude: 43.2220,
        longitude: 76.8512,
        city_id: 'city-1',
        planting_date: new Date(),
        status: 'alive' as const,
      };

      const mockResponse = {
        data: { id: '1', ...mockData },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.createGreenSpace(mockData);

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/green-spaces', mockData);
    });
  });

  describe('updateGreenSpace', () => {
    it('updates a green space', async () => {
      const mockData = { species_ru: 'Updated Park' };
      const mockResponse = {
        data: { id: '1', ...mockData },
      };

      (api.put as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.updateGreenSpace('1', mockData);

      expect(result).toEqual(mockResponse.data);
      expect(api.put).toHaveBeenCalledWith('/green-spaces/1', mockData);
    });
  });

  describe('deleteGreenSpace', () => {
    it('deletes a green space', async () => {
      const mockResponse = {
        data: { message: 'Deleted successfully' },
      };

      (api.delete as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.deleteGreenSpace('1');

      expect(result).toEqual(mockResponse.data);
      expect(api.delete).toHaveBeenCalledWith('/green-spaces/1');
    });
  });

  describe('updateStatus', () => {
    it('updates green space status', async () => {
      const mockResponse = {
        data: { id: '1', status: 'active' },
      };

      (api.patch as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.updateStatus('1', 'alive');

      expect(result).toEqual(mockResponse.data);
      expect(api.patch).toHaveBeenCalledWith('/green-spaces/1/status', {
        status: 'alive',
      });
    });
  });

  describe('bulkUpload', () => {
    it('uploads CSV content', async () => {
      const csvContent = 'name,type\nPark,park';
      const mockResponse = {
        data: { message: 'Upload successful', count: 1 },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.bulkUpload(csvContent);

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/green-spaces/bulk', {
        csv_content: csvContent,
      });
    });
  });

  describe('uploadPhoto', () => {
    it('uploads a photo for a green space', async () => {
      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: { id: '1', photo_url: 'https://example.com/photo.jpg' },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await greenSpacesApi.uploadPhoto('1', file);

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith(
        '/green-spaces/1/photos',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });
});

