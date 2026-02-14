import api from './api';
import { GreenSpaceFilters } from './greenSpacesApi';
import { showError } from '../utils/toastHelpers';

export interface ExportOptions {
  filters?: GreenSpaceFilters;
  format?: 'csv' | 'excel';
}

/**
 * Export green spaces data to CSV or Excel
 */
export const exportApi = {
  /**
   * Export green spaces as CSV
   */
  async exportToCSV(filters: GreenSpaceFilters = {}): Promise<Blob> {
    const response = await api.post(
      '/reports/export',
      {
        ...filters,
        format: 'csv',
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Export green spaces as Excel (not yet implemented)
   */
  async exportToExcel(filters: GreenSpaceFilters = {}): Promise<Blob> {
    const response = await api.post(
      '/reports/export',
      {
        ...filters,
        format: 'excel',
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Download file from blob
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export with automatic filename generation
   */
  async exportAndDownload(filters: GreenSpaceFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    try {
      const blob = format === 'csv' 
        ? await this.exportToCSV(filters)
        : await this.exportToExcel(filters);

      // Generate filename
      const parts: string[] = ['green-spaces'];
      const date = new Date().toISOString().split('T')[0];

      if (filters.city_id) parts.push('city');
      if (filters.district_id) parts.push('district');
      if (filters.status) parts.push(filters.status);
      if (filters.type) parts.push(filters.type);
      if (filters.year) parts.push(`year-${filters.year}`);

      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const filename = `${parts.join('-')}-${date}.${extension}`;

      this.downloadFile(blob, filename);
    } catch (error) {
      // Error will be handled by the caller with toast notification
      throw error;
    }
  },
};

