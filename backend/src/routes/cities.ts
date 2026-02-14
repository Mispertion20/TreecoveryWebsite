import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/cities
 * List all cities
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .order('name_en');

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch cities' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('List cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/cities/:id
 * Get city by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'City not found' });
      }
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch city' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get city error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/cities/:id/districts
 * Get districts for a city
 */
router.get('/:id/districts', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('districts')
      .select('*')
      .eq('city_id', id)
      .order('name_en');

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch districts' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('List districts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

