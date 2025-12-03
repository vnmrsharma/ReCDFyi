/**
 * Property-based tests for ValidationService
 * Using fast-check for property-based testing with minimum 100 iterations
 */

import * as fc from 'fast-check';

// Mock Firebase config before importing validationService
jest.mock('../../src/config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));
import {
  validateFileType,
  validateFileSize,
  calculateTotalSize,
  validateEmail,
  validateCDName,
  validateFile,
  validateFiles,
  checkStorageCapacity,
} from '../../src/services/validationService';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_VIDEO_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
  MAX_STORAGE_BYTES,
} from '../../src/utils/constants';

// Helper to create a mock File object
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

// Arbitrary for valid MIME types
const validMimeTypeArb = fc.constantFrom(...ALLOWED_MIME_TYPES);

// Arbitrary for valid file extensions
const validExtensionArb = fc.constantFrom(...ALLOWED_EXTENSIONS);

// Arbitrary for invalid MIME types (not in allowed list)
const invalidMimeTypeArb = fc.string().filter(
  (type) => !ALLOWED_MIME_TYPES.includes(type as any) && type.length > 0
);

// Arbitrary for invalid file extensions
const invalidExtensionArb = fc.string().filter(
  (ext) => !ALLOWED_EXTENSIONS.includes(ext as any) && ext.length > 0 && !ext.includes('.')
);

// Arbitrary for file sizes
const fileSizeArb = fc.nat({ max: MAX_STORAGE_BYTES * 2 });

// Arbitrary for small file sizes (within limits)
const smallFileSizeArb = fc.nat({ max: MAX_FILE_SIZE_BYTES });

// Arbitrary for video file sizes (within video limit)
const videoFileSizeArb = fc.nat({ max: MAX_VIDEO_SIZE_BYTES });

