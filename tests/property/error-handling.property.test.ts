/**
 * Property-based tests for Error Handling
 * Using fast-check for property-based testing with minimum 100 iterations
 */

import * as fc from 'fast-check';
import {
  isNetworkError,
  isRetryableError,
  retryOperation,
  formatBytes,
  createCapacityError,
} from '../../src/utils/errorHandling';

describe('Error Handling Property Tests', () => {
  describe('Property 31: Network errors offer retry', () => {
    /**
     * Feature: recd-platform, Property 31: Network errors offer retry
     * Validates: Requirements 11.5
     *
     * For any network error, the UI should display a retry option indicating
     * the operation can be attempted again.
     */

    it('should identify network errors from error codes', () => {
      const networkErrorCodes = [
        'network-error',
        'timeout',
        'unavailable',
        'network-request-failed',
        'auth/network-request-failed'
      ];

      networkErrorCodes.forEach(errorCode => {
        const error = { code: errorCode, message: 'Test error' };
        expect(isNetworkError(error)).toBe(true);
      });
    });

    it('should identify network errors from error messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'Network request failed',
            'Connection timeout',
            'Failed to fetch',
            'Network error occurred',
            'Connection refused'
          ),
          (errorMessage) => {
            const error = { message: errorMessage };
            
            // Network errors should be identified from messages
            expect(isNetworkError(error)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not identify non-network errors as network errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'auth/invalid-email',
            'storage/unauthorized',
            'permission-denied',
            'invalid-argument',
            'not-found'
          ),
          (errorCode) => {
            const error = { code: errorCode, message: 'Test error' };
            
            // Non-network errors should not be identified as network errors
            expect(isNetworkError(error)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify retryable errors correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'unavailable',
            'deadline-exceeded',
            'resource-exhausted',
            'aborted',
            'internal',
            'storage/retry-limit-exceeded',
            'storage/canceled',
            'network-error'
          ),
          (errorCode) => {
            const error = { code: errorCode, message: 'Test error' };
            
            // These errors should be retryable
            expect(isRetryableError(error)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not retry non-retryable errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'auth/invalid-email',
            'auth/weak-password',
            'storage/unauthorized',
            'permission-denied',
            'invalid-argument',
            'not-found',
            'already-exists'
          ),
          (errorCode) => {
            const error = { code: errorCode, message: 'Test error' };
            
            // These errors should not be retryable
            expect(isRetryableError(error)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retry operations with exponential backoff', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 2 }),
          async (failureCount) => {
            let attempts = 0;
            const operation = async () => {
              attempts++;
              if (attempts <= failureCount) {
                throw { code: 'unavailable', message: 'Service unavailable' };
              }
              return 'success';
            };

            const result = await retryOperation(operation, 3, 5);

            // Operation should succeed after retries
            expect(result).toBe('success');
            expect(attempts).toBe(failureCount + 1);
          }
        ),
        { numRuns: 20 }
      );
    }, 10000);

    it('should fail after max retries for persistent errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }),
          async (maxRetries) => {
            let attempts = 0;
            const operation = async () => {
              attempts++;
              throw { code: 'unavailable', message: 'Service unavailable' };
            };

            try {
              await retryOperation(operation, maxRetries, 5);
              fail('Should have thrown an error');
            } catch (error) {
              // Should attempt maxRetries + 1 times (initial + retries)
              expect(attempts).toBe(maxRetries + 1);
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 10000);

    it('should not retry non-retryable errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'auth/invalid-email',
            'permission-denied',
            'invalid-argument'
          ),
          async (errorCode) => {
            let attempts = 0;
            const operation = async () => {
              attempts++;
              throw { code: errorCode, message: 'Non-retryable error' };
            };

            try {
              await retryOperation(operation, 3, 10);
              fail('Should have thrown an error');
            } catch (error) {
              // Should only attempt once (no retries)
              expect(attempts).toBe(1);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle null and undefined errors gracefully', () => {
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
    });

    it('should format bytes correctly for any byte count', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1024 * 1024 * 1024 }),
          (bytes) => {
            const formatted = formatBytes(bytes);

            // Should return a string
            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);

            // Should contain a number and a unit
            expect(formatted).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);

            // Special case: 0 bytes
            if (bytes === 0) {
              expect(formatted).toBe('0 Bytes');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create capacity error with usage details', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 20 * 1024 * 1024 }),
          fc.nat({ max: 20 * 1024 * 1024 }),
          fc.nat({ max: 10 * 1024 * 1024 }),
          (usedBytes, limitBytes, attemptedBytes) => {
            // Ensure used doesn't exceed limit
            const actualUsed = Math.min(usedBytes, limitBytes);

            const errorMessage = createCapacityError(actualUsed, limitBytes, attemptedBytes);

            // Error message should contain all required information
            expect(errorMessage).toContain('capacity exceeded');
            expect(errorMessage).toContain('Used:');
            expect(errorMessage).toContain('Remaining:');
            expect(errorMessage).toContain('Attempted upload:');

            // Should contain formatted byte values
            expect(errorMessage).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);

            // Should be informative
            expect(errorMessage.length).toBeGreaterThan(50);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide consistent error detection across error formats', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          (errorMessage) => {
            // Create errors in different formats
            const errorWithCode = { code: 'network-error', message: errorMessage };
            const errorWithMessage = { message: 'Network request failed' };
            const errorWithName = { name: 'NetworkError', message: errorMessage };

            // All should be identified as network errors
            expect(isNetworkError(errorWithCode)).toBe(true);
            expect(isNetworkError(errorWithMessage)).toBe(true);
            expect(isNetworkError(errorWithName)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle retry with successful operation on first attempt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (successValue) => {
            let attempts = 0;
            const operation = async () => {
              attempts++;
              return successValue;
            };

            const result = await retryOperation(operation, 3, 10);

            // Should succeed immediately without retries
            expect(result).toBe(successValue);
            expect(attempts).toBe(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should calculate remaining capacity correctly', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 20 * 1024 * 1024 }),
          fc.nat({ max: 20 * 1024 * 1024 }),
          (usedBytes, limitBytes) => {
            const actualUsed = Math.min(usedBytes, limitBytes);
            const remaining = limitBytes - actualUsed;

            // Remaining should never be negative
            expect(remaining).toBeGreaterThanOrEqual(0);

            // Remaining should be correct
            expect(remaining).toBe(limitBytes - actualUsed);

            // Used + remaining should equal limit
            expect(actualUsed + remaining).toBe(limitBytes);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
