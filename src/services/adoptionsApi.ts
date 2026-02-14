import api from './api';

export interface TreeAdoption {
  id: string;
  user_id: string;
  green_space_id: string;
  adoption_date: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  green_space?: {
    id: string;
    species_ru: string;
    species_en: string | null;
    species_kz: string | null;
    type: string;
    status: string;
    planting_date: string;
    latitude: number;
    longitude: number;
    city?: { name_en: string; name_ru: string };
    district?: { name_en: string; name_ru: string };
    photos?: Array<{ url: string }>;
  };
}

export interface AdoptionsResponse {
  data: TreeAdoption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdoptionData {
  green_space_id: string;
  notes?: string;
}

export const adoptionsApi = {
  /**
   * Adopt a tree
   */
  async adoptTree(data: CreateAdoptionData): Promise<TreeAdoption> {
    const response = await api.post('/adoptions', data);
    return response.data;
  },

  /**
   * Get user's adoptions
   */
  async getAdoptions(params?: {
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AdoptionsResponse> {
    const response = await api.get('/adoptions', { params });
    return response.data;
  },

  /**
   * Get single adoption
   */
  async getAdoption(id: string): Promise<TreeAdoption> {
    const response = await api.get(`/adoptions/${id}`);
    return response.data;
  },

  /**
   * Cancel adoption
   */
  async cancelAdoption(id: string): Promise<void> {
    await api.delete(`/adoptions/${id}`);
  },

  /**
   * Check if user has adopted a green space
   */
  async checkAdoption(greenSpaceId: string): Promise<{ adopted: boolean; adoption: TreeAdoption | null }> {
    const response = await api.get(`/adoptions/green-space/${greenSpaceId}`);
    return response.data;
  },
};

