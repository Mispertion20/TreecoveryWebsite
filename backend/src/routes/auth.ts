import express from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { validateRequiredFields, validateEmail } from '../middleware/validation';
import { sendPasswordResetEmail } from '../services/emailService';
import { isValidEmail } from '../utils/validation';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import { setAuthCookies, clearAuthCookies, extractRefreshToken } from '../utils/cookies';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * @body {string} email - User email address
 * @body {string} password - User password (min 8 chars, uppercase, lowercase, number)
 * @body {string} [role='user'] - User role (user, admin, super_admin)
 * @returns {Object} User data and access/refresh tokens
 */
router.post(
  '/register',
  authLimiter,
  validateRequiredFields(['email', 'password']),
  validateEmail('email'),
  async (req, res) => {
    try {
      const { email, password, role = 'user' } = req.body;

      // Validate email format
      if (!isValidEmail(email)) {
        throw ErrorCreators.validationError('Invalid email format');
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw ErrorCreators.validationError(
          passwordValidation.message || 'Password does not meet requirements'
        );
      }

      // Validate role
      const validRoles = ['user', 'admin', 'super_admin'];
      if (role && !validRoles.includes(role)) {
        throw ErrorCreators.validationError(
          `Role must be one of: ${validRoles.join(', ')}`
        );
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw ErrorCreators.conflict('User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          role,
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        throw ErrorCreators.internalServerError('Failed to create user');
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        cityId: user.city_id,
      });

      // Set HttpOnly cookies
      setAuthCookies(res, tokens);

      // Return user data (tokens are in cookies)
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          cityId: user.city_id,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      handleError(error, res, 'Failed to register user');
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 * @body {string} email - User email address
 * @body {string} password - User password
 * @returns {Object} User data and access/refresh tokens
 */
router.post(
  '/login',
  authLimiter,
  validateRequiredFields(['email', 'password']),
  validateEmail('email'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw ErrorCreators.unauthorized('Invalid email or password');
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        throw ErrorCreators.unauthorized('Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        cityId: user.city_id,
      });

      // Set HttpOnly cookies
      setAuthCookies(res, tokens);

      // Return user data (tokens are in cookies)
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          cityId: user.city_id,
        },
        message: 'Login successful',
      });
    } catch (error) {
      handleError(error, res, 'Failed to login');
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 * @body {string} email - User email address
 * @returns {Object} Success message (doesn't reveal if email exists)
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequiredFields(['email']),
  validateEmail('email'),
  async (req, res) => {
    try {
      const { email } = req.body;

      // Find user (don't reveal if email exists for security)
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      // If user exists, create reset token
      if (user) {
        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

        // Invalidate any existing tokens for this user
        await supabaseAdmin
          .from('password_reset_tokens')
          .update({ used: true })
          .eq('user_id', user.id)
          .eq('used', false);

        // Store new token
        const { error: tokenError } = await supabaseAdmin
          .from('password_reset_tokens')
          .insert({
            user_id: user.id,
            token: resetToken,
            expires_at: expiresAt.toISOString(),
          });

        if (tokenError) {
          console.error('Failed to create reset token:', tokenError);
          throw ErrorCreators.internalServerError('Failed to process password reset request');
        }

        // Send email (don't fail if email service is down)
        try {
          await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Email service will log the token in development mode if RESEND_API_KEY is not set
        }
      }

      // Always return success (don't reveal if email exists)
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      handleError(error, res, 'Failed to process password reset request');
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * @body {string} token - Password reset token
 * @body {string} password - New password
 * @returns {Object} Success message
 */
router.post(
  '/reset-password',
  validateRequiredFields(['token', 'password']),
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw ErrorCreators.validationError(
          passwordValidation.message || 'Password does not meet requirements'
        );
      }

      // Find valid token
      const { data: resetToken, error: tokenError } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('*, user:users(id, email)')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        throw ErrorCreators.unauthorized('Invalid or expired reset token');
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update user password
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', resetToken.user_id);

      if (updateError) {
        console.error('Failed to update password:', updateError);
        throw ErrorCreators.internalServerError('Failed to reset password');
      }

      // Mark token as used
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id);

      res.json({
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      handleError(error, res, 'Failed to reset password');
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * @body {string} refreshToken - Refresh token
 * @returns {Object} New access and refresh tokens
 */
router.post(
  '/refresh',
  async (req, res) => {
    try {
      // Extract refresh token from cookie or body
      const refreshToken = extractRefreshToken(req);

      if (!refreshToken || typeof refreshToken !== 'string') {
        throw ErrorCreators.validationError('Refresh token is required');
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error) {
        throw ErrorCreators.unauthorized('Invalid or expired refresh token');
      }

      // Get user from database
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, role, city_id')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        throw ErrorCreators.unauthorized('User not found');
      }

      // Generate new token pair
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        cityId: user.city_id,
      });

      // Set new HttpOnly cookies
      setAuthCookies(res, tokens);

      res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      handleError(error, res, 'Failed to refresh token');
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user and clear cookies
 * @returns {Object} Success message
 */
router.post('/logout', (req, res) => {
  try {
    // Clear auth cookies
    clearAuthCookies(res);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(error, res, 'Failed to logout');
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 * @header Authorization Bearer {token} or Cookie
 * @returns {Object} User data
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Not authenticated');
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, city_id, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      throw ErrorCreators.notFound('User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      cityId: user.city_id,
      createdAt: user.created_at,
    });
  } catch (error) {
    handleError(error, res, 'Failed to get user information');
  }
});

export default router;
