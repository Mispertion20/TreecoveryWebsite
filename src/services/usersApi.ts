import api from './api';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  city_id: string | null;
  created_at: string;
  updated_at: string;
  city?: {
    id: string;
    name_en: string;
    name_ru: string;
    name_kz: string;
  };
  activityCounts?: {
    adoptions: number;
    reports: number;
    comments: number;
  };
}

export interface UserDetails {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  city_id: string | null;
  created_at: string;
  updated_at: string;
  city?: {
    id: string;
    name_en: string;
    name_ru: string;
    name_kz: string;
  };
  activity: {
    adoptions: Array<{
      id: string;
      green_space_id: string;
      adoption_date: string;
      notes: string | null;
      is_active: boolean;
      created_at: string;
    }>;
    reports: Array<{
      id: string;
      report_type: string;
      status: string;
      created_at: string;
    }>;
    comments: Array<{
      id: string;
      green_space_id: string;
      content: string;
      created_at: string;
    }>;
    auditLogs: Array<{
      id: string;
      action: string;
      details: string | null;
      created_at: string;
      admin: {
        id: string;
        email: string;
      };
    }>;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersFilters {
  role?: 'user' | 'admin' | 'super_admin';
  city_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const usersApi = {
  /**
   * Get all users with filtering
   */
  async getUsers(filters: UsersFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.city_id) params.append('city_id', filters.city_id);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Get user details with activity
   */
  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<{ message: string; user: User }> {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, active: boolean): Promise<{ message: string; user: User & { active: boolean } }> {
    const response = await api.put(`/admin/users/${userId}/status`, { active });
    return response.data;
  },

  /**
   * Get audit log for a user
   */
  async getUserAuditLog(userId: string, page: number = 1, limit: number = 50): Promise<{
    logs: Array<{
      id: string;
      action: string;
      old_value: any;
      new_value: any;
      details: string | null;
      created_at: string;
      admin: {
        id: string;
        email: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(`/admin/users/${userId}/audit-log?page=${page}&limit=${limit}`);
    return response.data;
  },
};

