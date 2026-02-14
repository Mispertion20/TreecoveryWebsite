import express from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { handleError } from '../utils/errorHandler';

const router = express.Router();

/**
 * GET /api/gallery
 * Get photos for gallery (public access)
 * Query params: city_id, district_id, year, type, page, limit
 */
router.get('/', async (req, res) => {
  try {
    const {
      city_id,
      district_id,
      year,
      type,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // OPTIMIZED: Use database function to eliminate N+1 query
    const { data, error } = await supabaseAdmin.rpc('get_gallery_photos', {
      p_city_id: city_id || null,
      p_district_id: district_id || null,
      p_type: type || null,
      p_year: year ? parseInt(year as string, 10) : null,
      p_limit: limitNum,
      p_offset: offset,
    });

    if (error) {
      throw new Error(`Failed to fetch gallery photos: ${error.message}`);
    }

    // Get total count from first row (all rows have same total_count)
    const totalCount = data && data.length > 0 ? Number(data[0].total_count) : 0;

    // Format response data
    const formattedData = (data || []).map((row: any) => ({
      id: row.photo_id,
      url: row.photo_url,
      uploaded_at: row.uploaded_at,
      green_space: row.green_space_data,
    }));

    res.json({
      data: formattedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch gallery photos');
  }
});

/**
 * GET /api/gallery/before-after
 * Get before/after photo pairs (public access)
 */
router.get('/before-after', async (req, res) => {
  try {
    const { green_space_id } = req.query;

    if (!green_space_id) {
      throw new Error('green_space_id is required');
    }

    // Get all photos for a green space, ordered by date
    const { data: photos, error } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('green_space_id', green_space_id)
      .order('uploaded_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`);
    }

    // Group photos into pairs (before/after)
    // This is a simple implementation - you might want more sophisticated pairing logic
    const pairs: any[] = [];
    for (let i = 0; i < photos.length - 1; i += 2) {
      pairs.push({
        before: photos[i],
        after: photos[i + 1] || null,
      });
    }

    res.json({ pairs });
  } catch (error) {
    handleError(error, res, 'Failed to fetch before/after photos');
  }
});

export default router;

