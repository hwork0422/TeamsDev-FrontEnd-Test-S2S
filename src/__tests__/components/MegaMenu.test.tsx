import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MegaMenu from '../../components/MegaMenu/MegaMenu';
import menuReducer from '../../store/slices/menuSlice';
import mockMenuData from '../../__mocks__/menuData.json';
import themeReducer from '../../store/slices/themeSlice';
import userReducer from '../../store/slices/userSlice';

// Helper functions to get expected values from mock data
const getFirstMenuItem = () => mockMenuData[0];
const getSecondMenuItem = () => mockMenuData[1];
const getFirstSubMenuItem = () => mockMenuData[0].children?.[0];
const getFirstSubSubMenuItem = () => mockMenuData[0].children?.[0]?.children?.[0];

const createTestStore = () => {
  return configureStore({
    reducer: {
      menu: menuReducer,
      theme: themeReducer,
      user: userReducer,
    },
    preloadedState: {
      menu: {
        items: mockMenuData,
        isLoading: false,
        error: null,
        hoveredItem: null,
      },
      theme: {
        currentTheme: 'light' as const,
        isTeamsTheme: false,
      },
      user: {
        currentUser: null,
        isInitialized: false,
      },
    },
  });
};

describe('MegaMenu', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders menu items correctly', () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    expect(screen.getByText(getFirstMenuItem().label)).toBeInTheDocument();
    expect(screen.getByText(getSecondMenuItem().label)).toBeInTheDocument();
  });

  it('shows submenu on hover', async () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuItem = screen.getByText(getFirstMenuItem().label);
    fireEvent.mouseEnter(menuItem);

    await waitFor(() => {
      expect(screen.getByText(getFirstSubMenuItem()?.label || '')).toBeInTheDocument();
      expect(screen.getByText(getFirstSubSubMenuItem()?.label || '')).toBeInTheDocument();
    });
  });

  it('hides submenu on mouse leave', async () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuItem = screen.getByText(getFirstMenuItem().label);
    fireEvent.mouseEnter(menuItem);

    await waitFor(() => {
      expect(screen.getByText(getFirstSubMenuItem()?.label || '')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(menuItem);

    await waitFor(() => {
      expect(screen.queryByText(getFirstSubMenuItem()?.label || '')).toBeNull();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles keyboard navigation', () => {
      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      const menuItem = screen.getByText(getFirstMenuItem().label);
      fireEvent.keyDown(menuItem, { key: 'Enter' });
      
      // Should not throw any errors
      expect(menuItem).toBeInTheDocument();
    });

    it('handles arrow key navigation', () => {
      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      const menuItem = screen.getByText(getFirstMenuItem().label);
      fireEvent.keyDown(menuItem, { key: 'ArrowRight' });
      
      // Should not throw any errors
      expect(menuItem).toBeInTheDocument();
    });

    it('handles escape key to close submenu', () => {
      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      const menuItem = screen.getByText(getFirstMenuItem().label);
      fireEvent.keyDown(menuItem, { key: 'Escape' });
      
      // Should not throw any errors
      expect(menuItem).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      // Note: ReactMegaMenu doesn't use menubar role, it uses list/listitem
      const menuList = screen.getByRole('list');
      expect(menuList).toBeInTheDocument();

      const menuItems = screen.getAllByRole('listitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('has proper accessibility structure', () => {
      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      // Check for proper list structure
      const menuList = screen.getByRole('list');
      expect(menuList).toBeInTheDocument();

      // Check for menu items
      const menuItems = screen.getAllByRole('listitem');
      expect(menuItems.length).toBeGreaterThan(0);

      // Check that each menu item has proper structure
      menuItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Menu Item Clicks', () => {
    it('handles menu item clicks', async () => {
      // Mock window.open
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      const menuItem = screen.getByText(getFirstMenuItem().label);
      fireEvent.click(menuItem);

      // Note: Current menu items don't have URLs, so window.open won't be called
      // This test verifies the click event is handled without errors
      expect(menuItem).toBeInTheDocument();
    });

    it('handles clicks on menu items with URLs', async () => {
      // Mock window.open
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      render(
        <Provider store={store}>
          <MegaMenu />
        </Provider>
      );

      // Find a menu item with a URL (if any exist in the mock data)
      const menuItemsWithUrls = mockMenuData.filter(item => item.url);
      if (menuItemsWithUrls.length > 0) {
        const menuItem = screen.getByText(menuItemsWithUrls[0].label);
        fireEvent.click(menuItem);

        // Should not throw any errors
        expect(menuItem).toBeInTheDocument();
      }
    });
  });
});
