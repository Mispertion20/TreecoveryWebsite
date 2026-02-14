import api from './api';

export interface GalleryPhoto {
  id: string;
  url: string;
  uploaded_at: string;
  green_space: {
    id: string;
    species_ru: string;
    species_en: string | null;
    type: string;
    status: string;
    planting_date: string;
    latitude: number;
    longitude: number;
    city?: { name_en: string; name_ru: string };
    district?: { name_en: string; name_ru: string };
  };
}

export interface GalleryResponse {
  data: GalleryPhoto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BeforeAfterPair {
  before: GalleryPhoto;
  after: GalleryPhoto | null;
}

export const galleryApi = {
  /**
   * Get gallery photos
   */
  async getPhotos(params?: {
    city_id?: string;
    district_id?: string;
    year?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<GalleryResponse> {
    const response = await api.get('/gallery', { params });
    return response.data;
  },

  /**
   * Get before/after photo pairs
   */
  async getBeforeAfter(greenSpaceId: string): Promise<{ pairs: BeforeAfterPair[] }> {
    const response = await api.get('/gallery/before-after', {
      params: { green_space_id: greenSpaceId },
    });
    return response.data;
  },
};

