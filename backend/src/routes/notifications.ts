import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { sendNotificationEmail } from '../services/emailService';

const router = express.Router();

/**
 * GET /api/notifications
 * Get notifications for current user
 * Query params: read (boolean), page, limit
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { read, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (read !== undefined) {
      query = query.eq('read', read === 'true');
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      throw ErrorCreators.internalServerError('Failed to fetch notifications');
    }

    res.json({
      notifications: notifications || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch notifications');
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.userId)
      .eq('read', false);

    if (error) {
      throw ErrorCreators.internalServerError('Failed to fetch unread count');
    }

    res.json({ count: count || 0 });
  } catch (error) {
    handleError(error, res, 'Failed to fetch unread count');
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (fetchError || !notification) {
      throw ErrorCreators.notFound('Notification not found');
    }

    const { error: updateError } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (updateError) {
      throw ErrorCreators.internalServerError('Failed to mark notification as read');
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    handleError(error, res, 'Failed to mark notification as read');
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.userId)
      .eq('read', false);

    if (error) {
      throw ErrorCreators.internalServerError('Failed to mark all notifications as read');
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    handleError(error, res, 'Failed to mark all notifications as read');
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (fetchError || !notification) {
      throw ErrorCreators.notFound('Notification not found');
    }

    const { error: deleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw ErrorCreators.internalServerError('Failed to delete notification');
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    handleError(error, res, 'Failed to delete notification');
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for current user
 */
router.get('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { data: preferences, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', req.user.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - we'll create default preferences
      throw ErrorCreators.internalServerError('Failed to fetch preferences');
    }

    // If no preferences exist, return defaults
    if (!preferences) {
      res.json({
        email: true,
        push: false,
        in_app: true,
      });
      return;
    }

    res.json(preferences);
  } catch (error) {
    handleError(error, res, 'Failed to fetch notification preferences');
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 * Body: { email?: boolean, push?: boolean, in_app?: boolean }
 */
router.put('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { email, push, in_app } = req.body;

    // Check if preferences exist
    const { data: existing } = await supabaseAdmin
      .from('notification_preferences')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    const preferencesData: any = {};
    if (email !== undefined) preferencesData.email = email;
    if (push !== undefined) preferencesData.push = push;
    if (in_app !== undefined) preferencesData.in_app = in_app;

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('notification_preferences')
        .update(preferencesData)
        .eq('user_id', req.user.userId)
        .select()
        .single();

      if (error) {
        throw ErrorCreators.internalServerError('Failed to update preferences');
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from('notification_preferences')
        .insert({
          user_id: req.user.userId,
          email: email !== undefined ? email : true,
          push: push !== undefined ? push : false,
          in_app: in_app !== undefined ? in_app : true,
        })
        .select()
        .single();

      if (error) {
        throw ErrorCreators.internalServerError('Failed to create preferences');
      }
      result = data;
    }

    res.json(result);
  } catch (error) {
    handleError(error, res, 'Failed to update notification preferences');
  }
});

export default router;

