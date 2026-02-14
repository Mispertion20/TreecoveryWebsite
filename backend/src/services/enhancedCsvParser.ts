import Papa from 'papaparse';
import { supabaseAdmin } from '../config/supabase';
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
  warnings: string[];
  qualityScore: number;
}

export interface ValidationResult {
  valid: ParsedGreenSpace[];
  invalid: Array<{ row: number; data: CSVRow; errors: string[]; warnings: string[] }>;
  duplicates: Array<{ row: number; data: CSVRow; duplicateOf: number; similarity: number }>;
  qualityStats: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    totalRows: number;
  };
}

export interface DuplicateCheck {
  row: number;
  duplicateOf: number;
  similarity: number;
  reason: string;
}

/**
 * Calculate data quality score (0-100)
 */
function calculateQualityScore(
  row: CSVRow,
  parsed: Partial<GreenSpaceInsert>,
  errors: string[]
): number {
  let score = 100;
  let deductions = 0;

  // Deduct for errors
  deductions += errors.length * 20;

  // Deduct for missing optional fields
  if (!row.species_kz) deductions += 5;
  if (!row.species_en) deductions += 5;
  if (!row.species_scientific) deductions += 10;
  if (!row.district_id) deductions += 5;
  if (!row.notes) deductions += 3;
  if (!row.responsible_org) deductions += 5;

  // Deduct for incomplete data
  if (row.species_ru && row.species_ru.length < 3) deductions += 10;
  if (row.notes && row.notes.length < 10) deductions += 5;

  // Bonus for complete scientific name
  if (row.species_scientific && row.species_scientific.includes(' ')) {
    deductions -= 5; // Bonus
  }

  score = Math.max(0, Math.min(100, score - deductions));
  return Math.round(score);
}

/**
 * Validate GPS coordinates are within Kazakhstan bounds
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
 * Check for duplicates based on coordinates and species
 */
async function checkDuplicates(
  validRows: ParsedGreenSpace[],
  threshold: number = 0.0001 // ~11 meters
): Promise<DuplicateCheck[]> {
  const duplicates: DuplicateCheck[] = [];

  // Check for duplicates within the CSV file itself
  for (let i = 0; i < validRows.length; i++) {
    const row1 = validRows[i];
    for (let j = i + 1; j < validRows.length; j++) {
      const row2 = validRows[j];

      // Check coordinate similarity
      const latDiff = Math.abs(row1.data.latitude - row2.data.latitude);
      const lngDiff = Math.abs(row1.data.longitude - row2.data.longitude);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      // Check species similarity
      const speciesMatch =
        row1.data.species_ru.toLowerCase() === row2.data.species_ru.toLowerCase();

      if (distance < threshold && speciesMatch) {
        duplicates.push({
          row: j + 2, // +2 for header and 1-indexed
          duplicateOf: i + 2,
          similarity: Math.max(0, Math.min(100, (1 - distance / threshold) * 100)),
          reason: `Very similar coordinates (${(distance * 111000).toFixed(2)}m apart) and same species`,
        });
      }
    }
  }

  // Also check against existing database records (only if we have rows to check)
  if (validRows.length > 0) {
    // Get unique coordinates to check
    const uniqueCoords = Array.from(
      new Map(
        validRows.map((r, idx) => [
          `${r.data.latitude.toFixed(6)},${r.data.longitude.toFixed(6)}`,
          { lat: r.data.latitude, lng: r.data.longitude, index: idx },
        ])
      ).values()
    );

    // Query for nearby existing records in batches
    for (const coord of uniqueCoords) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('green_spaces')
          .select('id, latitude, longitude, species_ru')
          .gte('latitude', coord.lat - threshold)
          .lte('latitude', coord.lat + threshold)
          .gte('longitude', coord.lng - threshold)
          .lte('longitude', coord.lng + threshold)
          .limit(10);

        if (existing && existing.length > 0) {
          const row = validRows[coord.index];

          for (const existingRecord of existing) {
            const latDiff = Math.abs(row.data.latitude - existingRecord.latitude);
            const lngDiff = Math.abs(row.data.longitude - existingRecord.longitude);
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

            if (
              distance < threshold &&
              row.data.species_ru.toLowerCase() === existingRecord.species_ru.toLowerCase()
            ) {
              duplicates.push({
                row: coord.index + 2,
                duplicateOf: -1, // -1 indicates database duplicate
                similarity: Math.max(0, Math.min(100, (1 - distance / threshold) * 100)),
                reason: `Potential duplicate of existing record (ID: ${existingRecord.id})`,
              });
            }
          }
        }
      } catch (error) {
        // Silently continue if DB check fails
        console.error('Error checking duplicates in database:', error);
      }
    }
  }

  return duplicates;
}

