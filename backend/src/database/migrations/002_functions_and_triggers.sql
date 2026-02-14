-- Migration: 002_functions_and_triggers.sql
-- Description: Database functions and triggers for automatic updates and audit logging
-- Created: 2025-01-XX

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_green_spaces_updated_at ON green_spaces;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_green_spaces_updated_at 
    BEFORE UPDATE ON green_spaces
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set location from latitude/longitude
CREATE OR REPLACE FUNCTION set_green_space_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_green_space_location_trigger ON green_spaces;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS green_spaces_audit_trigger ON green_spaces;

-- Create trigger for audit logging
CREATE TRIGGER green_spaces_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON green_spaces
    FOR EACH ROW
    EXECUTE FUNCTION log_green_space_changes();

