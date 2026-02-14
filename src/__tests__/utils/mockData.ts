import { GreenSpace } from '../../types/greenSpaces';

export const mockGreenSpace: GreenSpace = {
  id: '1',
  type: 'park',
  species_ru: 'Test Park',
  species_kz: null,
  species_en: null,
  species_scientific: null,
  location: 'POINT(76.8512 43.2220)',
  latitude: 43.2220,
  longitude: 76.8512,
  city_id: 'city-1',
  district_id: null,
  planting_date: '2024-01-01T00:00:00Z',
  status: 'alive',
  notes: 'A test park',
  responsible_org: null,
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockGreenSpaces: GreenSpace[] = [
  mockGreenSpace,
  {
    ...mockGreenSpace,
    id: '2',
    species_ru: 'Test Garden',
    type: 'garden',
  },
  {
    ...mockGreenSpace,
    id: '3',
    species_ru: 'Test Tree',
    type: 'tree',
  },
];

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
};

export const mockAdminUser = {
  id: '2',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
};

