import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MegaMenu from '../../components/MegaMenu/MegaMenu';
import menuReducer from '../../store/slices/menuSlice';
import themeReducer from '../../store/slices/themeSlice';
import userReducer from '../../store/slices/userSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      menu: menuReducer,
      theme: themeReducer,
      user: userReducer,
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

    expect(screen.getByText('Get Menu Item 1')).toBeInTheDocument();
    expect(screen.getByText('Get Menu Item 2')).toBeInTheDocument();
  });

  it('shows submenu on hover', async () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuItem = screen.getByText('Get Menu Item 1');
    fireEvent.mouseEnter(menuItem);

    await waitFor(() => {
      expect(screen.getByText('My Career and Benefits')).toBeInTheDocument();
      expect(screen.getByText('Travel and Expense')).toBeInTheDocument();
    });
  });

  it('hides submenu on mouse leave', async () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuItem = screen.getByText('Get Menu Item 1');
    fireEvent.mouseEnter(menuItem);

    await waitFor(() => {
      expect(screen.getByText('My Career and Benefits')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(menuItem);

    await waitFor(() => {
      expect(screen.queryByText('My Career and Benefits')).not.toBeVisible();
    });
  });

  it('handles keyboard navigation', () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuItem = screen.getByText('Get Menu Item 1');
    fireEvent.keyDown(menuItem, { key: 'Enter' });
    
    // Should not throw any errors
    expect(menuItem).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <Provider store={store}>
        <MegaMenu />
      </Provider>
    );

    const menuBar = screen.getByRole('menubar');
    expect(menuBar).toHaveAttribute('aria-label', 'Main navigation menu');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

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

    const menuItem = screen.getByText('Get Menu Item 1');
    fireEvent.click(menuItem);

    // Should call window.open with the URL
    expect(mockOpen).toHaveBeenCalledWith('https://example.com/item1', '_blank');
  });
});
