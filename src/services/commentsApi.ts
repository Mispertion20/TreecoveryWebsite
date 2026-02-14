import api from './api';

export interface Comment {
  id: string;
  green_space_id: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: { id: string; email: string };
}

export interface CommentsResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCommentData {
  green_space_id: string;
  content: string;
  author_name?: string;
  author_email?: string;
}

export const commentsApi = {
  /**
   * Create a comment
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    const response = await api.post('/comments', data);
    return response.data;
  },

  /**
   * Get comments for a green space
   */
  async getComments(
    greenSpaceId: string,
    params?: { page?: number; limit?: number }
  ): Promise<CommentsResponse> {
    const response = await api.get(`/comments/green-space/${greenSpaceId}`, { params });
    return response.data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};

