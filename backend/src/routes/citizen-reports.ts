import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { upload, validateImageFile, uploadToSupabase } from '../services/fileUpload';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { CitizenReportInsert, CitizenReportUpdate, ReportStatus } from '../types/database';
import { citizenReportLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * POST /api/citizen-reports
 * Create a new citizen report (public, but can be authenticated)
 */
router.post('/', citizenReportLimiter, optionalAuth, upload.array('photos', 5), async (req: AuthRequest, res) => {
  try {
    const {
      report_type,
      description,
      latitude,
      longitude,
      city_id,
      district_id,
      green_space_id,
      reporter_email,
      reporter_name,
    } = req.body;

    // Validation
    if (!report_type || !description || !latitude || !longitude) {
      throw ErrorCreators.validationError('Missing required fields: report_type, description, latitude, longitude');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw ErrorCreators.validationError('Invalid coordinates');
    }

    // If authenticated, use user info; otherwise require email/name
    const reporterId = req.user?.id || null;
    const finalEmail = reporterId ? req.user?.email : reporter_email;
    const finalName = reporterId ? undefined : reporter_name;

    if (!reporterId && (!finalEmail || !finalName)) {
      throw ErrorCreators.validationError('Either login or provide email and name');
    }

    // Create PostGIS point
    const location = `POINT(${lng} ${lat})`;

    // Insert report
    const reportData: CitizenReportInsert = {
      reporter_id: reporterId,
      reporter_email: finalEmail,
      reporter_name: finalName,
      report_type: report_type as any,
      description,
      latitude: lat,
      longitude: lng,
      city_id: city_id || null,
      district_id: district_id || null,
      green_space_id: green_space_id || null,
    };

    const { data: report, error: reportError } = await supabaseAdmin
      .from('citizen_reports')
      .insert({
        ...reportData,
        location: `SRID=4326;${location}`,
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Failed to create report: ${reportError.message}`);
    }

    // Upload photos if provided
    const photos = req.files as Express.Multer.File[];
    if (photos && photos.length > 0) {
      const photoUrls: string[] = [];

      for (const photo of photos) {
        const validation = validateImageFile(photo);
        if (!validation.valid) {
          continue; // Skip invalid photos
        }

        try {
          const { url } = await uploadToSupabase(photo, 'green-space-photos', 'reports');
          photoUrls.push(url);
        } catch (error) {
          console.error('Photo upload error:', error);
          // Continue with other photos
        }
      }

      // Insert photo records
      if (photoUrls.length > 0) {
        await supabaseAdmin
          .from('report_photos')
          .insert(photoUrls.map(url => ({ report_id: report.id, url })));
      }
    }

    // Fetch complete report with photos
    const { data: completeReport, error: fetchError } = await supabaseAdmin
      .from('citizen_reports')
      .select(`
        *,
        photos:report_photos(*)
      `)
      .eq('id', report.id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    res.status(201).json(completeReport || report);
  } catch (error) {
    handleError(error, res, 'Failed to create citizen report');
  }
});

/**
 * GET /api/citizen-reports
 * Get citizen reports (admin only, or user's own reports)
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('citizen_reports')
      .select(`
        *,
        photos:report_photos(*),
        city:cities(name_en, name_ru),
        district:districts(name_en, name_ru),
        green_space:green_spaces(id, species_ru)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Admins see all reports, regular users see only their own
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      if (status) {
        query = query.eq('status', status);
      }
    } else {
      query = query.eq('reporter_id', req.user.id);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
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
    handleError(error, res, 'Failed to fetch citizen reports');
  }
});

/**
 * GET /api/citizen-reports/:id
 * Get single citizen report
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw ErrorCreators.unauthorized('Authentication required');
    }

    const { id } = req.params;

    let query = supabaseAdmin
      .from('citizen_reports')
      .select(`
        *,
        photos:report_photos(*),
        city:cities(*),
        district:districts(*),
        green_space:green_spaces(*)
      `)
      .eq('id', id)
      .single();

    // Regular users can only see their own reports
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      query = query.eq('reporter_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw new Error(`Failed to fetch report: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    handleError(error, res, 'Failed to fetch citizen report');
  }
});

/**
 * PATCH /api/citizen-reports/:id
 * Update report status (admin only)
 */
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      throw ErrorCreators.forbidden('Admin access required');
    }

    const { id } = req.params;
    const { status, admin_response } = req.body as CitizenReportUpdate;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'rejected') {
        updateData.resolved_by = req.user.id;
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (admin_response !== undefined) {
      updateData.admin_response = admin_response;
    }

    const { data, error } = await supabaseAdmin
      .from('citizen_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw new Error(`Failed to update report: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    handleError(error, res, 'Failed to update citizen report');
  }
});

export default router;