describe('ValidationService Property Tests', () => {
  describe('Property 11: File type validation is correct', () => {
    /**
     * Feature: recd-platform, Property 11: File type validation is correct
     * Validates: Requirements 4.1
     * 
     * For any file, the validation should accept only allowed formats 
     * (jpg, png, mp3, wav, mp4) and reject all other file types.
     */

    it('should accept all files with valid MIME types', () => {
      fc.assert(
        fc.property(
          validMimeTypeArb,
          validExtensionArb,
          smallFileSizeArb,
          (mimeType, extension, size) => {
            const fileName = `test.${extension}`;
            const file = createMockFile(fileName, size, mimeType);
            
            const result = validateFileType(file);
            
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept files with valid extensions even if MIME type is empty', () => {
      fc.assert(
        fc.property(
          validExtensionArb,
          smallFileSizeArb,
          (extension, size) => {
            const fileName = `test.${extension}`;
            // Empty MIME type but valid extension
            const file = createMockFile(fileName, size, '');
            
            const result = validateFileType(file);
            
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all files with invalid MIME types and invalid extensions', () => {
      fc.assert(
        fc.property(
          invalidMimeTypeArb,
          invalidExtensionArb,
          smallFileSizeArb,
          (mimeType, extension, size) => {
            const fileName = `test.${extension}`;
            const file = createMockFile(fileName, size, mimeType);
            
            const result = validateFileType(file);
            
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject files with no extension and invalid MIME type', () => {
      fc.assert(
        fc.property(
          invalidMimeTypeArb,
          smallFileSizeArb,
          (mimeType, size) => {
            const fileName = 'testfile'; // No extension
            const file = createMockFile(fileName, size, mimeType);
            
            const result = validateFileType(file);
            
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Storage capacity is enforced', () => {
    /**
     * Feature: recd-platform, Property 12: Storage capacity is enforced
     * Validates: Requirements 4.2
     * 
     * For any CD and set of files, the upload should be accepted only if 
     * the total size does not exceed the CD's remaining storage capacity.
     */

    it('should accept files when total size is within remaining capacity', () => {
      fc.assert(
        fc.property(
          fc.array(smallFileSizeArb, { minLength: 1, maxLength: 10 }),
          fc.nat({ max: MAX_STORAGE_BYTES }),
          (fileSizes, currentUsage) => {
            // Create files with sizes that fit within remaining capacity
            const remainingSpace = MAX_STORAGE_BYTES - currentUsage;
            
            // Filter file sizes to ensure they fit
            const validFileSizes = fileSizes.filter(size => size <= remainingSpace);
            
            if (validFileSizes.length === 0) {
              return true; // Skip this case
            }
            
            // Take files until we're within capacity
            let totalSize = 0;
            const fittingFileSizes: number[] = [];
            
            for (const size of validFileSizes) {
              if (totalSize + size <= remainingSpace) {
                fittingFileSizes.push(size);
                totalSize += size;
              }
            }
            
            if (fittingFileSizes.length === 0) {
              return true; // Skip this case
            }
            
            // Create mock files
            const files = fittingFileSizes.map((size, index) =>
              createMockFile(`file${index}.jpg`, size, 'image/jpeg')
            );
            
            const result = checkStorageCapacity(files, currentUsage, MAX_STORAGE_BYTES);
            
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject files when total size exceeds remaining capacity', () => {
      fc.assert(
        fc.property(
          fc.nat(MAX_STORAGE_BYTES),
          fc.integer({ min: 1, max: MAX_STORAGE_BYTES }),
          (currentUsage, excessSize) => {
            const remainingSpace = MAX_STORAGE_BYTES - currentUsage;
            
            if (remainingSpace <= 0) {
              return true; // Skip if no space remaining
            }
            
            // Create a file that exceeds remaining space
            const fileSize = remainingSpace + excessSize;
            
            if (fileSize > MAX_STORAGE_BYTES) {
              return true; // Skip if file is too large
            }
            
            const file = createMockFile('large.jpg', fileSize, 'image/jpeg');
            
            const result = checkStorageCapacity([file], currentUsage, MAX_STORAGE_BYTES);
            
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly calculate total size for multiple files', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 1024 * 1024 }), { minLength: 1, maxLength: 20 }),
          (fileSizes) => {
            const files = fileSizes.map((size, index) =>
              createMockFile(`file${index}.jpg`, size, 'image/jpeg')
            );
            
            const calculatedTotal = calculateTotalSize(files);
            const expectedTotal = fileSizes.reduce((sum, size) => sum + size, 0);
            
            expect(calculatedTotal).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should enforce capacity when validating multiple files', () => {
      fc.assert(
        fc.property(
          fc.array(smallFileSizeArb, { minLength: 1, maxLength: 5 }),
          fc.nat({ max: MAX_STORAGE_BYTES }),
          (fileSizes, currentUsage) => {
            const remainingSpace = MAX_STORAGE_BYTES - currentUsage;
            const totalSize = fileSizes.reduce((sum, size) => sum + size, 0);
            
            const files = fileSizes.map((size, index) =>
              createMockFile(`file${index}.jpg`, size, 'image/jpeg')
            );
            
            const result = validateFiles(files, remainingSpace);
            
            if (totalSize <= remainingSpace) {
              // Should be valid if within capacity
              expect(result.valid).toBe(true);
            } else {
              // Should be invalid if exceeds capacity
              expect(result.valid).toBe(false);
              expect(result.errors.some(err => err.includes('exceeds remaining capacity'))).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect video file size limits', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: MAX_STORAGE_BYTES }),
          (fileSize) => {
            const file = createMockFile('video.mp4', fileSize, 'video/mp4');
            
            const result = validateFileSize(file);
            
            if (fileSize <= MAX_VIDEO_SIZE_BYTES) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect non-video file size limits', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: MAX_STORAGE_BYTES }),
          fc.constantFrom('image/jpeg', 'audio/mp3'),
          (fileSize, mimeType) => {
            const extension = mimeType.startsWith('image') ? 'jpg' : 'mp3';
            const file = createMockFile(`file.${extension}`, fileSize, mimeType);
            
            const result = validateFileSize(file);
            
            if (fileSize <= MAX_FILE_SIZE_BYTES) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Additional validation properties', () => {
    it('should validate email format correctly', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            const result = validateEmail(email);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should validate CD names within length constraints', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (name) => {
            const result = validateCDName(name);
            
            const trimmedLength = name.trim().length;
            if (trimmedLength >= 1 && trimmedLength <= 100) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject CD names that are too long', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 200 }).filter(name => name.trim().length > 100),
          (name) => {
            const result = validateCDName(name);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty or whitespace-only CD names', () => {
      const invalidNames = ['', ' ', '  ', '\t', '\n', '   \t\n   '];
      
      invalidNames.forEach(name => {
        expect(validateCDName(name)).toBe(false);
      });
    });
  });
});
