/**
 * ValidationService - Centralized validation logic for ReCd platform
 * 
 * This service provides stateless validation functions for:
 * - File type validation (images, audio, video)
 * - File size validation
 * - Email format validation
 * - CD name validation
 * - Username validation
 * - Storage capacity calculations
 */

import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_VIDEO_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
  MAX_STORAGE_BYTES,
  EMAIL_REGEX,
  MIN_CD_NAME_LENGTH,
  MAX_CD_NAME_LENGTH,
  USERNAME_REGEX,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MAX_USERNAME_SUGGESTIONS,
  ERROR_MESSAGES,
  COLLECTIONS,
} from '../utils/constants';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ValidationResult } from '../types';

/**
 * Validates if a file type is allowed based on MIME type
 * @param file - The file to validate
 * @returns true if file type is allowed, false otherwise
 */
export function validateFileType(file: File): boolean {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return true;
  }

  // Fallback: check file extension if MIME type is not recognized
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && ALLOWED_EXTENSIONS.includes(extension as any)) {
    return true;
  }

  return false;
}

/**
 * Validates if a file size is within allowed limits
 * @param file - The file to validate
 * @param maxSize - Maximum allowed size in bytes (optional, uses default limits)
 * @returns true if file size is valid, false otherwise
 */
export function validateFileSize(file: File, maxSize?: number): boolean {
  if (maxSize !== undefined) {
    return file.size <= maxSize;
  }

  // Use default limits based on file type
  const isVideo = file.type.startsWith('video/');
  const limit = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
  
  return file.size <= limit;
}

/**
 * Calculates the total size of multiple files
 * @param files - Array of files to calculate total size for
 * @returns Total size in bytes
 */
export function calculateTotalSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Validates if an email address is in valid format
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates if a CD name meets requirements
 * @param name - CD name to validate
 * @returns true if CD name is valid, false otherwise
 */
export function validateCDName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  return (
    trimmedName.length >= MIN_CD_NAME_LENGTH &&
    trimmedName.length <= MAX_CD_NAME_LENGTH
  );
}

/**
 * Validates a file for upload, checking both type and size
 * @param file - The file to validate
 * @param remainingSpace - Remaining storage space in bytes
 * @returns ValidationResult with valid flag and error messages
 */
