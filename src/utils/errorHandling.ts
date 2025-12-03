/**
 * Error handling utilities
 * Provides functions for error detection, mapping, and retry logic
 */

/**
 * Checks if an error is a network error
 * @param error - Error object to check
 * @returns true if error is network-related
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Check for common network error patterns
  return (
    errorCode.includes('network') ||
    errorCode.includes('timeout') ||
    errorCode.includes('unavailable') ||
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && errorMessage.includes('fetch')
  );
}

/**
 * Checks if an error is retryable
 * @param error - Error object to check
 * @returns true if error can be retried
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorCode = error.code?.toLowerCase() || '';

  // Network errors are retryable
  if (isNetworkError(error)) {
    return true;
  }

  // Firebase-specific retryable errors
  const retryableCodes = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'internal',
    'storage/retry-limit-exceeded',
    'storage/canceled',
  ];

  return retryableCodes.some(code => errorCode.includes(code));
}

/**
 * Retries an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Promise resolving to operation result
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable or we've exhausted retries
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      // Wait with exponential backoff before retrying
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Formats bytes to human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "15.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Creates a capacity exceeded error message with usage details
 * @param usedBytes - Current storage usage in bytes
 * @param limitBytes - Storage limit in bytes
 * @param attemptedBytes - Bytes attempted to upload
 * @returns Formatted error message
 */
export function createCapacityError(
  usedBytes: number,
  limitBytes: number,
  attemptedBytes: number
): string {
  const used = formatBytes(usedBytes);
  const limit = formatBytes(limitBytes);
  const remaining = formatBytes(limitBytes - usedBytes);
  const attempted = formatBytes(attemptedBytes);

  return `CD capacity exceeded. Used: ${used} / ${limit}. Remaining: ${remaining}. Attempted upload: ${attempted}`;
}
