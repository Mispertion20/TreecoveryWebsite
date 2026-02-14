import api from './api';

export type ReportType = 'dead_tree' | 'damaged_tree' | 'missing_tree' | 'other';
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';

export interface CitizenReport {
  id: string;
  reporter_id: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  report_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  city_id: string | null;
  district_id: string | null;
  green_space_id: string | null;
  status: ReportStatus;
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  photos?: ReportPhoto[];
  city?: { name_en: string; name_ru: string };
  district?: { name_en: string; name_ru: string };
  green_space?: { id: string; species_ru: string };
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  url: string;
  uploaded_at: string;
}

export interface CreateReportData {
  report_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  city_id?: string | null;
  district_id?: string | null;
  green_space_id?: string | null;
  reporter_email?: string;
  reporter_name?: string;
  photos?: File[];
}

export interface ReportsResponse {
  data: CitizenReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const citizenReportsApi = {
  /**
   * Create a new citizen report
   */
  async createReport(data: CreateReportData): Promise<CitizenReport> {
    const formData = new FormData();
    formData.append('report_type', data.report_type);
    formData.append('description', data.description);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    
    if (data.city_id) formData.append('city_id', data.city_id);
    if (data.district_id) formData.append('district_id', data.district_id);
    if (data.green_space_id) formData.append('green_space_id', data.green_space_id);
    if (data.reporter_email) formData.append('reporter_email', data.reporter_email);
    if (data.reporter_name) formData.append('reporter_name', data.reporter_name);
    
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await api.post('/citizen-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get citizen reports
   */
  async getReports(params?: {
    status?: ReportStatus;
    page?: number;
    limit?: number;
  }): Promise<ReportsResponse> {
    const response = await api.get('/citizen-reports', { params });
    return response.data;
  },

  /**
   * Get single report
   */
  async getReport(id: string): Promise<CitizenReport> {
    const response = await api.get(`/citizen-reports/${id}`);
    return response.data;
  },

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    id: string,
    data: { status: ReportStatus; admin_response?: string }
  ): Promise<CitizenReport> {
    const response = await api.patch(`/citizen-reports/${id}`, data);
    return response.data;
  },
};

