/**
 * Token generation utility for share tokens
 * Uses crypto.getRandomValues() for cryptographically secure random tokens
 */

import { SHARE_TOKEN_LENGTH } from './constants';

/**
 * Generates a cryptographically secure random token
 * @param length - Length of the token in characters (default: 32)
 * @returns URL-safe base64 encoded token string
 */
export function generateToken(length: number = SHARE_TOKEN_LENGTH): string {
  // Calculate number of bytes needed (base64url encoding is ~1.33x the byte size)
  const byteLength = Math.ceil((length * 3) / 4);
  
  // Generate random bytes
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  
  // Convert to base64url (URL-safe base64)
  const base64 = btoa(String.fromCharCode(...randomBytes));
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  // Return exactly the requested length
  return base64url.substring(0, length);
}

/**
 * Validates that a token string matches the expected format
 * @param token - Token string to validate
 * @returns True if token is valid format, false otherwise
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check length
  if (token.length !== SHARE_TOKEN_LENGTH) {
    return false;
  }
  
  // Check that it only contains base64url characters
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return base64urlRegex.test(token);
}
