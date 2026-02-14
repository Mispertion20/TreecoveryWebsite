/**
 * Validation utilities for common input validation
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate coordinates are within Kazakhstan bounds
 */
export function isValidKazakhstanCoordinates(
  latitude: number,
  longitude: number
): boolean {
  // Kazakhstan approximate bounds
  const MIN_LAT = 40.9;
  const MAX_LAT = 55.4;
  const MIN_LNG = 46.5;
  const MAX_LNG = 87.4;

  return (
    latitude >= MIN_LAT &&
    latitude <= MAX_LAT &&
    longitude >= MIN_LNG &&
    longitude <= MAX_LNG
  );
}

/**
 * Validate date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
}

/**
 * Validate date string format
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Sanitize string input (remove extra whitespace)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page?: string | number,
  limit?: string | number
): { page: number; limit: number } | null {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit || 50;

  if (isNaN(pageNum) || pageNum < 1) {
    return null;
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return null;
  }

  return { page: pageNum, limit: limitNum };
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): { missing: string[] } | null {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return missing.length > 0 ? { missing } : null;
}

