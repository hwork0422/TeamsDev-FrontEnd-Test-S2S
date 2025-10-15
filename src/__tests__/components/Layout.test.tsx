import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../../components/Layout/Layout';
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

describe('Layout', () => {
  let store: ReturnType<typeof createTestStore>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    store = createTestStore();
    user = userEvent.setup();
  });

  it('renders loading state initially', () => {
    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders main layout after initialization', async () => {
    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByText('Teams Intranet Navigation')).toBeInTheDocument();
    });

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('switches between Navigation and Settings tabs', async () => {
    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Teams Intranet Navigation')).toBeInTheDocument();
    });

    // Initially should show Navigation tab
    expect(screen.getByText('Get Menu Item 1')).toBeInTheDocument();

    // Click Settings tab
    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    // Should show Settings content
    expect(screen.getByText('Configure Navigations')).toBeInTheDocument();
    expect(screen.getByText('Add Root Item')).toBeInTheDocument();

    // Click Navigation tab
    const navigationButton = screen.getByText('Navigation');
    await user.click(navigationButton);

    // Should show Navigation content again
    expect(screen.getByText('Get Menu Item 1')).toBeInTheDocument();
  });

  it('displays user information when available', async () => {
    // Mock Teams context with user
    const mockTeams = await import('@microsoft/teams-js');
    const mockContext = {
      app: { theme: 'light' },
      user: {
        id: 'test-user-id',
        displayName: 'John Doe',
        userPrincipalName: 'john.doe@example.com',
      },
    };

    vi.mocked(mockTeams.default.app.initialize).mockResolvedValue(undefined);
    vi.mocked(mockTeams.default.app.getContext).mockResolvedValue(mockContext);

    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    });
  });

  it('handles theme changes', async () => {
    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Teams Intranet Navigation')).toBeInTheDocument();
    });

    // Check that the layout has the theme data attribute
    const layout = screen.getByText('Teams Intranet Navigation').closest('.layout');
    expect(layout).toHaveAttribute('data-theme', 'light');
  });

  it('loads menu items from localStorage on initialization', async () => {
    // Mock localStorage with saved menu items
    const savedItems = [
      {
        id: 'saved-1',
        label: 'Saved Item',
        url: 'https://example.com/saved',
      },
    ];

    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedItems));

    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Teams Intranet Navigation')).toBeInTheDocument();
    });

    // Should show both default items and saved items
    expect(screen.getByText('Get Menu Item 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Item')).toBeInTheDocument();
  });

  it('handles initialization errors gracefully', async () => {
    // Mock Teams initialization to fail
    const mockTeams = await import('@microsoft/teams-js');
    vi.mocked(mockTeams.default.app.initialize).mockRejectedValue(new Error('Teams not available'));

    render(
      <Provider store={store}>
        <Layout />
      </Provider>
    );

    // Should still render the app even if Teams initialization fails
    await waitFor(() => {
      expect(screen.getByText('Teams Intranet Navigation')).toBeInTheDocument();
    });
  });
});
