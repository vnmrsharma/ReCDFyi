/**
 * Unit tests for Share Service
 */

import { generateToken, isValidTokenFormat } from '../../src/utils/tokenGenerator';
import { SHARE_TOKEN_LENGTH } from '../../src/utils/constants';

describe('Token Generator', () => {
  describe('generateToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateToken();
      expect(token).toHaveLength(SHARE_TOKEN_LENGTH);
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateToken();
      const base64urlRegex = /^[A-Za-z0-9_-]+$/;
      expect(token).toMatch(base64urlRegex);
    });

    it('should generate tokens with custom length', () => {
      const customLength = 16;
      const token = generateToken(customLength);
      expect(token).toHaveLength(customLength);
    });
  });

  describe('isValidTokenFormat', () => {
    it('should validate correct token format', () => {
      const token = generateToken();
      expect(isValidTokenFormat(token)).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidTokenFormat('')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidTokenFormat(null as any)).toBe(false);
      expect(isValidTokenFormat(undefined as any)).toBe(false);
    });

    it('should reject tokens with wrong length', () => {
      expect(isValidTokenFormat('short')).toBe(false);
      expect(isValidTokenFormat('a'.repeat(100))).toBe(false);
    });

    it('should reject tokens with invalid characters', () => {
      const invalidToken = 'a'.repeat(SHARE_TOKEN_LENGTH - 1) + '!';
      expect(isValidTokenFormat(invalidToken)).toBe(false);
    });
  });
});