export function validateFile(
  file: File,
  remainingSpace: number
): ValidationResult {
  const errors: string[] = [];

  // Validate file type
  if (!validateFileType(file)) {
    errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }

  // Validate file size
  if (!validateFileSize(file)) {
    errors.push(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  // Check if file fits in remaining space
  if (file.size > remainingSpace) {
    errors.push(ERROR_MESSAGES.CD_CAPACITY_EXCEEDED);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files for upload
 * @param files - Array of files to validate
 * @param remainingSpace - Remaining storage space in bytes
 * @returns ValidationResult with valid flag and error messages
 */
export function validateFiles(
  files: File[],
  remainingSpace: number
): ValidationResult {
  const errors: string[] = [];

  // Check if any files provided
  if (!files || files.length === 0) {
    errors.push('No files selected');
    return { valid: false, errors };
  }

  // Validate each file individually
  for (const file of files) {
    if (!validateFileType(file)) {
      errors.push(`${file.name}: ${ERROR_MESSAGES.INVALID_FILE_TYPE}`);
    }

    if (!validateFileSize(file)) {
      errors.push(`${file.name}: ${ERROR_MESSAGES.FILE_TOO_LARGE}`);
    }
  }

  // Check total size against remaining space
  const totalSize = calculateTotalSize(files);
  if (totalSize > remainingSpace) {
    const remainingMB = (remainingSpace / (1024 * 1024)).toFixed(2);
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    errors.push(
      `Total upload size (${totalMB} MB) exceeds remaining capacity (${remainingMB} MB)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if files will fit within CD storage capacity
 * @param files - Array of files to check
 * @param currentUsage - Current storage usage in bytes
 * @param storageLimit - Storage limit in bytes (defaults to MAX_STORAGE_BYTES)
 * @returns true if files will fit, false otherwise
 */
export function checkStorageCapacity(
  files: File[],
  currentUsage: number,
  storageLimit: number = MAX_STORAGE_BYTES
): boolean {
  const totalSize = calculateTotalSize(files);
  const remainingSpace = storageLimit - currentUsage;
  return totalSize <= remainingSpace;
}

/**
 * Normalizes a username to lowercase for case-insensitive uniqueness checking
 * @param username - Username to normalize
 * @returns Lowercase version of the username
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase();
}

/**
 * Validates username format (length and allowed characters)
 * @param username - Username to validate
 * @returns ValidationResult with valid flag and error messages
 */
export function validateUsernameFormat(username: string): ValidationResult {
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    errors.push(ERROR_MESSAGES.INVALID_USERNAME_FORMAT);
    return { valid: false, errors };
  }

  const trimmedUsername = username.trim();

  // Check length
  if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
    errors.push(ERROR_MESSAGES.USERNAME_TOO_SHORT);
  }

  if (trimmedUsername.length > MAX_USERNAME_LENGTH) {
    errors.push(ERROR_MESSAGES.USERNAME_TOO_LONG);
  }

  // Check characters (alphanumeric and underscore only)
  if (!USERNAME_REGEX.test(trimmedUsername)) {
    errors.push(ERROR_MESSAGES.INVALID_USERNAME_FORMAT);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a username is available (not already taken)
 * @param username - Username to check
 * @returns Promise resolving to true if available, false if taken
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const normalizedUsername = normalizeUsername(username);
    
    // Query the usernames collection for case-insensitive match
    const usernamesRef = collection(db, COLLECTIONS.USERNAMES);
    const q = query(
      usernamesRef,
      where('__name__', '==', normalizedUsername),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.empty; // Available if no documents found
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw new Error('Failed to check username availability');
  }
}

/**
 * Generates alternative username suggestions when a username is taken
 * @param baseUsername - The original username that was taken
 * @returns Array of suggested alternative usernames
 */
export function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: string[] = [];
  const normalized = normalizeUsername(baseUsername);
  
  // Remove any trailing numbers from the base username
  const baseWithoutNumbers = normalized.replace(/\d+$/, '');
  
  // Generate suggestions with different suffixes
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 999) + 1;
  
  suggestions.push(`${baseWithoutNumbers}${randomNum}`);
  suggestions.push(`${baseWithoutNumbers}_${currentYear}`);
  suggestions.push(`${normalized}_${Math.floor(Math.random() * 99) + 1}`);
  
  // Return only the requested number of suggestions
  return suggestions.slice(0, MAX_USERNAME_SUGGESTIONS);
}

/**
 * Generates a suggested username from an email address
 * Extracts the local part (before @) and sanitizes it to meet username requirements
 * @param email - Email address to generate username from
 * @returns Suggested username (may need availability check)
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return 'user';
  }

  // Extract the local part (before @)
  const localPart = email.split('@')[0];
  
  // Remove any non-alphanumeric characters except underscores
  let username = localPart.replace(/[^a-zA-Z0-9_]/g, '');
  
  // If username is empty after sanitization, use default
  if (!username) {
    username = 'user';
  }
  
  // Ensure it meets length requirements
  if (username.length < MIN_USERNAME_LENGTH) {
    // Pad with random numbers if too short
    const randomNum = Math.floor(Math.random() * 999) + 1;
    username = `${username}${randomNum}`;
  }
  
  if (username.length > MAX_USERNAME_LENGTH) {
    // Truncate if too long
    username = username.substring(0, MAX_USERNAME_LENGTH);
  }
  
  return username;
}

/**
 * Validates a username completely (format and availability)
 * @param username - Username to validate
 * @returns Promise resolving to ValidationResult with valid flag and error messages
 */
export async function validateUsername(username: string): Promise<ValidationResult> {
  // First check format
  const formatResult = validateUsernameFormat(username);
  if (!formatResult.valid) {
    return formatResult;
  }

  // Then check availability
  try {
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      const suggestions = generateUsernameSuggestions(username);
      const suggestionText = suggestions.map(s => `@${s}`).join(', ');
      return {
        valid: false,
        errors: [`${ERROR_MESSAGES.USERNAME_TAKEN}. Try: ${suggestionText}`],
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to validate username. Please try again.'],
    };
  }
}
