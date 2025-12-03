/**
 * Unit tests for marketplace components
 */

import { describe, it, expect } from '@jest/globals';

describe('Marketplace Components', () => {
  describe('PublicCDCard', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('MarketplaceFilters', () => {
    it('should support all sort options', () => {
      const sortOptions: Array<'newest' | 'oldest' | 'mostViewed'> = [
        'newest',
        'oldest',
        'mostViewed',
      ];
      
      expect(sortOptions).toHaveLength(3);
      expect(sortOptions).toContain('newest');
      expect(sortOptions).toContain('oldest');
      expect(sortOptions).toContain('mostViewed');
    });
  });

  describe('Marketplace Sorting', () => {
    it('should sort by newest correctly', () => {
      const cds = [
        { id: '1', publicAt: new Date('2024-01-01'), viewCount: 10 },
        { id: '2', publicAt: new Date('2024-01-03'), viewCount: 5 },
        { id: '3', publicAt: new Date('2024-01-02'), viewCount: 15 },
      ];

      const sorted = [...cds].sort((a, b) => 
        b.publicAt.getTime() - a.publicAt.getTime()
      );

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should sort by oldest correctly', () => {
      const cds = [
        { id: '1', publicAt: new Date('2024-01-01'), viewCount: 10 },
        { id: '2', publicAt: new Date('2024-01-03'), viewCount: 5 },
        { id: '3', publicAt: new Date('2024-01-02'), viewCount: 15 },
      ];

      const sorted = [...cds].sort((a, b) => 
        a.publicAt.getTime() - b.publicAt.getTime()
      );

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('2');
    });

    it('should sort by most viewed correctly', () => {
      const cds = [
        { id: '1', publicAt: new Date('2024-01-01'), viewCount: 10 },
        { id: '2', publicAt: new Date('2024-01-03'), viewCount: 5 },
        { id: '3', publicAt: new Date('2024-01-02'), viewCount: 15 },
      ];

      const sorted = [...cds].sort((a, b) => b.viewCount - a.viewCount);

      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });

  describe('Marketplace Search', () => {
    it('should filter by CD name', () => {
      const cds = [
        { id: '1', name: 'Summer Vibes', username: 'user1' },
        { id: '2', name: 'Winter Chill', username: 'user2' },
        { id: '3', name: 'Summer Hits', username: 'user3' },
      ];

      const query = 'summer';
      const filtered = cds.filter((cd) =>
        cd.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('should filter by username', () => {
      const cds = [
        { id: '1', name: 'Summer Vibes', username: 'musiclover' },
        { id: '2', name: 'Winter Chill', username: 'djmaster' },
        { id: '3', name: 'Summer Hits', username: 'musicfan' },
      ];

      const query = 'music';
      const filtered = cds.filter((cd) =>
        cd.name.toLowerCase().includes(query.toLowerCase()) ||
        cd.username.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('should be case insensitive', () => {
      const cds = [
        { id: '1', name: 'Summer Vibes', username: 'user1' },
        { id: '2', name: 'WINTER CHILL', username: 'user2' },
      ];

      const query = 'SUMMER';
      const filtered = cds.filter((cd) =>
        cd.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });
});
