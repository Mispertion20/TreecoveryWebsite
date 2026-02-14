import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, requireAdmin, AuthRequest, checkCityAccess } from '../middleware/auth';
import { parseCSV, getCSVTemplate } from '../services/csvParser';
import { parseCSVEnhanced, validateCSVPreview } from '../services/enhancedCsvParser';
import { upload, uploadToSupabase, validateImageFile, deleteFromSupabase } from '../services/fileUpload';
import { GreenSpaceInsert, GreenSpaceUpdate, GreenSpaceStatus } from '../types/database';

const router = express.Router();

/**
 * GET /api/green-spaces
 * List green spaces with filters and pagination
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      city_id,
      district_id,
      status,
      type,
      species_ru,
      planting_date_from,
      planting_date_to,
      year,
      page = '1',
      limit = '50',
      search,
    } = req.query;

    let query = supabaseAdmin
      .from('green_spaces')
      .select(`
        *,
        city:cities(*),
        district:districts(*),
        created_by_user:users!green_spaces_created_by_fkey(id, email)
      `);

    // Apply filters
    if (city_id) {
      query = query.eq('city_id', city_id as string);
    }

    if (district_id) {
      query = query.eq('district_id', district_id as string);
    }

    if (status) {
      query = query.eq('status', status as string);
    }

    if (type) {
      query = query.eq('type', type as string);
    }

    if (species_ru) {
      query = query.ilike('species_ru', `%${species_ru}%`);
    }

    if (planting_date_from) {
      query = query.gte('planting_date', planting_date_from as string);
    }

    if (planting_date_to) {
      query = query.lte('planting_date', planting_date_to as string);
    }

    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
      query = query.gte('planting_date', yearStart).lte('planting_date', yearEnd);
    }

    if (search) {
      query = query.or(
        `species_ru.ilike.%${search}%,species_en.ilike.%${search}%,species_kz.ilike.%${search}%,notes.ilike.%${search}%`
      );
    }

    // City access control for admins
    if (req.user?.role === 'admin' && req.user.cityId) {
      query = query.eq('city_id', req.user.cityId);
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch green spaces' });
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
    console.error('List green spaces error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/green-spaces/:id
 * Get single green space by ID
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from('green_spaces')
      .select(`
        *,
        city:cities(*),
        district:districts(*),
        created_by_user:users!green_spaces_created_by_fkey(id, email),
        photos:photos(*)
      `)
      .eq('id', id);

    // City access control for admins
    if (req.user?.role === 'admin' && req.user.cityId) {
      query = query.eq('city_id', req.user.cityId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Green space not found' });
      }
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch green space' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get green space error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/green-spaces
 * Create a new green space (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const {
        type,
        species_ru,
        species_kz,
        species_en,
        species_scientific,
        latitude,
        longitude,
        city_id,
        district_id,
        planting_date,
        status = 'alive',
        notes,
        responsible_org,
      } = req.body;

      // Validation
      if (!type || !species_ru || !latitude || !longitude || !city_id || !planting_date) {
        return res.status(400).json({
          error: 'Missing required fields: type, species_ru, latitude, longitude, city_id, planting_date',
        });
      }

      // Validate coordinates are within Kazakhstan
      if (latitude < 40.9 || latitude > 55.4 || longitude < 46.5 || longitude > 87.4) {
        return res.status(400).json({ error: 'Coordinates must be within Kazakhstan bounds' });
      }

      // Validate planting date
      const plantingDate = new Date(planting_date);
      if (isNaN(plantingDate.getTime()) || plantingDate > new Date()) {
        return res.status(400).json({ error: 'Planting date must be a valid date in the past' });
      }

      const insertData: GreenSpaceInsert = {
        type,
        species_ru,
        species_kz: species_kz || null,
        species_en: species_en || null,
        species_scientific: species_scientific || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city_id,
        district_id: district_id || null,
        planting_date: plantingDate,
        status: status || 'alive',
        notes: notes || null,
        responsible_org: responsible_org || null,
        created_by: req.user.userId,
      };

      const { data, error } = await supabaseAdmin
        .from('green_spaces')
        .insert(insertData)
        .select(`
          *,
          city:cities(*),
          district:districts(*)
        `)
        .single();

      if (error) {
        console.error('Insert error:', error);
        return res.status(500).json({ error: 'Failed to create green space' });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error('Create green space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/green-spaces/:id
 * Update a green space (admin only)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const updateData: GreenSpaceUpdate = {};

      // Build update object from request body
      if (req.body.type) updateData.type = req.body.type;
      if (req.body.species_ru) updateData.species_ru = req.body.species_ru;
      if (req.body.species_kz !== undefined) updateData.species_kz = req.body.species_kz || null;
      if (req.body.species_en !== undefined) updateData.species_en = req.body.species_en || null;
      if (req.body.species_scientific !== undefined)
        updateData.species_scientific = req.body.species_scientific || null;
      if (req.body.latitude) updateData.latitude = parseFloat(req.body.latitude);
      if (req.body.longitude) updateData.longitude = parseFloat(req.body.longitude);
      if (req.body.city_id) updateData.city_id = req.body.city_id;
      if (req.body.district_id !== undefined) updateData.district_id = req.body.district_id || null;
      if (req.body.planting_date) updateData.planting_date = new Date(req.body.planting_date);
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes || null;
      if (req.body.responsible_org !== undefined)
        updateData.responsible_org = req.body.responsible_org || null;

      // Validate coordinates if provided
      if (updateData.latitude && updateData.longitude) {
        if (
          updateData.latitude < 40.9 ||
          updateData.latitude > 55.4 ||
          updateData.longitude < 46.5 ||
          updateData.longitude > 87.4
        ) {
          return res.status(400).json({ error: 'Coordinates must be within Kazakhstan bounds' });
        }
      }

      // Validate planting date if provided
      if (updateData.planting_date) {
        if (isNaN(updateData.planting_date.getTime()) || updateData.planting_date > new Date()) {
          return res.status(400).json({ error: 'Planting date must be a valid date in the past' });
        }
      }

      // Check if green space exists and user has access
      const { data: existing } = await supabaseAdmin
        .from('green_spaces')
        .select('id, city_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Green space not found' });
      }

      // City access control
      if (req.user.role === 'admin' && req.user.cityId && existing.city_id !== req.user.cityId) {
        return res.status(403).json({ error: 'Access denied to this green space' });
      }

      const { data, error } = await supabaseAdmin
        .from('green_spaces')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          city:cities(*),
          district:districts(*)
        `)
        .single();

      if (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: 'Failed to update green space' });
      }

      res.json(data);
    } catch (error) {
      console.error('Update green space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/green-spaces/:id
 * Delete a green space (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if green space exists and user has access
      const { data: existing } = await supabaseAdmin
        .from('green_spaces')
        .select('id, city_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Green space not found' });
      }

      // City access control
      if (req.user.role === 'admin' && req.user.cityId && existing.city_id !== req.user.cityId) {
        return res.status(403).json({ error: 'Access denied to this green space' });
      }

      // Delete associated photos first (cascade should handle this, but let's be explicit)
      const { error: photosError } = await supabaseAdmin
        .from('photos')
        .delete()
        .eq('green_space_id', id);

      if (photosError) {
        console.error('Delete photos error:', photosError);
      }

      const { error } = await supabaseAdmin.from('green_spaces').delete().eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Failed to delete green space' });
      }

      res.json({ message: 'Green space deleted successfully' });
    } catch (error) {
      console.error('Delete green space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PATCH /api/green-spaces/:id/status
 * Update status only (admin only)
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses: GreenSpaceStatus[] = ['alive', 'attention_needed', 'dead', 'removed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Check if green space exists and user has access
      const { data: existing } = await supabaseAdmin
        .from('green_spaces')
        .select('id, city_id, status')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Green space not found' });
      }

      // City access control
      if (req.user.role === 'admin' && req.user.cityId && existing.city_id !== req.user.cityId) {
        return res.status(403).json({ error: 'Access denied to this green space' });
      }

      const { data, error } = await supabaseAdmin
        .from('green_spaces')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          city:cities(*),
          district:districts(*)
        `)
        .single();

      if (error) {
        console.error('Update status error:', error);
        return res.status(500).json({ error: 'Failed to update status' });
      }

      res.json(data);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/green-spaces/bulk
 * Bulk upload green spaces from CSV (admin only)
 */
