import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../../types';

interface MenuState {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  hoveredItem: string | null;
}

const initialState: MenuState = {
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
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
    addMenuItem: (state, action: PayloadAction<{ parentId?: string; item: MenuItem }>) => {
      const { parentId, item } = action.payload;
      
      if (!parentId) {
        state.items.push(item);
      } else {
        const addToParent = (items: MenuItem[]): boolean => {
          for (const menuItem of items) {
            if (menuItem.id === parentId) {
              if (!menuItem.children) {
                menuItem.children = [];
              }
              menuItem.children.push(item);
              return true;
            }
            if (menuItem.children && addToParent(menuItem.children)) {
              return true;
            }
          }
          return false;
        };
        addToParent(state.items);
      }
    },
    updateMenuItem: (state, action: PayloadAction<{ id: string; updates: Partial<MenuItem> }>) => {
      const { id, updates } = action.payload;
      
      const updateItem = (items: MenuItem[]): boolean => {
        for (const item of items) {
          if (item.id === id) {
            Object.assign(item, updates);
            return true;
          }
          if (item.children && updateItem(item.children)) {
            return true;
          }
        }
        return false;
      };
      updateItem(state.items);
    },
    deleteMenuItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      
      const deleteItem = (items: MenuItem[]): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === id) {
            items.splice(i, 1);
            return true;
          }
          if (items[i].children && deleteItem(items[i].children!)) {
            return true;
          }
        }
        return false;
      };
      deleteItem(state.items);
    },
    setHoveredItem: (state, action: PayloadAction<string | null>) => {
      state.hoveredItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setHoveredItem,
  setLoading,
  setError,
} = menuSlice.actions;

export default menuSlice.reducer;
