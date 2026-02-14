import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { supabaseAdmin } from '../config/supabase';
import { UserRole } from '../types/database';
import { extractToken } from '../utils/cookies';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from cookie or Authorization header
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const payload = verifyAccessToken(token);
    
    // Verify user still exists in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, city_id')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token - user not found' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      cityId: user.city_id,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to optionally authenticate requests (doesn't fail if no token)
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from cookie or Authorization header
    const token = extractToken(req);

    if (!token) {
      // No token, continue without user
      next();
      return;
    }

    const payload = verifyAccessToken(token);
    
    // Verify user still exists in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, city_id')
      .eq('id', payload.userId)
      .single();

    if (!error && user) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        cityId: user.city_id,
      };
    }

    next();
  } catch (error) {
    // Invalid token, but continue without user
    next();
  }
}

/**
 * Middleware to require admin or super_admin role
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Middleware to require super_admin role
 */
export function requireSuperAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Super admin access required' });
    return;
  }

  next();
}

/**
 * Middleware to check if user can access city-specific data
 * City admins can only access their city's data
 */
export function checkCityAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Super admins can access all cities
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // City admins can only access their city
  const requestedCityId = req.body.city_id || req.params.cityId || req.query.city_id;
  
  if (req.user.role === 'admin' && req.user.cityId && requestedCityId) {
    if (req.user.cityId !== requestedCityId) {
      res.status(403).json({ error: 'Access denied to this city\'s data' });
      return;
    }
  }

  next();
}
