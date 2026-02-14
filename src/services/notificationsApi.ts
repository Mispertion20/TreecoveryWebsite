import api from './api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'adoption_update' | 'report_response' | 'comment_reply' | 'admin_action' | 'system_announcement' | 'other';
  message: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email: boolean;
  push: boolean;
  in_app: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  /**
   * Get notifications for current user
   */
  async getNotifications(options: { read?: boolean; page?: number; limit?: number } = {}): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (options.read !== undefined) params.append('read', options.read.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences | { email: boolean; push: boolean; in_app: boolean }> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<Pick<NotificationPreferences, 'email' | 'push' | 'in_app'>>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};

