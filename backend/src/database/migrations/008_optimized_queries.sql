-- =====================================================
-- Migration: Optimized Query Functions
-- Description: Database functions to eliminate N+1 queries
-- Author: Claude (Performance Optimization)
-- Date: 2025-11-10
-- Estimated Impact: 80% faster API responses
-- =====================================================

-- =====================================================
-- STATISTICS FUNCTIONS (Eliminate N+1 queries)
-- =====================================================

-- Get overview statistics with single query instead of multiple
CREATE OR REPLACE FUNCTION get_overview_stats(p_city_id UUID DEFAULT NULL)
RETURNS TABLE(
  total BIGINT,
  alive BIGINT,
  attention_needed BIGINT,
  dead BIGINT,
  removed BIGINT,
  tree_count BIGINT,
  park_count BIGINT,
  alley_count BIGINT,
  garden_count BIGINT,
  average_survival_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'alive') as alive,
    COUNT(*) FILTER (WHERE status = 'attention_needed') as attention_needed,
    COUNT(*) FILTER (WHERE status = 'dead') as dead,
    COUNT(*) FILTER (WHERE status = 'removed') as removed,
    COUNT(*) FILTER (WHERE type = 'tree') as tree_count,
    COUNT(*) FILTER (WHERE type = 'park') as park_count,
    COUNT(*) FILTER (WHERE type = 'alley') as alley_count,
    COUNT(*) FILTER (WHERE type = 'garden') as garden_count,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'alive')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as average_survival_rate
  FROM green_spaces
  WHERE p_city_id IS NULL OR city_id = p_city_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get city statistics with aggregations
