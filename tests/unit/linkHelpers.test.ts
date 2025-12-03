/**
 * Unit tests for link helper utilities
 * Validates external link security attribute handling
 */

import { describe, it, expect } from '@jest/globals';
import {
  getSafeLinkProps,
  isExternalUrl,
  getAutoSafeLinkProps,
} from '../../src/utils/linkHelpers';

describe('linkHelpers', () => {
  describe('getSafeLinkProps', () => {
    it('should return security attributes for external links', () => {
      const props = getSafeLinkProps('https://example.com', true);
      
      expect(props.target).toBe('_blank');
      expect(props.rel).toBe('noopener noreferrer');
    });

    it('should return undefined attributes for internal links', () => {
      const props = getSafeLinkProps('/about', false);
      
      expect(props.target).toBeUndefined();
      expect(props.rel).toBeUndefined();
    });

    it('should default to internal link behavior when external is not specified', () => {
      const props = getSafeLinkProps('/help');
      
      expect(props.target).toBeUndefined();
      expect(props.rel).toBeUndefined();
    });
  });

  describe('isExternalUrl', () => {
    it('should return true for http:// URLs', () => {
      expect(isExternalUrl('http://example.com')).toBe(true);
    });

    it('should return true for https:// URLs', () => {
      expect(isExternalUrl('https://example.com')).toBe(true);
    });

    it('should return false for relative paths', () => {
      expect(isExternalUrl('/about')).toBe(false);
      expect(isExternalUrl('/help')).toBe(false);
      expect(isExternalUrl('about')).toBe(false);
    });

    it('should return false for anchor links', () => {
      expect(isExternalUrl('#section')).toBe(false);
    });

    it('should return false for mailto links', () => {
      expect(isExternalUrl('mailto:test@example.com')).toBe(false);
    });
  });

  describe('getAutoSafeLinkProps', () => {
    it('should automatically detect and secure external http:// links', () => {
      const props = getAutoSafeLinkProps('http://example.com');
      
      expect(props.target).toBe('_blank');
      expect(props.rel).toBe('noopener noreferrer');
    });

    it('should automatically detect and secure external https:// links', () => {
      const props = getAutoSafeLinkProps('https://github.com/example');
      
      expect(props.target).toBe('_blank');
      expect(props.rel).toBe('noopener noreferrer');
    });

    it('should not add security attributes to internal links', () => {
      const props = getAutoSafeLinkProps('/collection');
      
      expect(props.target).toBeUndefined();
      expect(props.rel).toBeUndefined();
    });

    it('should handle various internal link formats', () => {
      const testCases = [
        '/about',
        '/help',
        'about',
        '#section',
        'mailto:test@example.com',
      ];

      testCases.forEach((href) => {
        const props = getAutoSafeLinkProps(href);
        expect(props.target).toBeUndefined();
        expect(props.rel).toBeUndefined();
      });
    });
  });

  describe('Security compliance', () => {
    it('should always include both noopener and noreferrer for external links', () => {
      const externalUrls = [
        'https://example.com',
        'http://example.com',
        'https://github.com/user/repo',
        'http://social-media.com/profile',
      ];

      externalUrls.forEach((url) => {
        const props = getAutoSafeLinkProps(url);
        
        // Both attributes must be present for security
        expect(props.rel).toBe('noopener noreferrer');
        expect(props.target).toBe('_blank');
      });
    });

    it('should never add security attributes to internal links', () => {
      const internalUrls = [
        '/',
        '/about',
        '/collection',
        '/cd/123',
        'about',
        '#top',
      ];

      internalUrls.forEach((url) => {
        const props = getAutoSafeLinkProps(url);
        
        // Internal links should not have these attributes
        expect(props.rel).toBeUndefined();
        expect(props.target).toBeUndefined();
      });
    });
  });
});
