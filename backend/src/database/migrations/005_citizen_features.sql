-- Migration: 005_citizen_features.sql
-- Description: Add tables for citizen reporting, tree adoptions, comments, and gallery features
-- Created: 2025-01-XX

-- Create ENUM types for new features
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'under_review', 'resolved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('dead_tree', 'damaged_tree', 'missing_tree', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Citizen Reports table
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_email VARCHAR(255),
    reporter_name VARCHAR(255),
    report_type report_type NOT NULL,
    description TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    green_space_id UUID REFERENCES green_spaces(id) ON DELETE SET NULL,
    status report_status NOT NULL DEFAULT 'pending',
    admin_response TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure coordinates match PostGIS location
    CONSTRAINT check_report_coordinates_match CHECK (
        ST_X(location::geometry) = longitude AND 
        ST_Y(location::geometry) = latitude
    )
);

-- Report Photos table
CREATE TABLE IF NOT EXISTS report_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES citizen_reports(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tree Adoptions table
CREATE TABLE IF NOT EXISTS tree_adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    adoption_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- One user can only adopt a tree once
    UNIQUE(user_id, green_space_id)
);

-- Comments table (for green space detail pages)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Badges table (for gamification)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, badge_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_citizen_reports_reporter_id ON citizen_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_city_id ON citizen_reports(city_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_green_space_id ON citizen_reports(green_space_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON citizen_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON report_photos(report_id);

CREATE INDEX IF NOT EXISTS idx_tree_adoptions_user_id ON tree_adoptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_adoptions_green_space_id ON tree_adoptions(green_space_id);
CREATE INDEX IF NOT EXISTS idx_tree_adoptions_is_active ON tree_adoptions(is_active);

CREATE INDEX IF NOT EXISTS idx_comments_green_space_id ON comments(green_space_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);