/**
 * Parse and validate a single CSV row with quality scoring
 */
function parseRow(
  row: CSVRow,
  rowNumber: number,
  createdBy: string
): { valid: ParsedGreenSpace | null; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!row.latitude) errors.push('latitude is required');
  if (!row.longitude) errors.push('longitude is required');
  if (!row.species_ru) errors.push('species_ru is required');
  if (!row.city_id) errors.push('city_id is required');
  if (!row.planting_date) errors.push('planting_date is required');

  if (errors.length > 0) {
    return { valid: null, errors, warnings };
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
  } else {
    // Warning for very old dates
    const yearsAgo = (new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsAgo > 100) {
      warnings.push(`Planting date is over ${Math.round(yearsAgo)} years ago`);
    }
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

  // Warnings for missing optional data
  if (!row.species_kz) warnings.push('Missing Kazakh species name');
  if (!row.species_en) warnings.push('Missing English species name');
  if (!row.species_scientific) warnings.push('Missing scientific species name');
  if (!row.district_id) warnings.push('Missing district information');
  if (!row.notes || row.notes.trim().length < 10) {
    warnings.push('Notes are brief or missing');
  }

  if (errors.length > 0) {
    return { valid: null, errors, warnings };
  }

  // Build valid data object
  const parsedData: Partial<GreenSpaceInsert> = {
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
  };

  const qualityScore = calculateQualityScore(row, parsedData, errors);

  const valid: ParsedGreenSpace = {
    data: parsedData as GreenSpaceInsert,
    errors: [],
    warnings,
    qualityScore,
  };

  return { valid, errors: [], warnings };
}

/**
 * Enhanced CSV parser with real-time validation, duplicate detection, and quality scoring
 */
export async function parseCSVEnhanced(
  csvContent: string,
  createdBy: string,
  checkDuplicatesInDB: boolean = true
): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
      complete: async (results) => {
        try {
          const valid: ParsedGreenSpace[] = [];
          const invalid: Array<{ row: number; data: CSVRow; errors: string[]; warnings: string[] }> =
            [];

          // Parse and validate all rows
          results.data.forEach((row, index) => {
            // Skip completely empty rows
            if (Object.values(row).every((val) => !val || val.toString().trim() === '')) {
              return;
            }

            const { valid: parsed, errors, warnings } = parseRow(
              row,
              index + 2,
              createdBy
            ); // +2 because of header and 1-indexed

            if (parsed) {
              valid.push(parsed);
            } else {
              invalid.push({
                row: index + 2,
                data: row,
                errors,
                warnings,
              });
            }
          });

          // Check for duplicates
          const duplicates = checkDuplicatesInDB
            ? await checkDuplicates(valid)
            : await checkDuplicates(valid.slice(0, 0)); // Skip DB check if disabled

          // Calculate quality statistics
          const qualityScores = valid.map((v) => v.qualityScore);
          const qualityStats = {
            averageScore:
              qualityScores.length > 0
                ? Math.round(
                    qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
                  )
                : 0,
            minScore: qualityScores.length > 0 ? Math.min(...qualityScores) : 0,
            maxScore: qualityScores.length > 0 ? Math.max(...qualityScores) : 100,
            totalRows: results.data.length,
          };

          resolve({
            valid,
            invalid,
            duplicates,
            qualityStats,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Validate CSV content without full parsing (for real-time validation)
 */
export function validateCSVPreview(csvContent: string): {
  isValid: boolean;
  errors: string[];
  rowCount: number;
  headers: string[];
} {
  const errors: string[] = [];
  const lines = csvContent.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { isValid: false, errors, rowCount: 0, headers: [] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const requiredHeaders = ['latitude', 'longitude', 'species_ru', 'city_id', 'planting_date'];

  // Check for required headers
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const rowCount = lines.length - 1; // Exclude header

  if (rowCount === 0) {
    errors.push('CSV file contains no data rows');
  }

  return {
    isValid: errors.length === 0,
    errors,
    rowCount,
    headers,
  };
}

