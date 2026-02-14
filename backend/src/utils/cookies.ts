import { Response } from 'express';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Set authentication cookies as HttpOnly
 * This prevents XSS attacks from stealing tokens
 */
export function setAuthCookies(res: Response, tokens: TokenPair): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie (15 minutes)
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true, // Prevents JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/',
  });

  // Refresh token cookie (7 days)
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  });
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * Extract token from cookie or Authorization header (for backwards compatibility)
 */
export function extractToken(req: any): string | null {
  // Try cookie first (preferred)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // Fall back to Authorization header for backwards compatibility
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Extract refresh token from cookie or request body (for backwards compatibility)
 */
export function extractRefreshToken(req: any): string | null {
  // Try cookie first (preferred)
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  // Fall back to request body for backwards compatibility
  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  return null;
}
