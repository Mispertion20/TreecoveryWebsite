import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authService from '../../services/auth';
import api from '../../services/api';

// Mock the API client
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('register', () => {
    it('registers a user and stores tokens', async () => {
      const mockResponse = {
        data: {
          message: 'User registered',
          user: { id: '1', email: 'test@example.com', role: 'user' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  describe('login', () => {
    it('logs in a user and stores tokens', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { id: '1', email: 'test@example.com', role: 'user' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });
  });

  describe('logout', () => {
    it('clears tokens from localStorage', async () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('user', '{}');

      (api.post as any).mockResolvedValue({});

      await authService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('clears tokens even if API call fails', async () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');

      (api.post as any).mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('refreshes access token', async () => {
      localStorage.setItem('refreshToken', 'refresh-token');

      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });

    it('throws error when no refresh token available', async () => {
      await expect(authService.refreshToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  describe('forgotPassword', () => {
    it('sends password reset request', async () => {
      const mockResponse = {
        data: { message: 'Password reset email sent' },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword({
        email: 'test@example.com',
      });

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
    });
  });

  describe('resetPassword', () => {
    it('resets password with token', async () => {
      const mockResponse = {
        data: { message: 'Password reset successful' },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.resetPassword({
        token: 'reset-token',
        password: 'newpassword123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        password: 'newpassword123',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user and updates localStorage', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
      const mockResponse = {
        data: { user: mockUser },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when access token exists', () => {
      localStorage.setItem('accessToken', 'token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when access token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('returns user from localStorage', () => {
      const user = { id: '1', email: 'test@example.com', role: 'user' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(authService.getStoredUser()).toEqual(user);
    });

    it('returns null when no user in localStorage', () => {
      expect(authService.getStoredUser()).toBeNull();
    });

    it('returns null when invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid-json');
      expect(authService.getStoredUser()).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('clears all auth data from localStorage', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('user', '{}');

      authService.clearAuth();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

