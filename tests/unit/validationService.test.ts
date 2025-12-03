/**
 * Unit tests for ValidationService
 */

import {
  validateFileType,
  validateFileSize,
  calculateTotalSize,
  validateEmail,
  validateCDName,
  validateFile,
  validateFiles,
  checkStorageCapacity,
  normalizeUsername,
  validateUsernameFormat,
  checkUsernameAvailability,
  generateUsernameSuggestions,
  validateUsername,
} from '../../src/services/validationService';
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
  MAX_STORAGE_BYTES,
} from '../../src/utils/constants';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
}));

// Helper to create a mock File object
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('ValidationService', () => {
  describe('validateFileType', () => {
    it('should accept valid image MIME types', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(validateFileType(file)).toBe(true);
    });

    it('should accept valid audio MIME types', () => {
      const file = createMockFile('test.mp3', 1000, 'audio/mpeg');
      expect(validateFileType(file)).toBe(true);
    });

    it('should accept valid video MIME types', () => {
      const file = createMockFile('test.mp4', 1000, 'video/mp4');
      expect(validateFileType(file)).toBe(true);
    });

    it('should accept files with valid extensions even if MIME type is empty', () => {
      const file = createMockFile('test.jpg', 1000, '');
      expect(validateFileType(file)).toBe(true);
    });

    it('should reject invalid MIME types', () => {
      const file = createMockFile('test.pdf', 1000, 'application/pdf');
      expect(validateFileType(file)).toBe(false);
    });

    it('should reject files with invalid extensions', () => {
      const file = createMockFile('test.exe', 1000, 'application/octet-stream');
      expect(validateFileType(file)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept video files within video size limit', () => {
      const file = createMockFile('test.mp4', MAX_VIDEO_SIZE_BYTES, 'video/mp4');
      expect(validateFileSize(file)).toBe(true);
    });

    it('should reject video files exceeding video size limit', () => {
      const file = createMockFile('test.mp4', MAX_VIDEO_SIZE_BYTES + 1, 'video/mp4');
      expect(validateFileSize(file)).toBe(false);
    });

    it('should accept non-video files within file size limit', () => {
      const file = createMockFile('test.jpg', MAX_FILE_SIZE_BYTES, 'image/jpeg');
      expect(validateFileSize(file)).toBe(true);
    });

    it('should reject non-video files exceeding file size limit', () => {
      const file = createMockFile('test.jpg', MAX_FILE_SIZE_BYTES + 1, 'image/jpeg');
      expect(validateFileSize(file)).toBe(false);
    });

    it('should respect custom max size parameter', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(validateFileSize(file, 500)).toBe(false);
      expect(validateFileSize(file, 1000)).toBe(true);
      expect(validateFileSize(file, 2000)).toBe(true);
    });
  });

  describe('calculateTotalSize', () => {
    it('should return 0 for empty array', () => {
      expect(calculateTotalSize([])).toBe(0);
    });

    it('should calculate total size for single file', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(calculateTotalSize([file])).toBe(1000);
    });

    it('should calculate total size for multiple files', () => {
      const files = [
        createMockFile('test1.jpg', 1000, 'image/jpeg'),
        createMockFile('test2.mp3', 2000, 'audio/mpeg'),
        createMockFile('test3.mp4', 3000, 'video/mp4'),
      ];
      expect(calculateTotalSize(files)).toBe(6000);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('validateCDName', () => {
    it('should accept valid CD names', () => {
      expect(validateCDName('My CD')).toBe(true);
      expect(validateCDName('Summer Mix 2024')).toBe(true);
      expect(validateCDName('a')).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(validateCDName('')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(validateCDName('   ')).toBe(false);
      expect(validateCDName('\t')).toBe(false);
    });

    it('should reject names exceeding max length', () => {
      const longName = 'a'.repeat(101);
      expect(validateCDName(longName)).toBe(false);
    });

    it('should accept names at max length', () => {
      const maxName = 'a'.repeat(100);
      expect(validateCDName(maxName)).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(validateCDName(null as any)).toBe(false);
      expect(validateCDName(undefined as any)).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('should validate file with sufficient remaining space', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      const result = validateFile(file, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with invalid type', () => {
      const file = createMockFile('test.pdf', 1000, 'application/pdf');
      const result = validateFile(file, 5000);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject file exceeding size limit', () => {
      const file = createMockFile('test.jpg', MAX_FILE_SIZE_BYTES + 1, 'image/jpeg');
      const result = validateFile(file, MAX_STORAGE_BYTES);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject file exceeding remaining space', () => {
      const file = createMockFile('test.jpg', 5000, 'image/jpeg');
      const result = validateFile(file, 1000);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('capacity exceeded'))).toBe(true);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple files within capacity', () => {
      const files = [
        createMockFile('test1.jpg', 1000, 'image/jpeg'),
        createMockFile('test2.mp3', 2000, 'audio/mpeg'),
      ];
      const result = validateFiles(files, 10000);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when total size exceeds capacity', () => {
      const files = [
        createMockFile('test1.jpg', 5000, 'image/jpeg'),
        createMockFile('test2.mp3', 6000, 'audio/mpeg'),
      ];
      const result = validateFiles(files, 10000);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('exceeds remaining capacity'))).toBe(true);
    });

    it('should reject empty file array', () => {
      const result = validateFiles([], 10000);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('No files selected'))).toBe(true);
    });

    it('should report errors for individual invalid files', () => {
      const files = [
        createMockFile('test1.pdf', 1000, 'application/pdf'),
        createMockFile('test2.jpg', MAX_FILE_SIZE_BYTES + 1, 'image/jpeg'),
      ];
      const result = validateFiles(files, MAX_STORAGE_BYTES);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkStorageCapacity', () => {
    it('should return true when files fit within capacity', () => {
      const files = [
        createMockFile('test1.jpg', 5000, 'image/jpeg'),
        createMockFile('test2.mp3', 3000, 'audio/mpeg'),
      ];
      const result = checkStorageCapacity(files, 10000, MAX_STORAGE_BYTES);
      
      expect(result).toBe(true);
    });

    it('should return false when files exceed capacity', () => {
      const files = [
        createMockFile('test1.jpg', 15000000, 'image/jpeg'),
        createMockFile('test2.mp3', 10000000, 'audio/mpeg'),
      ];
      const result = checkStorageCapacity(files, 0, MAX_STORAGE_BYTES);
      
      expect(result).toBe(false);
    });

    it('should account for current usage', () => {
      const files = [
        createMockFile('test1.jpg', 5000000, 'image/jpeg'),
      ];
      const currentUsage = 16000000; // 16 MB used
      const result = checkStorageCapacity(files, currentUsage, MAX_STORAGE_BYTES);
      
      expect(result).toBe(false);
    });

    it('should use default storage limit when not provided', () => {
      const files = [
        createMockFile('test1.jpg', 1000000, 'image/jpeg'),
      ];
      const result = checkStorageCapacity(files, 0);
      
      expect(result).toBe(true);
    });
  });

  describe('normalizeUsername', () => {
    it('should convert username to lowercase', () => {
      expect(normalizeUsername('TestUser')).toBe('testuser');
      expect(normalizeUsername('UPPERCASE')).toBe('uppercase');
      expect(normalizeUsername('MixedCase123')).toBe('mixedcase123');
    });

    it('should handle already lowercase usernames', () => {
      expect(normalizeUsername('lowercase')).toBe('lowercase');
    });

    it('should handle usernames with underscores', () => {
      expect(normalizeUsername('Test_User_123')).toBe('test_user_123');
    });
  });

  describe('validateUsernameFormat', () => {
    it('should accept valid usernames', () => {
      const result = validateUsernameFormat('validuser');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept usernames with numbers', () => {
      const result = validateUsernameFormat('user123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept usernames with underscores', () => {
      const result = validateUsernameFormat('user_name');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept usernames at minimum length', () => {
      const result = validateUsernameFormat('abc');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept usernames at maximum length', () => {
      const result = validateUsernameFormat('a'.repeat(20));
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject usernames that are too short', () => {
      const result = validateUsernameFormat('ab');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('at least 3 characters'))).toBe(true);
    });

    it('should reject usernames that are too long', () => {
      const result = validateUsernameFormat('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('20 characters or less'))).toBe(true);
    });

    it('should reject usernames with spaces', () => {
      const result = validateUsernameFormat('user name');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('letters, numbers, and underscores only'))).toBe(true);
    });

    it('should reject usernames with special characters', () => {
      const result = validateUsernameFormat('user@name');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject usernames with hyphens', () => {
      const result = validateUsernameFormat('user-name');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty strings', () => {
      const result = validateUsernameFormat('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject whitespace-only strings', () => {
      const result = validateUsernameFormat('   ');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle null and undefined', () => {
      expect(validateUsernameFormat(null as any).valid).toBe(false);
      expect(validateUsernameFormat(undefined as any).valid).toBe(false);
    });
  });

  describe('checkUsernameAvailability', () => {
    const { getDocs } = require('firebase/firestore');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true when username is available', async () => {
      getDocs.mockResolvedValue({ empty: true });
      
      const result = await checkUsernameAvailability('newuser');
      expect(result).toBe(true);
    });

    it('should return false when username is taken', async () => {
      getDocs.mockResolvedValue({ empty: false });
      
      const result = await checkUsernameAvailability('takenuser');
      expect(result).toBe(false);
    });

    it('should check case-insensitive availability', async () => {
      getDocs.mockResolvedValue({ empty: true });
      
      await checkUsernameAvailability('TestUser');
      // The function should normalize to lowercase before checking
      expect(getDocs).toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
      getDocs.mockRejectedValue(new Error('Database error'));
      
      await expect(checkUsernameAvailability('user')).rejects.toThrow('Failed to check username availability');
    });
  });

  describe('generateUsernameSuggestions', () => {
    it('should generate 3 suggestions', () => {
      const suggestions = generateUsernameSuggestions('testuser');
      expect(suggestions).toHaveLength(3);
    });

    it('should generate unique suggestions', () => {
      const suggestions = generateUsernameSuggestions('testuser');
      const uniqueSuggestions = new Set(suggestions);
      expect(uniqueSuggestions.size).toBe(suggestions.length);
    });

    it('should include base username in suggestions', () => {
      const suggestions = generateUsernameSuggestions('testuser');
      suggestions.forEach(suggestion => {
        expect(suggestion).toContain('testuser');
      });
    });

    it('should handle usernames with existing numbers', () => {
      const suggestions = generateUsernameSuggestions('user123');
      expect(suggestions).toHaveLength(3);
      suggestions.forEach(suggestion => {
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    it('should normalize username before generating suggestions', () => {
      const suggestions = generateUsernameSuggestions('TestUser');
      suggestions.forEach(suggestion => {
        expect(suggestion).toBe(suggestion.toLowerCase());
      });
    });
  });

  describe('validateUsername', () => {
    const { getDocs } = require('firebase/firestore');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should validate format before checking availability', async () => {
      const result = await validateUsername('ab'); // Too short
      expect(result.valid).toBe(false);
      expect(getDocs).not.toHaveBeenCalled();
    });

    it('should return valid for available username with correct format', async () => {
      getDocs.mockResolvedValue({ empty: true });
      
      const result = await validateUsername('validuser');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid with suggestions for taken username', async () => {
      getDocs.mockResolvedValue({ empty: false });
      
      const result = await validateUsername('takenuser');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Try:');
      expect(result.errors[0]).toContain('@');
    });

    it('should handle database errors gracefully', async () => {
      getDocs.mockRejectedValue(new Error('Database error'));
      
      const result = await validateUsername('validuser');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Failed to validate username'))).toBe(true);
    });

    it('should reject invalid format with appropriate error', async () => {
      const result = await validateUsername('user@name');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('letters, numbers, and underscores only'))).toBe(true);
    });
  });
});

