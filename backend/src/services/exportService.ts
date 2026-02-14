import { supabaseAdmin } from '../config/supabase';
import { GreenSpaceFilters } from '../types/database';
import { JWTPayload } from '../utils/jwt';

export interface ExportOptions {
  filters: GreenSpaceFilters;
  format: 'csv' | 'excel';
}

/**
 * Generate CSV from green spaces data
 */
export async function generateCSV(filters: GreenSpaceFilters, user?: JWTPayload): Promise<string> {
  // Build query with same filters as GET endpoint
  let query = supabaseAdmin
    .from('green_spaces')
    .select(`
      *,
      city:cities(name_ru, name_kz, name_en),
      district:districts(name_ru, name_kz, name_en)
    `);

  // Apply filters (same logic as green-spaces route)
  if (filters.city_id) {
    query = query.eq('city_id', filters.city_id);
  }

  if (filters.district_id) {
    query = query.eq('district_id', filters.district_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.species_ru) {
    query = query.ilike('species_ru', `%${filters.species_ru}%`);
  }

  if (filters.planting_date_from) {
    query = query.gte('planting_date', filters.planting_date_from);
  }

  if (filters.planting_date_to) {
    query = query.lte('planting_date', filters.planting_date_to);
  }

  if (filters.year) {
    const yearStart = `${filters.year}-01-01`;
    const yearEnd = `${filters.year}-12-31`;
    query = query.gte('planting_date', yearStart).lte('planting_date', yearEnd);
  }

  if (filters.search) {
    query = query.or(
      `species_ru.ilike.%${filters.search}%,species_en.ilike.%${filters.search}%,species_kz.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  // City access control for admins (same as green-spaces route)
  if (user?.role === 'admin' && user.cityId) {
    query = query.eq('city_id', user.cityId);
  }

  // Remove pagination for export - get all matching records
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch green spaces: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return ''; // Return empty CSV if no data
  }

  // Transform data for CSV
  const csvData = data.map((item: any) => ({
    id: item.id,
    type: item.type,
    species_ru: item.species_ru || '',
    species_kz: item.species_kz || '',
    species_en: item.species_en || '',
    species_scientific: item.species_scientific || '',
    latitude: item.latitude,
    longitude: item.longitude,
    city_name_ru: item.city?.name_ru || '',
    city_name_kz: item.city?.name_kz || '',
    city_name_en: item.city?.name_en || '',
    district_name_ru: item.district?.name_ru || '',
    district_name_kz: item.district?.name_kz || '',
    district_name_en: item.district?.name_en || '',
    planting_date: item.planting_date || '',
    status: item.status || '',
    notes: item.notes || '',
    responsible_org: item.responsible_org || '',
    created_at: item.created_at || '',
  }));

  // Define CSV headers
  const headers = [
    { id: 'id', title: 'ID' },
    { id: 'type', title: 'Type' },
    { id: 'species_ru', title: 'Species (RU)' },
    { id: 'species_kz', title: 'Species (KZ)' },
    { id: 'species_en', title: 'Species (EN)' },
    { id: 'species_scientific', title: 'Species (Scientific)' },
    { id: 'latitude', title: 'Latitude' },
    { id: 'longitude', title: 'Longitude' },
    { id: 'city_name_ru', title: 'City (RU)' },
    { id: 'city_name_kz', title: 'City (KZ)' },
    { id: 'city_name_en', title: 'City (EN)' },
    { id: 'district_name_ru', title: 'District (RU)' },
    { id: 'district_name_kz', title: 'District (KZ)' },
    { id: 'district_name_en', title: 'District (EN)' },
    { id: 'planting_date', title: 'Planting Date' },
    { id: 'status', title: 'Status' },
    { id: 'notes', title: 'Notes' },
    { id: 'responsible_org', title: 'Responsible Organization' },
    { id: 'created_at', title: 'Created At' },
  ];

  // Generate CSV string manually (csv-writer is mainly for file writing)
  // Escape CSV values properly
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const headerRow = headers.map(h => escapeCSV(h.title)).join(',');
  const dataRows = csvData.map(row => 
    headers.map(h => escapeCSV(row[h.id as keyof typeof row])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Generate filename based on filters
 */
export function generateFilename(filters: GreenSpaceFilters, format: 'csv' | 'excel'): string {
  const parts: string[] = ['green-spaces'];
  const date = new Date().toISOString().split('T')[0];

  if (filters.city_id) {
    parts.push('city');
  }
  if (filters.district_id) {
    parts.push('district');
  }
  if (filters.status) {
    parts.push(filters.status);
  }
  if (filters.type) {
    parts.push(filters.type);
  }
  if (filters.year) {
    parts.push(`year-${filters.year}`);
  }

  const extension = format === 'csv' ? 'csv' : 'xlsx';
  return `${parts.join('-')}-${date}.${extension}`;
}

