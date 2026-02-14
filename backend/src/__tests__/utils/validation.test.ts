import {
  isValidEmail,
  isValidUUID,
  isValidKazakhstanCoordinates,
  isPastDate,
  isValidDate,
  sanitizeString,
  validatePagination,
  validateRequired,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidKazakhstanCoordinates', () => {
    it('should validate coordinates within Kazakhstan bounds', () => {
      // Almaty coordinates
      expect(isValidKazakhstanCoordinates(43.2220, 76.8512)).toBe(true);
      // Astana coordinates
      expect(isValidKazakhstanCoordinates(51.1694, 71.4491)).toBe(true);
    });

    it('should reject coordinates outside Kazakhstan bounds', () => {
      expect(isValidKazakhstanCoordinates(55.5, 76.8512)).toBe(false); // Too far north
      expect(isValidKazakhstanCoordinates(43.2220, 45.0)).toBe(false); // Too far west
      expect(isValidKazakhstanCoordinates(40.0, 90.0)).toBe(false); // Too far east
    });
  });

  describe('isPastDate', () => {
    it('should validate past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPastDate(yesterday)).toBe(true);
    });

    it('should reject future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isPastDate(tomorrow)).toBe(false);
    });

    it('should accept today as valid', () => {
      expect(isPastDate(new Date())).toBe(true);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date strings', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove extra whitespace', () => {
      expect(sanitizeString('  hello   world  ')).toBe('hello world');
      expect(sanitizeString('test    test')).toBe('test test');
    });
  });

  describe('validatePagination', () => {
    it('should validate correct pagination parameters', () => {
      const result = validatePagination('1', '10');
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should use defaults for missing parameters', () => {
      const result = validatePagination();
      expect(result).toEqual({ page: 1, limit: 50 });
    });

    it('should reject invalid pagination parameters', () => {
      expect(validatePagination('0', '10')).toBeNull();
      expect(validatePagination('1', '0')).toBeNull();
      expect(validatePagination('1', '101')).toBeNull(); // Over max limit
    });
  });

  describe('validateRequired', () => {
    it('should return null when all required fields are present', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = validateRequired(data, ['email', 'password']);
      expect(result).toBeNull();
    });

    it('should return missing fields when some are absent', () => {
      const data = { email: 'test@example.com' };
      const result = validateRequired(data, ['email', 'password']);
      expect(result).toEqual({ missing: ['password'] });
    });
  });
});