router.post(
  '/bulk',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { csv_content } = req.body;

      if (!csv_content) {
        return res.status(400).json({ error: 'CSV content is required' });
      }

      // Parse CSV
      const { valid, invalid } = await parseCSV(csv_content, req.user.userId);

      if (invalid.length > 0) {
        return res.status(400).json({
          error: 'CSV validation failed',
          invalid_rows: invalid,
          valid_count: valid.length,
          invalid_count: invalid.length,
        });
      }

      if (valid.length === 0) {
        return res.status(400).json({ error: 'No valid rows found in CSV' });
      }

      // City access control - filter by city if admin
      let dataToInsert = valid.map((v) => v.data);
      if (req.user && req.user.role === 'admin' && req.user.cityId) {
        dataToInsert = dataToInsert.filter((d) => d.city_id === req.user!.cityId);
      }

      // Insert all valid rows
      const { data, error } = await supabaseAdmin
        .from('green_spaces')
        .insert(dataToInsert)
        .select(`
          *,
          city:cities(*),
          district:districts(*)
        `);

      if (error) {
        console.error('Bulk insert error:', error);
        return res.status(500).json({ error: 'Failed to insert green spaces' });
      }

      res.status(201).json({
        message: `Successfully created ${data.length} green spaces`,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/green-spaces/template/csv
 * Get CSV template for download
 */
router.get('/template/csv', authenticate, requireAdmin, async (req, res) => {
  try {
    const template = getCSVTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=green-spaces-template.csv');
    res.send(template);
  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/green-spaces/validate-csv
 * Validate CSV content with enhanced validation (real-time, duplicates, quality scoring)
 */
router.post(
  '/validate-csv',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { csv_content, check_duplicates } = req.body;

      if (!csv_content) {
        return res.status(400).json({ error: 'CSV content is required' });
      }

      // Enhanced validation
      const result = await parseCSVEnhanced(
        csv_content,
        req.user.userId,
        check_duplicates !== false
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('CSV validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/green-spaces/preview-csv
 * Quick preview validation of CSV (for real-time feedback)
 */
router.post('/preview-csv', authenticate, requireAdmin, async (req, res) => {
  try {
    const { csv_content } = req.body;

    if (!csv_content) {
      return res.status(400).json({ error: 'CSV content is required' });
    }

    const preview = validateCSVPreview(csv_content);
    res.status(200).json(preview);
  } catch (error) {
    console.error('CSV preview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/green-spaces/bulk-enhanced
 * Bulk upload with enhanced validation and duplicate detection
 */
router.post(
  '/bulk-enhanced',
  authenticate,
  requireAdmin,
  checkCityAccess,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { csv_content, skip_duplicates, min_quality_score } = req.body;

      if (!csv_content) {
        return res.status(400).json({ error: 'CSV content is required' });
      }

      // Enhanced validation
      const { valid, invalid, duplicates, qualityStats } = await parseCSVEnhanced(
        csv_content,
        req.user.userId,
        true
      );

      // Filter by quality score if specified
      let filteredValid = valid;
      if (min_quality_score !== undefined) {
        filteredValid = valid.filter((v) => v.qualityScore >= min_quality_score);
      }

      // Filter out duplicates if skip_duplicates is true
      if (skip_duplicates && duplicates.length > 0) {
        const duplicateRows = new Set(duplicates.map((d) => d.row));
        filteredValid = filteredValid.filter((_, index) => !duplicateRows.has(index + 2));
      }

      if (invalid.length > 0 && filteredValid.length === 0) {
        return res.status(400).json({
          error: 'CSV validation failed',
          invalid_rows: invalid,
          duplicates,
          quality_stats: qualityStats,
          valid_count: 0,
          invalid_count: invalid.length,
        });
      }

      if (filteredValid.length === 0) {
        return res.status(400).json({
          error: 'No valid rows found after filtering',
          invalid_rows: invalid,
          duplicates,
          quality_stats: qualityStats,
        });
      }

      // City access control - filter by city if admin
      let dataToInsert = filteredValid.map((v) => v.data);
      if (req.user && req.user.role === 'admin' && req.user.cityId) {
        dataToInsert = dataToInsert.filter((d) => d.city_id === req.user!.cityId);
      }

      // Insert all valid rows
      const { data, error } = await supabaseAdmin
        .from('green_spaces')
        .insert(dataToInsert)
        .select(`
          *,
          city:cities(*),
          district:districts(*)
        `);

      if (error) {
        console.error('Bulk insert error:', error);
        return res.status(500).json({ error: 'Failed to insert green spaces' });
      }

      res.status(201).json({
        message: `Successfully created ${data.length} green spaces`,
        count: data.length,
        data,
        validation_summary: {
          total_rows: qualityStats.totalRows,
          valid_count: filteredValid.length,
          invalid_count: invalid.length,
          duplicates_found: duplicates.length,
          duplicates_skipped: skip_duplicates ? duplicates.length : 0,
          quality_stats: qualityStats,
        },
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/green-spaces/:id/photos
 * Upload photo for a green space (admin only)
 */
router.post(
  '/:id/photos',
  authenticate,
  requireAdmin,
  checkCityAccess,
  upload.single('photo'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file
      const validation = validateImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const { id } = req.params;

      // Check if green space exists and user has access
      const { data: existing } = await supabaseAdmin
        .from('green_spaces')
        .select('id, city_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Green space not found' });
      }

      // City access control
      if (req.user.role === 'admin' && req.user.cityId && existing.city_id !== req.user.cityId) {
        return res.status(403).json({ error: 'Access denied to this green space' });
      }

      // Upload to Supabase Storage
      const { url, path: filePath } = await uploadToSupabase(req.file);

      // Save photo record
      const { data, error } = await supabaseAdmin
        .from('photos')
        .insert({
          green_space_id: id,
          url,
          uploaded_by: req.user.userId,
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await deleteFromSupabase(filePath);
        console.error('Photo insert error:', error);
        return res.status(500).json({ error: 'Failed to save photo record' });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

