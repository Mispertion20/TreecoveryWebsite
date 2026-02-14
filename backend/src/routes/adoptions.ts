import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { TreeAdoptionInsert } from '../types/database';

const router = express.Router();

/**
 * POST /api/adoptions
 * Adopt a tree (authenticated users only)
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { green_space_id, notes } = req.body;

    if (!green_space_id) {
      throw ErrorCreators.validationError('green_space_id is required');
    }

    // Check if green space exists
    const { data: greenSpace, error: gsError } = await supabaseAdmin
      .from('green_spaces')
      .select('id')
      .eq('id', green_space_id)
      .single();

    if (gsError || !greenSpace) {
      throw ErrorCreators.notFound('Green space not found');
    }

    // Check if already adopted
    const { data: existing } = await supabaseAdmin
      .from('tree_adoptions')
      .select('id')
      .eq('user_id', req.user.userId)
      .eq('green_space_id', green_space_id)
      .eq('is_active', true)
      .single();

    if (existing) {
      throw ErrorCreators.validationError('You have already adopted this tree');
    }

    // Create adoption
    const adoptionData: TreeAdoptionInsert = {
      user_id: req.user.userId,
      green_space_id,
      notes: notes || null,
    };

    const { data: adoption, error: adoptionError } = await supabaseAdmin
      .from('tree_adoptions')
      .insert(adoptionData)
      .select(`
        *,
        green_space:green_spaces(
          id,
          species_ru,
          species_en,
          type,
          status,
          planting_date,
          city:cities(name_en, name_ru),
          district:districts(name_en, name_ru)
        )
      `)
      .single();

    if (adoptionError) {
      throw new Error(`Failed to create adoption: ${adoptionError.message}`);
    }

    // Award badge if first adoption
    const { count } = await supabaseAdmin
      .from('tree_adoptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.userId)
      .eq('is_active', true);

    if (count === 1) {
      await supabaseAdmin
        .from('user_badges')
        .insert({
          user_id: req.user.userId,
          badge_type: 'first_adoption',
          badge_name: 'First Tree Adopter',
        })
        .catch(() => {
          // Ignore duplicate badge errors
        });
    }

    res.status(201).json(adoption);
  } catch (error) {
    handleError(error, res, 'Failed to adopt tree');
  }
});

/**
 * GET /api/adoptions
 * Get user's adoptions
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { is_active, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('tree_adoptions')
      .select(`
        *,
        green_space:green_spaces(
          id,
          species_ru,
          species_en,
          species_kz,
          type,
          status,
          planting_date,
          latitude,
          longitude,
          city:cities(name_en, name_ru),
          district:districts(name_en, name_ru),
          photos:photos(url)
        )
      `, { count: 'exact' })
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch adoptions: ${error.message}`);
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
    handleError(error, res, 'Failed to fetch adoptions');
  }
});

/**
 * GET /api/adoptions/:id
 * Get single adoption
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tree_adoptions')
      .select(`
        *,
        green_space:green_spaces(
          *,
          city:cities(*),
          district:districts(*),
          photos:photos(*)
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Adoption not found' });
      }
      throw new Error(`Failed to fetch adoption: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    handleError(error, res, 'Failed to fetch adoption');
  }
});

/**
 * DELETE /api/adoptions/:id
 * Cancel adoption
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('tree_adoptions')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) {
      throw new Error(`Failed to cancel adoption: ${error.message}`);
    }

    res.json({ message: 'Adoption cancelled successfully' });
  } catch (error) {
    handleError(error, res, 'Failed to cancel adoption');
  }
});

/**
 * GET /api/adoptions/green-space/:id
 * Check if user has adopted a specific green space
 */
router.get('/green-space/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tree_adoptions')
      .select('id, is_active')
      .eq('user_id', req.user.userId)
      .eq('green_space_id', id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check adoption: ${error.message}`);
    }

    res.json({ adopted: !!data, adoption: data || null });
  } catch (error) {
    handleError(error, res, 'Failed to check adoption');
  }
});

export default router;

