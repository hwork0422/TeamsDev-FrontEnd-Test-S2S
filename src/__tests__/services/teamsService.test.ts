import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeamsService } from '../../services/teamsService';

// Mock the Teams SDK
vi.mock('@microsoft/teams-js', () => ({
  default: {
    app: {
      initialize: vi.fn(),
      getContext: vi.fn(),
      registerOnThemeChangeHandler: vi.fn(),
    },
    pages: {
      backStack: {
        navigateBack: vi.fn(),
      },
      tabs: {
        navigateToTab: vi.fn(),
      },
    },
  },
  app: {
    initialize: vi.fn(),
    getContext: vi.fn(),
    registerOnThemeChangeHandler: vi.fn(),
  },
  pages: {
    backStack: {
      navigateBack: vi.fn(),
    },
    tabs: {
      navigateToTab: vi.fn(),
    },
  },
}));

describe('TeamsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize Teams SDK successfully', async () => {
      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);

      const result = await TeamsService.initialize();

      expect(result).toBe(true);
      expect(mockTeams.default.app.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockRejectedValue(new Error('Init failed'));

      const result = await TeamsService.initialize();

      expect(result).toBe(false);
    });
  });

  describe('getContext', () => {
    it('should get Teams context successfully', async () => {
      const mockContext = {
        app: { theme: 'dark' },
        user: {
          id: 'test-user-id',
          displayName: 'Test User',
          userPrincipalName: 'test@example.com',
        },
      };

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.getContext).mockResolvedValue(mockContext);

      const result = await TeamsService.getContext();

      expect(result).toEqual({
        theme: 'dark',
        user: {
          id: 'test-user-id',
          displayName: 'Test User',
          email: 'test@example.com',
        },
        isInitialized: true,
      });
    });

    it('should handle missing user in context', async () => {
      const mockContext = {
        app: { theme: 'light' },
        user: null,
      };

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.getContext).mockResolvedValue(mockContext);

      const result = await TeamsService.getContext();

      expect(result).toEqual({
        theme: 'light',
        user: null,
        isInitialized: true,
      });
    });

    it('should handle missing displayName', async () => {
      const mockContext = {
        app: { theme: 'light' },
        user: {
          id: 'test-user-id',
          displayName: undefined,
          userPrincipalName: 'test@example.com',
        },
      };

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.getContext).mockResolvedValue(mockContext);

      const result = await TeamsService.getContext();

      expect(result?.user?.displayName).toBe('Unknown User');
    });

    it('should handle getContext errors', async () => {
      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.getContext).mockRejectedValue(new Error('Context failed'));

      const result = await TeamsService.getContext();

      expect(result).toBeNull();
    });
  });

  describe('registerThemeChangeHandler', () => {
    it('should register theme change handler', async () => {
      const callback = vi.fn();

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.registerOnThemeChangeHandler).mockImplementation(() => {});

      await TeamsService.registerThemeChangeHandler(callback);

      expect(mockTeams.default.app.registerOnThemeChangeHandler).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const callback = vi.fn();

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.app.registerOnThemeChangeHandler).mockImplementation(() => {
        throw new Error('Registration failed');
      });

      // Should not throw
      await expect(TeamsService.registerThemeChangeHandler(callback)).resolves.toBeUndefined();
    });
  });

  describe('openLink', () => {
    it('should open link in Teams when openInTeams is true', async () => {
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.pages.backStack.navigateBack).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.pages.tabs.navigateToTab).mockResolvedValue(undefined);

      await TeamsService.openLink('https://example.com', true);

      expect(mockTeams.default.pages.tabs.navigateToTab).toHaveBeenCalledWith({
        tabName: 'Tab',
        url: 'https://example.com',
      });
    });

    it('should fallback to window.open when Teams fails', async () => {
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockRejectedValue(new Error('Teams not available'));

      await TeamsService.openLink('https://example.com', false);

      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('should handle navigation errors gracefully', async () => {
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      const mockTeams = await import('@microsoft/teams-js');
      vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
      vi.mocked(mockTeams.default.pages.tabs.navigateToTab).mockRejectedValue(new Error('Navigation failed'));

      await TeamsService.openLink('https://example.com', true);

      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank');
    });
  });

  describe('mapTeamsTheme', () => {
    it('should map Teams themes correctly', async () => {
      // Test different theme mappings
      const testCases = [
        { teamsTheme: 'light', expectedTheme: 'light' },
        { teamsTheme: 'dark', expectedTheme: 'dark' },
        { teamsTheme: 'contrast', expectedTheme: 'contrast' },
        { teamsTheme: 'default', expectedTheme: 'light' },
        { teamsTheme: 'unknown', expectedTheme: 'light' },
      ];

      for (const testCase of testCases) {
        const mockContext = {
          app: { theme: testCase.teamsTheme },
          user: null,
        };

        const mockTeams = await import('@microsoft/teams-js');
        vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
        vi.mocked(mockTeams.default.app.getContext).mockResolvedValue(mockContext);

        const result = await TeamsService.getContext();
        expect(result?.theme).toBe(testCase.expectedTheme);
      }
    });
  });

  describe('isRunningInTeams', () => {
    it('should detect when running in Teams', () => {
      // Mock window.location to simulate Teams environment
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          parent: { location: 'different-location' },
        },
        writable: true,
      });

      expect(TeamsService.isRunningInTeams()).toBe(true);

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('should detect when not running in Teams', () => {
      // Mock window.location to simulate standalone environment
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          parent: originalLocation,
        },
        writable: true,
      });

      expect(TeamsService.isRunningInTeams()).toBe(false);

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });
});
