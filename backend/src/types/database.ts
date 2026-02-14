// Database type definitions matching the PostgreSQL schema

export type UserRole = 'guest' | 'user' | 'admin' | 'super_admin';
export type GreenSpaceType = 'tree' | 'park' | 'alley' | 'garden';
export type GreenSpaceStatus = 'alive' | 'attention_needed' | 'dead' | 'removed';
export type AuditAction = 'created' | 'updated' | 'deleted' | 'status_changed';
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';
export type ReportType = 'dead_tree' | 'damaged_tree' | 'missing_tree' | 'other';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  city_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface City {
  id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
  center_lat: number;
  center_lng: number;
  created_at: Date;
}

export interface District {
  id: string;
  city_id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
  created_at: Date;
}

export interface GreenSpace {
  id: string;
  type: GreenSpaceType;
  species_ru: string;
  species_kz: string | null;
  species_en: string | null;
  species_scientific: string | null;
  location: string; // PostGIS geography point (stored as text)
  latitude: number;
  longitude: number;
  city_id: string;
  district_id: string | null;
  planting_date: Date;
  status: GreenSpaceStatus;
  notes: string | null;
  responsible_org: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Photo {
  id: string;
  green_space_id: string;
  url: string;
  uploaded_by: string;
  uploaded_at: Date;
}

export interface AuditLog {
  id: string;
  green_space_id: string;
  user_id: string;
  action: AuditAction;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  timestamp: Date;
}

// Database insert types (without auto-generated fields)
export interface UserInsert {
  email: string;
  password_hash: string;
  role?: UserRole;
  city_id?: string | null;
}

export interface CityInsert {
  name_ru: string;
  name_kz: string;
  name_en: string;
  center_lat: number;
  center_lng: number;
}

export interface DistrictInsert {
  city_id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
}

export interface GreenSpaceInsert {
  type: GreenSpaceType;
  species_ru: string;
  species_kz?: string | null;
  species_en?: string | null;
  species_scientific?: string | null;
  latitude: number;
  longitude: number;
  city_id: string;
  district_id?: string | null;
  planting_date: Date;
  status?: GreenSpaceStatus;
  notes?: string | null;
  responsible_org?: string | null;
  created_by: string;
}

export interface PhotoInsert {
  green_space_id: string;
  url: string;
  uploaded_by: string;
}

export interface AuditLogInsert {
  green_space_id: string;
  user_id: string;
  action: AuditAction;
  old_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
}

// Update types (all fields optional except id)
export interface UserUpdate {
  email?: string;
  password_hash?: string;
  role?: UserRole;
  city_id?: string | null;
}

export interface CityUpdate {
  name_ru?: string;
  name_kz?: string;
  name_en?: string;
  center_lat?: number;
  center_lng?: number;
}

export interface DistrictUpdate {
  city_id?: string;
  name_ru?: string;
  name_kz?: string;
  name_en?: string;
}

export interface GreenSpaceUpdate {
  type?: GreenSpaceType;
  species_ru?: string;
  species_kz?: string | null;
  species_en?: string | null;
  species_scientific?: string | null;
  latitude?: number;
  longitude?: number;
  city_id?: string;
  district_id?: string | null;
  planting_date?: Date;
  status?: GreenSpaceStatus;
  notes?: string | null;
  responsible_org?: string | null;
}

export interface PhotoUpdate {
  green_space_id?: string;
  url?: string;
}

// Extended types with relations
export interface GreenSpaceWithRelations extends GreenSpace {
  city?: City;
  district?: District | null;
  created_by_user?: User;
  photos?: Photo[];
}

export interface CityWithDistricts extends City {
  districts?: District[];
}

export interface DistrictWithCity extends District {
  city?: City;
}

// Filter types for queries
export interface GreenSpaceFilters {
  city_id?: string;
  district_id?: string;
  status?: GreenSpaceStatus;
  type?: GreenSpaceType;
  species_ru?: string;
  planting_date_from?: string;
  planting_date_to?: string;
  year?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Citizen Reports types
export interface CitizenReport {
  id: string;
  reporter_id: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  report_type: ReportType;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  city_id: string | null;
  district_id: string | null;
  green_space_id: string | null;
  status: ReportStatus;
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CitizenReportInsert {
  reporter_id?: string | null;
  reporter_email?: string | null;
  reporter_name?: string | null;
  report_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  city_id?: string | null;
  district_id?: string | null;
  green_space_id?: string | null;
}

export interface CitizenReportUpdate {
  status?: ReportStatus;
  admin_response?: string | null;
  resolved_by?: string | null;
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  url: string;
  uploaded_at: Date;
}

// Tree Adoption types
export interface TreeAdoption {
  id: string;
  user_id: string;
  green_space_id: string;
  adoption_date: Date;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface TreeAdoptionInsert {
  user_id: string;
  green_space_id: string;
  notes?: string | null;
}

// Comment types
export interface Comment {
  id: string;
  green_space_id: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommentInsert {
  green_space_id: string;
  user_id?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  content: string;
}

// User Badge types
export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  earned_at: Date;
}

