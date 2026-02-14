// Frontend type definitions for green spaces
// These match the backend types but are defined here for frontend use

export type GreenSpaceType = 'tree' | 'park' | 'alley' | 'garden';
export type GreenSpaceStatus = 'alive' | 'attention_needed' | 'dead' | 'removed';

export interface City {
  id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
  center_lat: number;
  center_lng: number;
  created_at: Date | string;
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
  planting_date: Date | string;
  status: GreenSpaceStatus;
  notes: string | null;
  responsible_org: string | null;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
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
  planting_date: Date | string;
  status?: GreenSpaceStatus;
  notes?: string | null;
  responsible_org?: string | null;
  created_by: string;
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
  planting_date?: Date | string;
  status?: GreenSpaceStatus;
  notes?: string | null;
  responsible_org?: string | null;
}

