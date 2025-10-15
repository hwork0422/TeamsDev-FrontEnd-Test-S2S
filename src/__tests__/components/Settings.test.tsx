import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Settings from '../../components/Settings/Settings';
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

describe('Settings', () => {
  let store: ReturnType<typeof createTestStore>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    store = createTestStore();
    user = userEvent.setup();
  });

  it('renders settings panel correctly', () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(screen.getByText('Configure Navigations')).toBeInTheDocument();
    expect(screen.getByText('Add Root Item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
  });

  it('displays existing menu items', () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(screen.getByText('Get Menu Item 1')).toBeInTheDocument();
    expect(screen.getByText('Get Menu Item 2')).toBeInTheDocument();
  });

  it('opens add item modal when clicking Add Root Item', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const addButton = screen.getByText('Add Root Item');
    await user.click(addButton);

    expect(screen.getByText('Add Menu Item')).toBeInTheDocument();
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const addButton = screen.getByText('Add Root Item');
    await user.click(addButton);

    const submitButton = screen.getByText('Add Item');
    await user.click(submitButton);

    // Should show validation error for required label
    expect(screen.getByText('Label is required')).toBeInTheDocument();
  });

  it('adds new menu item successfully', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const addButton = screen.getByText('Add Root Item');
    await user.click(addButton);

    const labelInput = screen.getByLabelText('Label');
    const urlInput = screen.getByLabelText('URL');
    const submitButton = screen.getByText('Add Item');

    await user.type(labelInput, 'New Menu Item');
    await user.type(urlInput, 'https://example.com/new');
    await user.click(submitButton);

    // Modal should close and new item should appear
    await waitFor(() => {
      expect(screen.queryByText('Add Menu Item')).not.toBeInTheDocument();
    });

    expect(screen.getByText('New Menu Item')).toBeInTheDocument();
  });

  it('opens edit modal when clicking Edit button', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByText('Edit Menu Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Get Menu Item 1')).toBeInTheDocument();
  });

  it('deletes menu item with confirmation', async () => {
    // Mock window.confirm
    const mockConfirm = vi.fn().mockReturnValue(true);
    Object.defineProperty(window, 'confirm', {
      value: mockConfirm,
      writable: true,
    });

    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');
  });

  it('filters menu items by search term', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search menu items...');
    await user.type(searchInput, 'Career');

    // Should only show items containing "Career"
    expect(screen.getByText('My Career and Benefits')).toBeInTheDocument();
    expect(screen.queryByText('Travel and Expense')).not.toBeInTheDocument();
  });

  it('adds child item to existing menu item', async () => {
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    const addChildButtons = screen.getAllByText('Add Child');
    await user.click(addChildButtons[0]);

    expect(screen.getByText('Add Menu Item')).toBeInTheDocument();

    const labelInput = screen.getByLabelText('Label');
    const submitButton = screen.getByText('Add Item');

    await user.type(labelInput, 'New Child Item');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Add Menu Item')).not.toBeInTheDocument();
    });

    expect(screen.getByText('New Child Item')).toBeInTheDocument();
  });
});
