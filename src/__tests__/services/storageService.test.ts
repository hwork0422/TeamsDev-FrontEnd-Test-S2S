import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../services/storageService';
import type { MenuItem } from '../../types';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.clearAllMocks();
  });

  describe('saveMenuItems', () => {
    it('should save menu items to localStorage', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          label: 'Test Item',
          url: 'https://example.com',
        },
      ];

      StorageService.saveMenuItems(items);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'teams-mega-menu-config',
        JSON.stringify(items)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          label: 'Test Item',
        },
      ];

      // Mock localStorage.setItem to throw an error
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw an error
      expect(() => StorageService.saveMenuItems(items)).not.toThrow();
    });
  });

  describe('loadMenuItems', () => {
    it('should load menu items from localStorage', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          label: 'Test Item',
          url: 'https://example.com',
        },
      ];

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(items));

      const result = StorageService.loadMenuItems();

      expect(localStorage.getItem).toHaveBeenCalledWith('teams-mega-menu-config');
      expect(result).toEqual(items);
    });

    it('should return null when no items are stored', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = StorageService.loadMenuItems();

      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = StorageService.loadMenuItems();

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json');

      const result = StorageService.loadMenuItems();

      expect(result).toBeNull();
    });
  });

  describe('clearMenuItems', () => {
    it('should clear menu items from localStorage', () => {
      StorageService.clearMenuItems();

      expect(localStorage.removeItem).toHaveBeenCalledWith('teams-mega-menu-config');
    });

    it('should handle localStorage errors gracefully', () => {
      vi.mocked(localStorage.removeItem).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => StorageService.clearMenuItems()).not.toThrow();
    });
  });

  describe('validateMenuItem', () => {
    it('should validate a correct menu item', () => {
      const item: MenuItem = {
        id: '1',
        label: 'Test Item',
        url: 'https://example.com',
        icon: 'test-icon',
        openInTeams: true,
        children: [],
      };

      expect(StorageService.validateMenuItem(item)).toBe(true);
    });

    it('should reject invalid menu item', () => {
      const invalidItem = {
        id: 123, // Should be string
        label: 'Test Item',
      };

      expect(StorageService.validateMenuItem(invalidItem)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(StorageService.validateMenuItem(null)).toBe(false);
      expect(StorageService.validateMenuItem(undefined)).toBe(false);
    });

    it('should validate menu item with optional properties', () => {
      const item = {
        id: '1',
        label: 'Test Item',
      };

      expect(StorageService.validateMenuItem(item)).toBe(true);
    });
  });

  describe('sanitizeMenuItem', () => {
    it('should sanitize menu item data', () => {
      const item: MenuItem = {
        id: '  1  ',
        label: '  Test Item  ',
        url: '  https://example.com  ',
        icon: '  test-icon  ',
        openInTeams: true,
        children: [
          {
            id: '  2  ',
            label: '  Child Item  ',
          },
        ],
      };

      const sanitized = StorageService.sanitizeMenuItem(item);

      expect(sanitized.id).toBe('1');
      expect(sanitized.label).toBe('Test Item');
      expect(sanitized.url).toBe('https://example.com');
      expect(sanitized.icon).toBe('test-icon');
      expect(sanitized.openInTeams).toBe(true);
      expect(sanitized.children![0].id).toBe('2');
      expect(sanitized.children![0].label).toBe('Child Item');
    });

    it('should handle undefined optional properties', () => {
      const item: MenuItem = {
        id: '1',
        label: 'Test Item',
      };

      const sanitized = StorageService.sanitizeMenuItem(item);

      expect(sanitized.url).toBeUndefined();
      expect(sanitized.icon).toBeUndefined();
      expect(sanitized.openInTeams).toBe(false);
      expect(sanitized.children).toBeUndefined();
    });
  });
});
