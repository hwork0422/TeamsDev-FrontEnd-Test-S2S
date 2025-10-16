import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global type declarations
declare global {
  var mockTeamsSDK: any;
  var localStorageMock: any;
}

// COMMENTED OUT - Microsoft Teams SDK Mock
/*
// Mock Microsoft Teams SDK
const mockTeamsSDK = {
  app: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getContext: vi.fn().mockResolvedValue({
      app: { theme: 'default' },
      user: {
        id: 'test-user-id',
        displayName: 'Test User',
        userPrincipalName: 'test@example.com',
      },
      page: {
        id: 'test-page-id',
        frameContext: 'content',
      },
      dialogParameters: {},
    }),
    registerOnThemeChangeHandler: vi.fn(),
  },
  pages: {
    backStack: {
      navigateBack: vi.fn().mockResolvedValue(undefined),
    },
    tabs: {
      navigateToTab: vi.fn().mockResolvedValue(undefined),
    },
  },
};

// Mock the Teams SDK module
vi.mock('@microsoft/teams-js', () => ({
  default: mockTeamsSDK,
  app: mockTeamsSDK.app,
  pages: mockTeamsSDK.pages,
}));
*/

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
});

// Make mocks available globally for tests
// global.mockTeamsSDK = mockTeamsSDK; // COMMENTED OUT - Teams related
global.localStorageMock = localStorageMock;

// Mock Fluent UI theme to prevent fontFaces errors
vi.mock('@fluentui/react-northstar', async () => {
  const actual = await vi.importActual('@fluentui/react-northstar');
  return {
    ...actual,
    Provider: ({ children }: any) => {
      return children;
    },
  };
});
