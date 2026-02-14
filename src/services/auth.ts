import apiClient from './api';

export interface User {
  id: string;
  email: string;
  role: 'guest' | 'user' | 'admin' | 'super_admin';
  cityId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  // Tokens are now stored in HttpOnly cookies, not in response body
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'guest' | 'user' | 'admin' | 'super_admin';
  cityId?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data, {
    withCredentials: true // Ensure cookies are sent/received
  });

  // Store only user data (tokens are in HttpOnly cookies)
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data, {
    withCredentials: true // Ensure cookies are sent/received
  });

  // Store only user data (tokens are in HttpOnly cookies)
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {}, {
      withCredentials: true // Ensure cookies are cleared by backend
    });
  } catch (error) {
    // Silently fail - user data will still be cleared
  } finally {
    // Clear user data (tokens are cleared by backend via cookie deletion)
    localStorage.removeItem('user');
  }
}

/**
 * Refresh access token
 * Tokens are now stored in HttpOnly cookies, so we don't need to pass them
 */
export async function refreshToken(): Promise<void> {
  await apiClient.post('/auth/refresh', {}, {
    withCredentials: true // Backend reads refresh token from cookie
  });
  // New tokens are automatically set in cookies by backend
}

/**
 * Request password reset
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
  return response.data;
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  
  // Update stored user data
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
}

/**
 * Check if user is authenticated
 * Since tokens are in HttpOnly cookies, we check if user data exists
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('user');
}

/**
 * Get stored user data
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  localStorage.removeItem('user');
  // Tokens are cleared by backend via cookie deletion on logout
}

