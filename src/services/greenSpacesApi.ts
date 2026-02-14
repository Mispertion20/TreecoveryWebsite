import api from './api';
import { GreenSpaceInsert, GreenSpaceUpdate, GreenSpaceStatus } from '../types/greenSpaces';

export interface GreenSpaceFilters {
  city_id?: string;
  district_id?: string;
  status?: GreenSpaceStatus;
  type?: string;
  species_ru?: string;
  planting_date_from?: string;
  planting_date_to?: string;
  year?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GreenSpaceResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const greenSpacesApi = {
  /**
   * Get list of green spaces with filters
   */
  async getGreenSpaces(filters: GreenSpaceFilters = {}): Promise<GreenSpaceResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/green-spaces?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single green space by ID
   */
  async getGreenSpace(id: string) {
    const response = await api.get(`/green-spaces/${id}`);
    return response.data;
  },

  /**
   * Create a new green space
   */
  async createGreenSpace(data: Omit<GreenSpaceInsert, 'created_by'>) {
    const response = await api.post('/green-spaces', data);
    return response.data;
  },

  /**
   * Update a green space
   */
  async updateGreenSpace(id: string, data: GreenSpaceUpdate) {
    const response = await api.put(`/green-spaces/${id}`, data);
    return response.data;
  },

  /**
   * Delete a green space
   */
  async deleteGreenSpace(id: string) {
    const response = await api.delete(`/green-spaces/${id}`);
    return response.data;
  },

  /**
   * Update green space status
   */
  async updateStatus(id: string, status: GreenSpaceStatus) {
    const response = await api.patch(`/green-spaces/${id}/status`, { status });
    return response.data;
  },

  /**
   * Bulk upload from CSV
   */
  async bulkUpload(csvContent: string) {
    const response = await api.post('/green-spaces/bulk', { csv_content: csvContent });
    return response.data;
  },

  /**
   * Enhanced bulk upload with validation, duplicate detection, and quality scoring
   */
  async bulkUploadEnhanced(
    csvContent: string,
    options?: { skipDuplicates?: boolean; minQualityScore?: number }
  ) {
    const response = await api.post('/green-spaces/bulk-enhanced', {
      csv_content: csvContent,
      skip_duplicates: options?.skipDuplicates ?? false,
      min_quality_score: options?.minQualityScore,
    });
    return response.data;
  },

  /**
   * Validate CSV content with enhanced validation
   */
  async validateCSV(csvContent: string, checkDuplicates: boolean = true) {
    const response = await api.post('/green-spaces/validate-csv', {
      csv_content: csvContent,
      check_duplicates: checkDuplicates,
    });
    return response.data;
  },

  /**
   * Quick preview validation of CSV (for real-time feedback)
   */
  async previewCSV(csvContent: string) {
    const response = await api.post('/green-spaces/preview-csv', {
      csv_content: csvContent,
    });
    return response.data;
  },

  /**
   * Download CSV template
   */
  async downloadTemplate() {
    const response = await api.get('/green-spaces/template/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Upload photo for a green space
   */
  async uploadPhoto(id: string, file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post(`/green-spaces/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

