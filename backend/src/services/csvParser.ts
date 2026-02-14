import Papa from 'papaparse';
import { GreenSpaceInsert, GreenSpaceType, GreenSpaceStatus } from '../types/database';

export interface CSVRow {
  latitude: string;
  longitude: string;
  species_ru: string;
  species_kz?: string;
  species_en?: string;
  species_scientific?: string;
  type?: string;
  city_id: string;
  district_id?: string;
  planting_date: string;
  status?: string;
  notes?: string;
  responsible_org?: string;
}

export interface ParsedGreenSpace {
  data: GreenSpaceInsert;
  errors: string[];
}

export interface ParseResult {
  valid: ParsedGreenSpace[];
  invalid: Array<{ row: number; data: CSVRow; errors: string[] }>;
}

/**
 * Validate GPS coordinates are within Kazakhstan bounds
 * Kazakhstan approximate bounds: 40.9°N to 55.4°N, 46.5°E to 87.4°E
 */
function validateKazakhstanCoordinates(lat: number, lng: number): boolean {
  return lat >= 40.9 && lat <= 55.4 && lng >= 46.5 && lng <= 87.4;
}

/**
 * Validate planting date is not in the future
 */
function validatePlantingDate(date: Date): boolean {
  return date <= new Date();
}

/**
 * Parse and validate a single CSV row
 */
function parseRow(
  row: CSVRow,
  rowNumber: number,
  createdBy: string
): { valid: ParsedGreenSpace | null; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!row.latitude) errors.push('latitude is required');
  if (!row.longitude) errors.push('longitude is required');
  if (!row.species_ru) errors.push('species_ru is required');
  if (!row.city_id) errors.push('city_id is required');
  if (!row.planting_date) errors.push('planting_date is required');

  if (errors.length > 0) {
    return { valid: null, errors };
  }

  // Parse and validate latitude
  const latitude = parseFloat(row.latitude);
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.push('latitude must be a valid number between -90 and 90');
  }

  // Parse and validate longitude
  const longitude = parseFloat(row.longitude);
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.push('longitude must be a valid number between -180 and 180');
  }

  // Validate coordinates are within Kazakhstan
  if (!isNaN(latitude) && !isNaN(longitude)) {
    if (!validateKazakhstanCoordinates(latitude, longitude)) {
      errors.push('coordinates must be within Kazakhstan bounds');
    }
  }

  // Validate and parse planting date
  const plantingDate = new Date(row.planting_date);
  if (isNaN(plantingDate.getTime())) {
    errors.push('planting_date must be a valid date');
  } else if (!validatePlantingDate(plantingDate)) {
    errors.push('planting_date cannot be in the future');
  }

  // Validate type
  const validTypes: GreenSpaceType[] = ['tree', 'park', 'alley', 'garden'];
  const type = (row.type?.toLowerCase() || 'tree') as GreenSpaceType;
  if (!validTypes.includes(type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate status
  const validStatuses: GreenSpaceStatus[] = ['alive', 'attention_needed', 'dead', 'removed'];
  const status = (row.status?.toLowerCase() || 'alive') as GreenSpaceStatus;
  if (row.status && !validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  // Validate UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(row.city_id)) {
    errors.push('city_id must be a valid UUID');
  }
  if (row.district_id && !uuidRegex.test(row.district_id)) {
    errors.push('district_id must be a valid UUID');
  }

  if (errors.length > 0) {
    return { valid: null, errors };
  }

  // Build valid data object
  const valid: ParsedGreenSpace = {
    data: {
      type,
      species_ru: row.species_ru.trim(),
      species_kz: row.species_kz?.trim() || null,
      species_en: row.species_en?.trim() || null,
      species_scientific: row.species_scientific?.trim() || null,
      latitude,
      longitude,
      city_id: row.city_id,
      district_id: row.district_id || null,
      planting_date: plantingDate,
      status: status || 'alive',
      notes: row.notes?.trim() || null,
      responsible_org: row.responsible_org?.trim() || null,
      created_by: createdBy,
    },
    errors: [],
  };

  return { valid, errors: [] };
}

/**
 * Parse CSV file and validate all rows
 */
export function parseCSV(
  csvContent: string,
  createdBy: string
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize header names (case-insensitive, handle spaces/underscores)
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
      complete: (results) => {
        const valid: ParsedGreenSpace[] = [];
        const invalid: Array<{ row: number; data: CSVRow; errors: string[] }> = [];

        results.data.forEach((row, index) => {
          // Skip completely empty rows
          if (Object.values(row).every((val) => !val || val.toString().trim() === '')) {
            return;
          }

          const { valid: parsed, errors } = parseRow(row, index + 2, createdBy); // +2 because of header and 1-indexed

          if (parsed) {
            valid.push(parsed);
          } else {
            invalid.push({
              row: index + 2,
              data: row,
              errors,
            });
          }
        });

        resolve({ valid, invalid });
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Get CSV template for download
 */
export function getCSVTemplate(): string {
  const headers = [
    'latitude',
    'longitude',
    'species_ru',
    'species_kz',
    'species_en',
    'species_scientific',
    'type',
    'city_id',
    'district_id',
    'planting_date',
    'status',
    'notes',
    'responsible_org',
  ];

  const exampleRow = [
    '43.2220',
    '76.8512',
    'Береза',
    'Қайың',
    'Birch',
    'Betula pendula',
    'tree',
    '<city-uuid>',
    '<district-uuid>',
    '2024-01-15',
    'alive',
    'Planted near main entrance',
    'City Parks Department',
  ];

  return Papa.unparse([headers, exampleRow]);
}

