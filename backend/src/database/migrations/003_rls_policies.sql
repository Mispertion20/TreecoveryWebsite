-- Migration: 003_rls_policies.sql
-- Description: Row Level Security (RLS) policies for all tables
-- Created: 2025-01-XX

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role and city_id)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from changing their own role or city_id
        (role = (SELECT role FROM users WHERE id = auth.uid())) AND
        (city_id IS NULL OR city_id = (SELECT city_id FROM users WHERE id = auth.uid()))
    );

-- Super admins can view all users
CREATE POLICY "Super admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Super admins can insert/update/delete users
CREATE POLICY "Super admins can manage users"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- CITIES TABLE POLICIES
-- ============================================

-- Everyone can view cities (public read)
CREATE POLICY "Anyone can view cities"
    ON cities FOR SELECT
    USING (true);

-- Only super admins can insert/update/delete cities
CREATE POLICY "Super admins can manage cities"
    ON cities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- DISTRICTS TABLE POLICIES
-- ============================================

-- Everyone can view districts (public read)
CREATE POLICY "Anyone can view districts"
    ON districts FOR SELECT
    USING (true);

-- Super admins and city admins can manage districts
CREATE POLICY "Admins can manage districts"
    ON districts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND 
            (role = 'super_admin' OR 
             (role = 'admin' AND city_id = districts.city_id))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND 
            (role = 'super_admin' OR 
             (role = 'admin' AND city_id = districts.city_id))
        )
    );

-- ============================================
-- GREEN_SPACES TABLE POLICIES
-- ============================================

-- Everyone can view green spaces (public read)
CREATE POLICY "Anyone can view green spaces"
    ON green_spaces FOR SELECT
    USING (true);

-- Authenticated users (user, admin, super_admin) can insert green spaces
CREATE POLICY "Authenticated users can create green spaces"
    ON green_spaces FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('user', 'admin', 'super_admin')
        )
    );

-- Super admins can update any green space
CREATE POLICY "Super admins can update any green space"
    ON green_spaces FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- City admins can update green spaces in their city
CREATE POLICY "City admins can update green spaces in their city"
    ON green_spaces FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND 
            u.role = 'admin' AND 
            u.city_id = green_spaces.city_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND 
            u.role = 'admin' AND 
            u.city_id = green_spaces.city_id
        )
    );

-- Users can update green spaces they created
CREATE POLICY "Users can update own green spaces"
    ON green_spaces FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Super admins can delete any green space
CREATE POLICY "Super admins can delete any green space"
    ON green_spaces FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- City admins can delete green spaces in their city
CREATE POLICY "City admins can delete green spaces in their city"
    ON green_spaces FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND 
            u.role = 'admin' AND 
            u.city_id = green_spaces.city_id
        )
    );

-- ============================================
-- PHOTOS TABLE POLICIES
-- ============================================

-- Everyone can view photos (public read)
CREATE POLICY "Anyone can view photos"
    ON photos FOR SELECT
    USING (true);

-- Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload photos"
    ON photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('user', 'admin', 'super_admin')
        ) AND
        uploaded_by = auth.uid()
    );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
    ON photos FOR DELETE
    USING (uploaded_by = auth.uid());

-- Admins can delete photos for green spaces in their jurisdiction
CREATE POLICY "Admins can delete photos in their jurisdiction"
    ON photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN green_spaces gs ON gs.id = photos.green_space_id
            WHERE u.id = auth.uid() AND 
            (u.role = 'super_admin' OR 
             (u.role = 'admin' AND u.city_id = gs.city_id))
        )
    );

-- ============================================
-- AUDIT_LOG TABLE POLICIES
-- ============================================

-- Only admins and super admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- System can insert audit logs (handled by triggers, no policy needed)
-- No manual insert/update/delete allowed for audit_log

