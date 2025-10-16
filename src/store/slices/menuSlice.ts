import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../../types';
import mockMenuData from '../../__mocks__/menuData.json';

interface MenuState {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  hoveredItem: string | null;
}

const initialState: MenuState = {
  items: mockMenuData as MenuItem[],
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
