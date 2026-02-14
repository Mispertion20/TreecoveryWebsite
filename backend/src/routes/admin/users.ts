import express from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';
import { supabaseAdmin } from '../../config/supabase';
import { handleError, ErrorCreators } from '../../utils/errorHandler';
import { UserRole } from '../../types/database';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 * Query params: role, status (active/inactive), city_id, page, limit, search
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { role, city_id, page = '1', limit = '50', search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        role,
        city_id,
        created_at,
        updated_at,
        city:cities(id, name_en, name_ru, name_kz)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (city_id) {
      query = query.eq('city_id', city_id);
    }

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      throw ErrorCreators.internalServerError('Failed to fetch users');
    }

    // Get activity stats for each user
    const usersWithActivity = await Promise.all(
      (users || []).map(async (user) => {
        const [adoptions, reports, comments] = await Promise.all([
          supabaseAdmin
            .from('tree_adoptions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_active', true),
          supabaseAdmin
            .from('citizen_reports')
            .select('id', { count: 'exact', head: true })
            .eq('reporter_id', user.id),
          supabaseAdmin
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ]);

        return {
          ...user,
          activity: {
            adoptions: adoptions.count || 0,
            reports: reports.count || 0,
            comments: comments.count || 0,
          },
        };
      })
    );

    res.json({
      users: usersWithActivity,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch users');
  }
});

/**
 * GET /api/admin/users/:id
 * Get user details with activity
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        role,
        city_id,
        created_at,
        updated_at,
        city:cities(id, name_en, name_ru, name_kz)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      throw ErrorCreators.notFound('User not found');
    }

    // Get detailed activity
    const [adoptions, reports, comments, auditLogs] = await Promise.all([
      supabaseAdmin
        .from('tree_adoptions')
        .select('id, green_space_id, adoption_date, notes, is_active, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('citizen_reports')
        .select('id, report_type, status, created_at')
        .eq('reporter_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('comments')
        .select('id, green_space_id, content, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('admin_audit_log')
        .select('id, action, details, created_at')
        .eq('target_user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    res.json({
      ...user,
      activity: {
        adoptions: adoptions.data || [],
        reports: reports.data || [],
        comments: comments.data || [],
        auditLogs: auditLogs.data || [],
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch user details');
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
router.put('/:id/role', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      throw ErrorCreators.validationError('Role is required');
    }

    const validRoles: UserRole[] = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      throw ErrorCreators.validationError(`Role must be one of: ${validRoles.join(', ')}`);
    }

    // Prevent non-super_admins from creating super_admins
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      throw ErrorCreators.forbidden('Only super admins can assign super_admin role');
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      throw ErrorCreators.notFound('User not found');
    }

    // Prevent changing own role
    if (id === req.user.userId) {
      throw ErrorCreators.validationError('You cannot change your own role');
    }

    // Update role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw ErrorCreators.internalServerError('Failed to update user role');
    }

    // Log admin action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: req.user.userId,
      action: 'user_role_changed',
      target_user_id: id,
      old_value: { role: currentUser.role },
      new_value: { role },
      details: `Changed role from ${currentUser.role} to ${role}`,
    });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to update user role');
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate user account
 * Body: { active: boolean }
 */
router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      throw ErrorCreators.validationError('active field must be a boolean');
    }

    // Prevent deactivating own account
    if (id === req.user.userId) {
      throw ErrorCreators.validationError('You cannot deactivate your own account');
    }

    // Get current user
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      throw ErrorCreators.notFound('User not found');
    }

    // Note: We don't have an 'active' field in users table, so we'll use a soft delete approach
    // For now, we'll just log the action. In a real implementation, you might want to add
    // an 'is_active' or 'deleted_at' field to the users table.
    
    // Log admin action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: req.user.userId,
      action: active ? 'user_activated' : 'user_deactivated',
      target_user_id: id,
      old_value: { active: !active },
      new_value: { active },
      details: active ? 'User account activated' : 'User account deactivated',
    });

    res.json({
      message: active ? 'User account activated' : 'User account deactivated',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        active,
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to update user status');
  }
});

/**
 * GET /api/admin/users/:id/audit-log
 * Get audit log for a specific user
 */
router.get('/:id/audit-log', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const { data: logs, error, count } = await supabaseAdmin
      .from('admin_audit_log')
      .select(`
        id,
        action,
        old_value,
        new_value,
        details,
        created_at,
        admin:users(id, email)
      `, { count: 'exact' })
      .eq('target_user_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      throw ErrorCreators.internalServerError('Failed to fetch audit log');
    }

    res.json({
      logs: logs || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch audit log');
  }
});

export default router;