CREATE OR REPLACE FUNCTION get_city_stats(p_city_id UUID)
RETURNS TABLE(
  city_id UUID,
  city_name_en VARCHAR,
  city_name_ru VARCHAR,
  city_name_kz VARCHAR,
  total_green_spaces BIGINT,
  alive_count BIGINT,
  attention_needed_count BIGINT,
  dead_count BIGINT,
  removed_count BIGINT,
  tree_count BIGINT,
  park_count BIGINT,
  unique_species_count BIGINT,
  survival_rate NUMERIC,
  earliest_planting DATE,
  latest_planting DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as city_id,
    c.name_en,
    c.name_ru,
    c.name_kz,
    COUNT(gs.id) as total_green_spaces,
    COUNT(*) FILTER (WHERE gs.status = 'alive') as alive_count,
    COUNT(*) FILTER (WHERE gs.status = 'attention_needed') as attention_needed_count,
    COUNT(*) FILTER (WHERE gs.status = 'dead') as dead_count,
    COUNT(*) FILTER (WHERE gs.status = 'removed') as removed_count,
    COUNT(*) FILTER (WHERE gs.type = 'tree') as tree_count,
    COUNT(*) FILTER (WHERE gs.type = 'park') as park_count,
    COUNT(DISTINCT gs.species_ru) as unique_species_count,
    ROUND(
      (COUNT(*) FILTER (WHERE gs.status = 'alive')::NUMERIC / NULLIF(COUNT(gs.id), 0)) * 100,
      2
    ) as survival_rate,
    MIN(gs.planting_date) as earliest_planting,
    MAX(gs.planting_date) as latest_planting
  FROM cities c
  LEFT JOIN green_spaces gs ON c.id = gs.city_id
  WHERE c.id = p_city_id
  GROUP BY c.id, c.name_en, c.name_ru, c.name_kz;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get species distribution
CREATE OR REPLACE FUNCTION get_species_distribution(p_city_id UUID DEFAULT NULL, p_limit INT DEFAULT 20)
RETURNS TABLE(
  species_ru VARCHAR,
  species_en VARCHAR,
  count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH species_counts AS (
    SELECT
      gs.species_ru,
      gs.species_en,
      COUNT(*) as count,
      COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100 as percentage
    FROM green_spaces gs
    WHERE (p_city_id IS NULL OR gs.city_id = p_city_id)
      AND gs.species_ru IS NOT NULL
    GROUP BY gs.species_ru, gs.species_en
    ORDER BY count DESC
    LIMIT p_limit
  )
  SELECT * FROM species_counts;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- GALLERY FUNCTIONS (Eliminate N+1 queries)
-- =====================================================

-- Get gallery photos with full green space data in single query
CREATE OR REPLACE FUNCTION get_gallery_photos(
  p_city_id UUID DEFAULT NULL,
  p_district_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  photo_id UUID,
  photo_url VARCHAR,
  uploaded_at TIMESTAMPTZ,
  green_space_data JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as photo_id,
    p.url as photo_url,
    p.uploaded_at,
    jsonb_build_object(
      'id', gs.id,
      'species_ru', gs.species_ru,
      'species_en', gs.species_en,
      'species_kz', gs.species_kz,
      'type', gs.type,
      'status', gs.status,
      'planting_date', gs.planting_date,
      'latitude', gs.latitude,
      'longitude', gs.longitude,
      'city', jsonb_build_object(
        'id', c.id,
        'name_en', c.name_en,
        'name_ru', c.name_ru,
        'name_kz', c.name_kz
      ),
      'district', CASE
        WHEN d.id IS NOT NULL THEN jsonb_build_object(
          'id', d.id,
          'name_en', d.name_en,
          'name_ru', d.name_ru,
          'name_kz', d.name_kz
        )
        ELSE NULL
      END
    ) as green_space_data,
    COUNT(*) OVER() as total_count
  FROM photos p
  INNER JOIN green_spaces gs ON p.green_space_id = gs.id
  LEFT JOIN cities c ON gs.city_id = c.id
  LEFT JOIN districts d ON gs.district_id = d.id
  WHERE
    (p_city_id IS NULL OR gs.city_id = p_city_id) AND
    (p_district_id IS NULL OR gs.district_id = p_district_id) AND
    (p_type IS NULL OR gs.type::TEXT = p_type) AND
    (p_year IS NULL OR EXTRACT(YEAR FROM gs.planting_date) = p_year)
  ORDER BY p.uploaded_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ADOPTIONS FUNCTIONS (Optimize with single query)
-- =====================================================

-- Get user adoptions with full green space data
CREATE OR REPLACE FUNCTION get_user_adoptions(
  p_user_id UUID,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  adoption_id UUID,
  adoption_date DATE,
  notes TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  green_space_data JSONB,
  latest_photo_url VARCHAR,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ta.id as adoption_id,
    ta.adoption_date,
    ta.notes,
    ta.is_active,
    ta.created_at,
    jsonb_build_object(
      'id', gs.id,
      'species_ru', gs.species_ru,
      'species_en', gs.species_en,
      'species_kz', gs.species_kz,
      'type', gs.type,
      'status', gs.status,
      'planting_date', gs.planting_date,
      'latitude', gs.latitude,
      'longitude', gs.longitude,
      'city', jsonb_build_object(
        'id', c.id,
        'name_en', c.name_en,
        'name_ru', c.name_ru
      ),
      'district', CASE
        WHEN d.id IS NOT NULL THEN jsonb_build_object(
          'id', d.id,
          'name_en', d.name_en,
          'name_ru', d.name_ru
        )
        ELSE NULL
      END
    ) as green_space_data,
    (
      SELECT url FROM photos
      WHERE green_space_id = gs.id
      ORDER BY uploaded_at DESC
      LIMIT 1
    ) as latest_photo_url,
    COUNT(*) OVER() as total_count
  FROM tree_adoptions ta
  INNER JOIN green_spaces gs ON ta.green_space_id = gs.id
  LEFT JOIN cities c ON gs.city_id = c.id
  LEFT JOIN districts d ON gs.district_id = d.id
  WHERE
    ta.user_id = p_user_id AND
    (p_is_active IS NULL OR ta.is_active = p_is_active)
  ORDER BY ta.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- CITIZEN REPORTS FUNCTIONS
-- =====================================================

-- Get citizen reports with full data
CREATE OR REPLACE FUNCTION get_citizen_reports(
  p_user_id UUID DEFAULT NULL,
  p_city_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  report_id UUID,
  report_type TEXT,
  description TEXT,
  status TEXT,
  reporter_name VARCHAR,
  reporter_email VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  admin_response TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  city_data JSONB,
  photos JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cr.id as report_id,
    cr.report_type::TEXT,
    cr.description,
    cr.status::TEXT,
    cr.reporter_name,
    cr.reporter_email,
    ST_Y(cr.location::geometry) as latitude,
    ST_X(cr.location::geometry) as longitude,
    cr.admin_response,
    cr.resolved_by,
    cr.resolved_at,
    cr.created_at,
    CASE
      WHEN c.id IS NOT NULL THEN jsonb_build_object(
        'id', c.id,
        'name_en', c.name_en,
        'name_ru', c.name_ru
      )
      ELSE NULL
    END as city_data,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('url', rp.url))
        FROM report_photos rp
        WHERE rp.report_id = cr.id
      ),
      '[]'::jsonb
    ) as photos,
    COUNT(*) OVER() as total_count
  FROM citizen_reports cr
  LEFT JOIN cities c ON cr.city_id = c.id
  WHERE
    (p_user_id IS NULL OR cr.reporter_id = p_user_id) AND
    (p_city_id IS NULL OR cr.city_id = p_city_id) AND
    (p_status IS NULL OR cr.status::TEXT = p_status)
  ORDER BY cr.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- MATERIALIZED VIEW FOR DASHBOARD
-- =====================================================

-- Create materialized view for frequently accessed city statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_city_statistics AS
SELECT
  c.id as city_id,
  c.name_en,
  c.name_ru,
  c.name_kz,
  COUNT(gs.id) as total_green_spaces,
  COUNT(*) FILTER (WHERE gs.status = 'alive') as alive_count,
  COUNT(*) FILTER (WHERE gs.status = 'attention_needed') as attention_needed_count,
  COUNT(*) FILTER (WHERE gs.status = 'dead') as dead_count,
  COUNT(*) FILTER (WHERE gs.status = 'removed') as removed_count,
  COUNT(*) FILTER (WHERE gs.type = 'tree') as tree_count,
  COUNT(*) FILTER (WHERE gs.type = 'park') as park_count,
  COUNT(*) FILTER (WHERE gs.type = 'alley') as alley_count,
  COUNT(*) FILTER (WHERE gs.type = 'garden') as garden_count,
  COUNT(DISTINCT gs.species_ru) as unique_species_count,
  ROUND(
    (COUNT(*) FILTER (WHERE gs.status = 'alive')::NUMERIC / NULLIF(COUNT(gs.id), 0)) * 100,
    2
  ) as survival_rate,
  MIN(gs.planting_date) as earliest_planting,
  MAX(gs.planting_date) as latest_planting,
  NOW() as last_updated
FROM cities c
LEFT JOIN green_spaces gs ON c.id = gs.city_id
GROUP BY c.id, c.name_en, c.name_ru, c.name_kz;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_statistics_city_id
  ON mv_city_statistics(city_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_city_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_city_statistics;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger to auto-refresh on data changes
-- (Be careful with this on high-traffic systems - may prefer scheduled refresh)
/*
CREATE OR REPLACE FUNCTION trigger_refresh_city_statistics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_city_statistics();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_on_greenspace_change
  AFTER INSERT OR UPDATE OR DELETE ON green_spaces
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_city_statistics();
*/

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get green spaces with full relationships in single query
CREATE OR REPLACE FUNCTION get_green_spaces_with_relations(
  p_city_id UUID DEFAULT NULL,
  p_district_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  green_space_id UUID,
  species_ru VARCHAR,
  species_en VARCHAR,
  species_kz VARCHAR,
  species_scientific VARCHAR,
  type TEXT,
  status TEXT,
  planting_date DATE,
  latitude DECIMAL,
  longitude DECIMAL,
  notes TEXT,
  responsible_org VARCHAR,
  city_data JSONB,
  district_data JSONB,
  photos_count BIGINT,
  latest_photo_url VARCHAR,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.id as green_space_id,
    gs.species_ru,
    gs.species_en,
    gs.species_kz,
    gs.species_scientific,
    gs.type::TEXT,
    gs.status::TEXT,
    gs.planting_date,
    gs.latitude,
    gs.longitude,
    gs.notes,
    gs.responsible_org,
    jsonb_build_object(
      'id', c.id,
      'name_en', c.name_en,
      'name_ru', c.name_ru,
      'name_kz', c.name_kz
    ) as city_data,
    CASE
      WHEN d.id IS NOT NULL THEN jsonb_build_object(
        'id', d.id,
        'name_en', d.name_en,
        'name_ru', d.name_ru
      )
      ELSE NULL
    END as district_data,
    (SELECT COUNT(*) FROM photos WHERE green_space_id = gs.id) as photos_count,
    (SELECT url FROM photos WHERE green_space_id = gs.id ORDER BY uploaded_at DESC LIMIT 1) as latest_photo_url,
    COUNT(*) OVER() as total_count
  FROM green_spaces gs
  LEFT JOIN cities c ON gs.city_id = c.id
  LEFT JOIN districts d ON gs.district_id = d.id
  WHERE
    (p_city_id IS NULL OR gs.city_id = p_city_id) AND
    (p_district_id IS NULL OR gs.district_id = p_district_id) AND
    (p_status IS NULL OR gs.status::TEXT = p_status) AND
    (p_type IS NULL OR gs.type::TEXT = p_type)
  ORDER BY gs.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PERFORMANCE TESTING
-- =====================================================

-- Test function performance:
-- SELECT * FROM get_overview_stats();
-- SELECT * FROM get_city_stats('city-uuid-here');
-- SELECT * FROM get_species_distribution();
-- SELECT * FROM get_gallery_photos();
-- SELECT * FROM mv_city_statistics;

-- =====================================================
-- CLEANUP (Rollback)
-- =====================================================

-- To remove all functions and views:
/*
DROP FUNCTION IF EXISTS get_overview_stats(UUID);
DROP FUNCTION IF EXISTS get_city_stats(UUID);
DROP FUNCTION IF EXISTS get_species_distribution(UUID, INT);
DROP FUNCTION IF EXISTS get_gallery_photos(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_user_adoptions(UUID, BOOLEAN, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_citizen_reports(UUID, UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS refresh_city_statistics();
DROP FUNCTION IF EXISTS get_green_spaces_with_relations(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER);
DROP MATERIALIZED VIEW IF EXISTS mv_city_statistics;
*/
