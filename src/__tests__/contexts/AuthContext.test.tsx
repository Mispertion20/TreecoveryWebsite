import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth';
import { ReactNode } from 'react';

// Mock the auth service
vi.mock('../../services/auth');

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides auth context', () => {
    (authService.getStoredUser as any) = vi.fn().mockReturnValue(null);
    (authService.getCurrentUser as any) = vi.fn().mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('initializes with stored user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(mockUser);
    (authService.getCurrentUser as any) = vi.fn().mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('clears user when token is invalid', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(mockUser);
    (authService.getCurrentUser as any) = vi.fn().mockRejectedValue(new Error('Invalid token'));
    (authService.clearAuth as any) = vi.fn();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(authService.clearAuth).toHaveBeenCalled();
    });
  });

  it('registers a new user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(null);
    (authService.getCurrentUser as any) = vi.fn().mockRejectedValue(new Error('Not authenticated'));
    (authService.register as any) = vi.fn().mockResolvedValue({
      user: mockUser,
      accessToken: 'token',
      refreshToken: 'refresh',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.register({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('logs in a user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(null);
    (authService.getCurrentUser as any) = vi.fn().mockRejectedValue(new Error('Not authenticated'));
    (authService.login as any) = vi.fn().mockResolvedValue({
      user: mockUser,
      accessToken: 'token',
      refreshToken: 'refresh',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('logs out a user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(mockUser);
    (authService.getCurrentUser as any) = vi.fn().mockResolvedValue({ user: mockUser });
    (authService.logout as any) = vi.fn().mockResolvedValue(undefined);
    (authService.clearAuth as any) = vi.fn();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('refreshes user data', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      cityId: null,
      createdAt: '2024-01-01',
    };

    const updatedUser = { ...mockUser, email: 'updated@example.com' };

    (authService.getStoredUser as any) = vi.fn().mockReturnValue(mockUser);
    (authService.getCurrentUser as any) = vi.fn()
      .mockResolvedValueOnce({ user: mockUser })
      .mockResolvedValueOnce({ user: updatedUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await result.current.refreshUser();

    await waitFor(() => {
      expect(result.current.user).toEqual(updatedUser);
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});

