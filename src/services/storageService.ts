import type { MenuItem } from '../types';

const STORAGE_KEY = 'teams-mega-menu-config';

export class StorageService {
  static saveMenuItems(items: MenuItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save menu items to localStorage:', error);
    }
  }

  static loadMenuItems(): MenuItem[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load menu items from localStorage:', error);
      return null;
    }
  }

  static clearMenuItems(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear menu items from localStorage:', error);
    }
  }

  static validateMenuItem(item: any): item is MenuItem {
    return (
      item !== null &&
      item !== undefined &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.label === 'string' &&
      (item.url === undefined || typeof item.url === 'string') &&
      (item.icon === undefined || typeof item.icon === 'string') &&
      (item.openInTeams === undefined || typeof item.openInTeams === 'boolean') &&
      (item.children === undefined || Array.isArray(item.children))
    );
  }

  static sanitizeMenuItem(item: MenuItem): MenuItem {
    return {
      id: item.id.trim(),
      label: item.label.trim(),
      url: item.url?.trim(),
      icon: item.icon?.trim(),
      openInTeams: Boolean(item.openInTeams),
      children: item.children?.map(child => this.sanitizeMenuItem(child)),
    };
  }
}
