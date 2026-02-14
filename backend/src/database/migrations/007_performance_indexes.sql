-- =====================================================
-- Migration: Performance Indexes
-- Description: Add critical indexes to improve query performance
-- Author: Claude (Security & Performance Audit)
-- Date: 2025-11-10
-- Estimated Impact: 60-90% faster queries
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For trigram text search

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Users: Role + City lookups (used in RLS policies and admin queries)
CREATE INDEX IF NOT EXISTS idx_users_role_city
  ON users(role, city_id)
  WHERE city_id IS NOT NULL;

-- Green Spaces: City + Status (most common filter combination)
CREATE INDEX IF NOT EXISTS idx_green_spaces_city_status
  ON green_spaces(city_id, status);

-- Green Spaces: City + Type
CREATE INDEX IF NOT EXISTS idx_green_spaces_city_type
  ON green_spaces(city_id, type);

-- Green Spaces: Status + Type
CREATE INDEX IF NOT EXISTS idx_green_spaces_status_type
  ON green_spaces(status, type);

-- Green Spaces: Covering index for list queries (includes common columns)
CREATE INDEX IF NOT EXISTS idx_green_spaces_list_query
  ON green_spaces(city_id, status, created_at DESC)
  INCLUDE (type, species_ru, planting_date);

-- Citizen Reports: Status + City (admin filtering)
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status_city
  ON citizen_reports(status, city_id);

