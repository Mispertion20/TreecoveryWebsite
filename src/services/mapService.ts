import { createClient } from '@supabase/supabase-js';
import type { GreenSpace, City } from '../types/greenSpaces';

// Re-export types for convenience
export type { City, GreenSpace };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  );
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface GreenSpaceWithCity extends GreenSpace {
  city?: City;
  district?: {
    id: string;
    name_ru: string;
    name_kz: string;
    name_en: string;
  } | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Fetch all cities
 */
export async function fetchCities(): Promise<City[]> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name_en');

  if (error) {
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch green spaces within map bounds
 */
export async function fetchGreenSpaces(bounds?: MapBounds): Promise<GreenSpaceWithCity[]> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  let query = supabase
    .from('green_spaces')
    .select(`
      *,
      city:cities(*),
      district:districts(id, name_ru, name_kz, name_en)
    `);

  // If bounds are provided, filter by geographic bounds
  // Note: This is a simplified approach. For production, you'd want to use PostGIS spatial queries
  if (bounds) {
    query = query
      .gte('latitude', bounds.south)
      .lte('latitude', bounds.north)
      .gte('longitude', bounds.west)
      .lte('longitude', bounds.east);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch green spaces: ${error.message}`);
  }

  return (data || []) as GreenSpaceWithCity[];
}

/**
 * Fetch green spaces by city ID
 */
export async function fetchGreenSpacesByCity(cityId: string): Promise<GreenSpaceWithCity[]> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('green_spaces')
    .select(`
      *,
      city:cities(*),
      district:districts(id, name_ru, name_kz, name_en)
    `)
    .eq('city_id', cityId);

  if (error) {
    throw new Error(`Failed to fetch green spaces for city: ${error.message}`);
  }

  return (data || []) as GreenSpaceWithCity[];
}

/**
 * Fetch a single green space by ID
 */
export async function fetchGreenSpaceById(id: string): Promise<GreenSpaceWithCity | null> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('green_spaces')
    .select(`
      *,
      city:cities(*),
      district:districts(id, name_ru, name_kz, name_en)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch green space: ${error.message}`);
  }

  return data as GreenSpaceWithCity;
}

/**
 * Get status color for a green space marker
 */
export function getStatusColor(status: GreenSpace['status']): string {
  switch (status) {
    case 'alive':
      return '#22c55e'; // green
    case 'attention_needed':
      return '#eab308'; // yellow
    case 'dead':
      return '#ef4444'; // red
    case 'removed':
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: GreenSpace['status']): string {
  switch (status) {
    case 'alive':
      return 'Alive';
    case 'attention_needed':
      return 'Attention Needed';
    case 'dead':
      return 'Dead';
    case 'removed':
      return 'Removed';
    default:
      return 'Unknown';
  }
}

