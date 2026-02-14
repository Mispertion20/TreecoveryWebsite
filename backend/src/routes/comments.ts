import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { CommentInsert } from '../types/database';
import { commentLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * POST /api/comments
 * Create a comment (public, but can be authenticated)
 */
router.post('/', commentLimiter, optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { green_space_id, content, author_name, author_email } = req.body;

    if (!green_space_id || !content) {
      throw ErrorCreators.validationError('green_space_id and content are required');
    }

    if (content.length < 3 || content.length > 1000) {
      throw ErrorCreators.validationError('Comment must be between 3 and 1000 characters');
    }

    // If authenticated, use user info; otherwise require name/email
    const userId = req.user?.id || null;
    const finalName = userId ? undefined : author_name;
    const finalEmail = userId ? undefined : author_email;

    if (!userId && (!finalName || !finalEmail)) {
      throw ErrorCreators.validationError('Either login or provide name and email');
    }

    const commentData: CommentInsert = {
      green_space_id,
      user_id: userId,
      author_name: finalName,
      author_email: finalEmail,
      content,
    };

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        user:users(id, email)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    res.status(201).json(comment);
  } catch (error) {
    handleError(error, res, 'Failed to create comment');
  }
});

/**
 * GET /api/comments/green-space/:id
 * Get comments for a green space (public)
 */
router.get('/green-space/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const { data, error, count } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        user:users(id, email)
      `, { count: 'exact' })
      .eq('green_space_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    res.json({
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch comments');
  }
});

/**
 * DELETE /api/comments/:id
 * Delete own comment (or admin can delete any)
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    // Check if comment exists and user owns it
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    const isOwner = comment.user_id === req.user.userId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      throw ErrorCreators.forbidden('You can only delete your own comments');
    }

    const { error: deleteError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Failed to delete comment: ${deleteError.message}`);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    handleError(error, res, 'Failed to delete comment');
  }
});

export default router;