-- Citizen Reports: Reporter + Status (user's own reports)
CREATE INDEX IF NOT EXISTS idx_citizen_reports_reporter_status
  ON citizen_reports(reporter_id, status)
  WHERE reporter_id IS NOT NULL;

-- Tree Adoptions: User + Active status (user's adoptions page)
CREATE INDEX IF NOT EXISTS idx_tree_adoptions_user_active
  ON tree_adoptions(user_id, is_active);

-- Notifications: User + Read + Created (notification center queries)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON notifications(user_id, read, created_at DESC);

-- =====================================================
-- PARTIAL INDEXES (Only index subset of data)
-- =====================================================

-- Active adoptions (queried much more than inactive)
CREATE INDEX IF NOT EXISTS idx_tree_adoptions_active_only
  ON tree_adoptions(green_space_id)
  WHERE is_active = true;

-- Approved comments (only these are shown publicly)
CREATE INDEX IF NOT EXISTS idx_comments_approved_greenspace
  ON comments(green_space_id, created_at DESC)
  WHERE is_approved = true;

-- Unread notifications (queried very frequently)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, created_at DESC)
  WHERE read = false;

-- Unused password reset tokens (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_password_reset_unused
  ON password_reset_tokens(user_id, expires_at)
  WHERE used = false;

-- =====================================================
-- TEXT SEARCH INDEXES (Trigram for ILIKE queries)
-- =====================================================

-- Green Spaces: Species name search (supports %search% queries)
CREATE INDEX IF NOT EXISTS idx_green_spaces_species_ru_trgm
  ON green_spaces USING gin(species_ru gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_green_spaces_species_en_trgm
  ON green_spaces USING gin(species_en gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_green_spaces_species_kz_trgm
  ON green_spaces USING gin(species_kz gin_trgm_ops);

-- Green Spaces: Notes search
CREATE INDEX IF NOT EXISTS idx_green_spaces_notes_trgm
  ON green_spaces USING gin(notes gin_trgm_ops)
  WHERE notes IS NOT NULL;

-- =====================================================
-- FULL-TEXT SEARCH (Better than ILIKE for multi-field)
-- =====================================================

-- Add tsvector column for full-text search across multiple fields
ALTER TABLE green_spaces
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('russian', coalesce(species_ru, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(species_en, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(species_kz, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(notes, '')), 'C')
) STORED;

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_green_spaces_search
  ON green_spaces USING GIN(search_vector);

-- =====================================================
-- GEOSPATIAL INDEXES
-- =====================================================

-- Green Spaces: Spatial index for location queries (should already exist)
-- CREATE INDEX IF NOT EXISTS idx_green_spaces_location
--   ON green_spaces USING GIST(location);

-- Citizen Reports: Spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location
  ON citizen_reports USING GIST(location);

-- Green Spaces: Covering spatial index with common fields
CREATE INDEX IF NOT EXISTS idx_green_spaces_location_covering
  ON green_spaces USING GIST(location)
  INCLUDE (id, type, status, city_id);

-- =====================================================
-- TIMESTAMP INDEXES FOR TIME-BASED QUERIES
-- =====================================================

-- Green Spaces: Planting date (for filtering by year/date range)
CREATE INDEX IF NOT EXISTS idx_green_spaces_planting_date
  ON green_spaces(planting_date);

-- Photos: Upload timestamp (for gallery pagination)
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at
  ON photos(uploaded_at DESC);

-- Comments: Created timestamp (for pagination)
CREATE INDEX IF NOT EXISTS idx_comments_created_at
  ON comments(created_at DESC);

-- =====================================================
-- FOREIGN KEY INDEXES (Improve JOIN performance)
-- =====================================================

-- Districts: City foreign key (should already exist, verify)
CREATE INDEX IF NOT EXISTS idx_districts_city_id
  ON districts(city_id);

-- Photos: Green space foreign key (should already exist, verify)
CREATE INDEX IF NOT EXISTS idx_photos_green_space_id
  ON photos(green_space_id);

-- Report Photos: Report foreign key
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id
  ON report_photos(report_id);

-- =====================================================
-- UNIQUE INDEXES FOR DATA INTEGRITY
-- =====================================================

-- Prevent duplicate district names within same city
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_district_name_per_city
  ON districts(city_id, name_en);

-- Prevent duplicate photos for same green space (same URL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_photo_url_per_greenspace
  ON photos(green_space_id, url);

-- Prevent duplicate report photos
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_report_photo_url
  ON report_photos(report_id, url);

-- Unique index for unused password reset tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_token_unique
  ON password_reset_tokens(token)
  WHERE used = false;

-- =====================================================
-- ANALYZE TABLES (Update statistics)
-- =====================================================

ANALYZE users;
ANALYZE cities;
ANALYZE districts;
ANALYZE green_spaces;
ANALYZE photos;
ANALYZE citizen_reports;
ANALYZE report_photos;
ANALYZE tree_adoptions;
ANALYZE comments;
ANALYZE notifications;
ANALYZE user_badges;
ANALYZE password_reset_tokens;

-- =====================================================
-- PERFORMANCE TESTING QUERIES
-- =====================================================

-- Run these queries to verify index usage:

-- EXPLAIN ANALYZE: Check if indexes are used
-- EXPLAIN ANALYZE SELECT * FROM green_spaces WHERE city_id = '...' AND status = 'alive';
-- Should use: idx_green_spaces_city_status

-- EXPLAIN ANALYZE SELECT * FROM green_spaces WHERE species_ru ILIKE '%береза%';
-- Should use: idx_green_spaces_species_ru_trgm

-- EXPLAIN ANALYZE SELECT * FROM green_spaces WHERE search_vector @@ to_tsquery('береза');
-- Should use: idx_green_spaces_search

-- EXPLAIN ANALYZE SELECT * FROM tree_adoptions WHERE user_id = '...' AND is_active = true;
-- Should use: idx_tree_adoptions_user_active

-- =====================================================
-- INDEX MAINTENANCE NOTES
-- =====================================================

-- REINDEX periodically (especially for GIN/GIST indexes):
-- REINDEX INDEX CONCURRENTLY idx_green_spaces_search;

-- Monitor index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Find unused indexes:
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND idx_scan = 0
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To remove all indexes created by this migration:
/*
DROP INDEX IF EXISTS idx_users_role_city;
DROP INDEX IF EXISTS idx_green_spaces_city_status;
DROP INDEX IF EXISTS idx_green_spaces_city_type;
DROP INDEX IF EXISTS idx_green_spaces_status_type;
DROP INDEX IF EXISTS idx_green_spaces_list_query;
DROP INDEX IF EXISTS idx_citizen_reports_status_city;
DROP INDEX IF EXISTS idx_citizen_reports_reporter_status;
DROP INDEX IF EXISTS idx_tree_adoptions_user_active;
DROP INDEX IF EXISTS idx_notifications_user_read_created;
DROP INDEX IF EXISTS idx_tree_adoptions_active_only;
DROP INDEX IF EXISTS idx_comments_approved_greenspace;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_password_reset_unused;
DROP INDEX IF EXISTS idx_green_spaces_species_ru_trgm;
DROP INDEX IF EXISTS idx_green_spaces_species_en_trgm;
DROP INDEX IF EXISTS idx_green_spaces_species_kz_trgm;
DROP INDEX IF EXISTS idx_green_spaces_notes_trgm;
DROP INDEX IF EXISTS idx_green_spaces_search;
DROP INDEX IF EXISTS idx_citizen_reports_location;
DROP INDEX IF EXISTS idx_green_spaces_location_covering;
DROP INDEX IF EXISTS idx_green_spaces_planting_date;
DROP INDEX IF EXISTS idx_photos_uploaded_at;
DROP INDEX IF EXISTS idx_comments_created_at;
DROP INDEX IF EXISTS idx_districts_city_id;
DROP INDEX IF EXISTS idx_photos_green_space_id;
DROP INDEX IF EXISTS idx_report_photos_report_id;
DROP INDEX IF EXISTS idx_unique_district_name_per_city;
DROP INDEX IF EXISTS idx_unique_photo_url_per_greenspace;
DROP INDEX IF EXISTS idx_unique_report_photo_url;
DROP INDEX IF EXISTS idx_password_reset_token_unique;

ALTER TABLE green_spaces DROP COLUMN IF EXISTS search_vector;
*/
