import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateCSV, generateFilename } from '../services/exportService';
import { GreenSpaceFilters } from '../types/database';

const router = express.Router();

/**
 * POST /api/reports/export
 * Export green spaces data as CSV or Excel
 */
router.post('/export', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      city_id,
      district_id,
      status,
      type,
      species_ru,
      planting_date_from,
      planting_date_to,
      year,
      search,
      format = 'csv',
    } = req.body;

    // Build filters object
    const filters: GreenSpaceFilters = {};
    
    if (city_id) filters.city_id = city_id;
    if (district_id) filters.district_id = district_id;
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (species_ru) filters.species_ru = species_ru;
    if (planting_date_from) filters.planting_date_from = planting_date_from;
    if (planting_date_to) filters.planting_date_to = planting_date_to;
    if (year) filters.year = year;
    if (search) filters.search = search;

    // Validate format
    if (format !== 'csv' && format !== 'excel') {
      return res.status(400).json({ error: 'Format must be "csv" or "excel"' });
    }

    // For now, only CSV is supported
    if (format === 'excel') {
      return res.status(501).json({ error: 'Excel export not yet implemented' });
    }

    // Generate CSV (pass user for access control)
    const csvContent = await generateCSV(filters, req.user);
    
    if (!csvContent) {
      return res.status(404).json({ error: 'No data found matching the filters' });
    }

    // Generate filename
    const filename = generateFilename(filters, format);

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    // Send CSV content
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

