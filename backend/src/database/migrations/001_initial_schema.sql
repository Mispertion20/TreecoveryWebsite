-- Migration: 001_initial_schema.sql
-- Description: Initial database schema with PostGIS extension and all core tables
-- Created: 2025-01-XX

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE green_space_type AS ENUM ('tree', 'park', 'alley', 'garden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE green_space_status AS ENUM ('alive', 'attention_needed', 'dead', 'removed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'status_changed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Cities table (created first as it's referenced by other tables)
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ru VARCHAR(255) NOT NULL,
    name_kz VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name_ru VARCHAR(255) NOT NULL,
    name_kz VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Green Spaces table (main table)
CREATE TABLE IF NOT EXISTS green_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type green_space_type NOT NULL,
    species_ru VARCHAR(255) NOT NULL,
    species_kz VARCHAR(255),
    species_en VARCHAR(255),
    species_scientific VARCHAR(255),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    planting_date DATE NOT NULL,
    status green_space_status NOT NULL DEFAULT 'alive',
    notes TEXT,
    responsible_org VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure coordinates match PostGIS location
    CONSTRAINT check_coordinates_match CHECK (
        ST_X(location::geometry) = longitude AND 
        ST_Y(location::geometry) = latitude
    ),
    
    -- Ensure planting date is not in the future
    CONSTRAINT check_planting_date CHECK (planting_date <= CURRENT_DATE)
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action audit_action NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city_id ON users(city_id);

CREATE INDEX IF NOT EXISTS idx_cities_name_en ON cities(name_en);
CREATE INDEX IF NOT EXISTS idx_cities_center_location ON cities USING GIST((ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography));

CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);

CREATE INDEX IF NOT EXISTS idx_green_spaces_city_id ON green_spaces(city_id);
CREATE INDEX IF NOT EXISTS idx_green_spaces_district_id ON green_spaces(district_id);
CREATE INDEX IF NOT EXISTS idx_green_spaces_status ON green_spaces(status);
CREATE INDEX IF NOT EXISTS idx_green_spaces_planting_date ON green_spaces(planting_date);
CREATE INDEX IF NOT EXISTS idx_green_spaces_type ON green_spaces(type);
CREATE INDEX IF NOT EXISTS idx_green_spaces_location ON green_spaces USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_green_spaces_created_by ON green_spaces(created_by);

CREATE INDEX IF NOT EXISTS idx_photos_green_space_id ON photos(green_space_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_green_space_id ON audit_log(green_space_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

