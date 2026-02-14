import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 *
 * This implements a Double Submit Cookie pattern for CSRF protection.
 * Works alongside the existing SameSite=strict cookie configuration.
 *
 * How it works:
 * 1. Server generates a CSRF token and sends it in a cookie
 * 2. Client must include this token in a custom header for state-changing requests
 * 3. Server validates that the header matches the cookie
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to set CSRF token cookie on GET requests
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Only set token if it doesn't exist or is invalid
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Client needs to read this for the header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
}

/**
 * Middleware to verify CSRF token on state-changing requests
 */
export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME];

  // Check if both tokens exist
  if (!tokenFromCookie || !tokenFromHeader) {
    return res.status(403).json({
      error: 'CSRF token missing. Please refresh the page and try again.',
    });
  }

  // Compare tokens using timing-safe comparison
  if (!crypto.timingSafeEqual(
    Buffer.from(tokenFromCookie),
    Buffer.from(tokenFromHeader as string)
  )) {
    return res.status(403).json({
      error: 'Invalid CSRF token. Please refresh the page and try again.',
    });
  }

  next();
}

/**
 * Combined middleware that sets token on GET and verifies on other methods
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    setCsrfToken(req, res, next);
  } else {
    verifyCsrfToken(req, res, next);
  }
}

export default csrfProtection;
