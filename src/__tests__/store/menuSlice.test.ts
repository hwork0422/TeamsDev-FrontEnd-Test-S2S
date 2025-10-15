import { describe, it, expect } from 'vitest';
import menuReducer, {
  setMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setHoveredItem,
} from '../../store/slices/menuSlice';
import type { MenuItem } from '../../types';

describe('menuSlice', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null,
    hoveredItem: null,
  };

  it('should return the initial state', () => {
    expect(menuReducer(undefined, { type: 'unknown' })).toEqual({
      items: [
        {
          id: '1',
          label: 'Get Menu Item 1',
          url: 'https://example.com/item1',
          icon: 'Home',
          children: [
            {
              id: '1-1',
              label: 'My Career and Benefits',
              url: 'https://example.com/career',
              icon: 'User',
              children: [
                {
                  id: '1-1-1',
                  label: 'Career Development',
                  url: 'https://example.com/career-dev',
                  icon: 'Education',
                },
                {
                  id: '1-1-2',
                  label: 'Benefits Overview',
                  url: 'https://example.com/benefits',
                  icon: 'Heart',
                },
              ],
            },
            {
              id: '1-2',
              label: 'Travel and Expense',
              url: 'https://example.com/travel',
              icon: 'Airplane',
              children: [
                {
                  id: '1-2-1',
                  label: 'Book Travel',
                  url: 'https://example.com/book-travel',
                  icon: 'Airplane',
                },
                {
                  id: '1-2-2',
                  label: 'Submit Expense',
                  url: 'https://example.com/expense',
                  icon: 'Money',
                },
              ],
            },
          ],
        },
        {
          id: '2',
          label: 'Get Menu Item 2',
          url: 'https://example.com/item2',
          icon: 'Settings',
          children: [
            {
              id: '2-1',
              label: 'IT Services',
              url: 'https://example.com/it-services',
              icon: 'Laptop',
            },
            {
              id: '2-2',
              label: 'HR Services',
              url: 'https://example.com/hr-services',
              icon: 'People',
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      hoveredItem: null,
    });
  });

  it('should handle setMenuItems', () => {
    const newItems: MenuItem[] = [
      {
        id: '3',
        label: 'New Item',
        url: 'https://example.com/new',
        icon: 'Star',
      },
    ];

    const actual = menuReducer(initialState, setMenuItems(newItems));
    expect(actual.items).toEqual(newItems);
  });

  it('should handle addMenuItem to root level', () => {
    const newItem: MenuItem = {
      id: '3',
      label: 'New Root Item',
      url: 'https://example.com/new',
      icon: 'Star',
    };

    const actual = menuReducer(initialState, addMenuItem({ item: newItem }));
    expect(actual.items).toContain(newItem);
  });

  it('should handle addMenuItem to parent', () => {
    const newItem: MenuItem = {
      id: '1-3',
      label: 'New Child Item',
      url: 'https://example.com/new-child',
      icon: 'Star',
    };

    const state = {
      ...initialState,
      items: [
        {
          id: '1',
          label: 'Parent Item',
          children: [],
        },
      ],
    };

    const actual = menuReducer(state, addMenuItem({ parentId: '1', item: newItem }));
    expect(actual.items[0].children).toContain(newItem);
  });

  it('should handle updateMenuItem', () => {
    const state = {
      ...initialState,
      items: [
        {
          id: '1',
          label: 'Original Label',
          url: 'https://example.com/original',
        },
      ],
    };

    const actual = menuReducer(
      state,
      updateMenuItem({
        id: '1',
        updates: { label: 'Updated Label', url: 'https://example.com/updated' },
      })
    );

    expect(actual.items[0].label).toBe('Updated Label');
    expect(actual.items[0].url).toBe('https://example.com/updated');
  });

  it('should handle deleteMenuItem', () => {
    const state = {
      ...initialState,
      items: [
        {
          id: '1',
          label: 'Item to Delete',
        },
        {
          id: '2',
          label: 'Item to Keep',
        },
      ],
    };

    const actual = menuReducer(state, deleteMenuItem('1'));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0].id).toBe('2');
  });

  it('should handle setHoveredItem', () => {
    const actual = menuReducer(initialState, setHoveredItem('item-1'));
    expect(actual.hoveredItem).toBe('item-1');
  });

  it('should handle nested deleteMenuItem', () => {
    const state = {
      ...initialState,
      items: [
        {
          id: '1',
          label: 'Parent Item',
          children: [
            {
              id: '1-1',
              label: 'Child to Delete',
            },
            {
              id: '1-2',
              label: 'Child to Keep',
            },
          ],
        },
      ],
    };

    const actual = menuReducer(state, deleteMenuItem('1-1'));
    expect(actual.items[0].children).toHaveLength(1);
    expect(actual.items[0].children![0].id).toBe('1-2');
  });

  it('should handle nested updateMenuItem', () => {
    const state = {
      ...initialState,
      items: [
        {
          id: '1',
          label: 'Parent Item',
          children: [
            {
              id: '1-1',
              label: 'Child Item',
              url: 'https://example.com/child',
            },
          ],
        },
      ],
    };

    const actual = menuReducer(
      state,
      updateMenuItem({
        id: '1-1',
        updates: { label: 'Updated Child', url: 'https://example.com/updated-child' },
      })
    );

    expect(actual.items[0].children![0].label).toBe('Updated Child');
    expect(actual.items[0].children![0].url).toBe('https://example.com/updated-child');
  });
});
