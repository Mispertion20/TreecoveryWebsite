-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin', 'super_admin');
CREATE TYPE green_space_type AS ENUM ('tree', 'park', 'alley', 'garden');
CREATE TYPE green_space_status AS ENUM ('alive', 'attention_needed', 'dead', 'removed');
CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'status_changed');

-- Cities table (created first as it's referenced by other tables)
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ru VARCHAR(255) NOT NULL,
    name_kz VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name_ru VARCHAR(255) NOT NULL,
    name_kz VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Green Spaces table (main table)
CREATE TABLE green_spaces (
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
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    green_space_id UUID NOT NULL REFERENCES green_spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action audit_action NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city_id ON users(city_id);

CREATE INDEX idx_cities_name_en ON cities(name_en);
CREATE INDEX idx_cities_center_location ON cities USING GIST(
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
);

CREATE INDEX idx_districts_city_id ON districts(city_id);

CREATE INDEX idx_green_spaces_city_id ON green_spaces(city_id);
CREATE INDEX idx_green_spaces_district_id ON green_spaces(district_id);
CREATE INDEX idx_green_spaces_status ON green_spaces(status);
CREATE INDEX idx_green_spaces_planting_date ON green_spaces(planting_date);
CREATE INDEX idx_green_spaces_type ON green_spaces(type);
CREATE INDEX idx_green_spaces_location ON green_spaces USING GIST(location);
CREATE INDEX idx_green_spaces_created_by ON green_spaces(created_by);

CREATE INDEX idx_photos_green_space_id ON photos(green_space_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);

CREATE INDEX idx_audit_log_green_space_id ON audit_log(green_space_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_green_spaces_updated_at BEFORE UPDATE ON green_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set location from latitude/longitude
CREATE OR REPLACE FUNCTION set_green_space_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to set location automatically
CREATE TRIGGER set_green_space_location_trigger
    BEFORE INSERT OR UPDATE OF latitude, longitude ON green_spaces
    FOR EACH ROW
    EXECUTE FUNCTION set_green_space_location();

-- Create function to log changes to audit_log
CREATE OR REPLACE FUNCTION log_green_space_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (green_space_id, user_id, action, new_value)
        VALUES (NEW.id, NEW.created_by, 'created', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if status changed
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO audit_log (green_space_id, user_id, action, old_value, new_value)
            VALUES (NEW.id, NEW.created_by, 'status_changed', 
                    jsonb_build_object('status', OLD.status),
                    jsonb_build_object('status', NEW.status));
        ELSE
            INSERT INTO audit_log (green_space_id, user_id, action, old_value, new_value)
            VALUES (NEW.id, NEW.created_by, 'updated', row_to_json(OLD), row_to_json(NEW));
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (green_space_id, user_id, action, old_value)
        VALUES (OLD.id, OLD.created_by, 'deleted', row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for audit logging
CREATE TRIGGER green_spaces_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON green_spaces
    FOR EACH ROW
    EXECUTE FUNCTION log_green_space_changes();

