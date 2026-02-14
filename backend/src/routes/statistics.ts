import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import {
  getOverviewStats,
  getCityStats,
  getTrends,
  getSpeciesDistribution,
} from '../services/statistics';

const router = express.Router();

/**
 * GET /api/statistics/overview
 * Get overview statistics (public access)
 */
router.get('/overview', optionalAuth, async (req: AuthRequest, res) => {
  try {
    // City admins can only see their city's stats
    const cityId = req.user?.role === 'admin' && req.user.cityId ? req.user.cityId : undefined;
    
    const stats = await getOverviewStats(cityId);
    res.json(stats);
  } catch (error) {
    handleError(error, res, 'Failed to fetch overview statistics');
  }
});

/**
 * GET /api/statistics/city/:id
 * Get city-specific statistics (public access)
 */
router.get('/city/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // City admins can only access their city
    if (req.user?.role === 'admin' && req.user.cityId && req.user.cityId !== id) {
      throw ErrorCreators.forbidden('Access denied to this city\'s statistics');
    }

    const stats = await getCityStats(id);
    res.json(stats);
  } catch (error) {
    handleError(error, res, 'Failed to fetch city statistics');
  }
});

/**
 * GET /api/statistics/trends
 * Get planting trends (public access)
 * Query params: year (optional), cityId (optional)
 */
router.get('/trends', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const cityId = req.query.cityId as string | undefined;

    // City admins can only see their city's trends
    const finalCityId = req.user?.role === 'admin' && req.user.cityId 
      ? req.user.cityId 
      : cityId;

    if (year && (isNaN(year) || year < 1900 || year > 2100)) {
      throw ErrorCreators.validationError('Invalid year parameter. Year must be between 1900 and 2100');
    }

    const trends = await getTrends(year, finalCityId);
    res.json(trends);
  } catch (error) {
    handleError(error, res, 'Failed to fetch trends');
  }
});

/**
 * GET /api/statistics/species
 * Get species distribution (public access)
 * Query params: cityId (optional), limit (optional, default 10)
 */
router.get('/species', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const cityId = req.query.cityId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    // City admins can only see their city's species
    const finalCityId = req.user?.role === 'admin' && req.user.cityId 
      ? req.user.cityId 
      : cityId;

    if (limit < 1 || limit > 50) {
      throw ErrorCreators.validationError('Limit must be between 1 and 50');
    }

    const distribution = await getSpeciesDistribution(finalCityId, limit);
    res.json(distribution);
  } catch (error) {
    handleError(error, res, 'Failed to fetch species distribution');
  }
});

export default router;

