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
      label: 'MenuItem1',
      url: 'https://example.com/item1',
      children: [
        {
          id: '1-1',
          label: 'My Career and Benefits',
          children: [
            { id: '1-1-1', label: 'HRweb', url: 'https://example.com/hrweb' },
            { id: '1-1-2', label: 'Benefits', url: 'https://example.com/benefits' },
            { id: '1-1-3', label: 'Learning Portal', url: 'https://example.com/learning' },
            { id: '1-1-4', label: 'Internal Jobs', url: 'https://example.com/jobs' },
            { id: '1-1-5', label: 'Company Store', url: 'https://example.com/store' },
            { id: '1-1-6', label: 'Give', url: 'https://example.com/give' },
          ],
        },
        {
          id: '1-2',
          label: 'Travel and Expense',
          children: [
            { id: '1-2-1', label: 'Travel', url: 'https://example.com/travel' },
            { id: '1-2-2', label: 'Expenses', url: 'https://example.com/expenses' },
            { id: '1-2-3', label: 'Payments', url: 'https://example.com/payments' },
            { id: '1-2-4', label: 'US Immigration Travel', url: 'https://example.com/immigration' },
          ],
        },
      ],
    },
    {
      id: '2',
      label: 'MenuItem2',
      url: 'https://example.com/item2',
      children: [
        {
          id: '2-1',
          label: 'IT Services',
          children: [
            { id: '2-1-1', label: 'Help Desk', url: 'https://example.com/helpdesk' },
            { id: '2-1-2', label: 'Software Requests', url: 'https://example.com/software' },
            { id: '2-1-3', label: 'Network Access', url: 'https://example.com/network' },
            { id: '2-1-4', label: 'Security', url: 'https://example.com/security' },
          ],
        },
        {
          id: '2-2',
          label: 'Facilities',
          children: [
            { id: '2-2-1', label: 'Room Booking', url: 'https://example.com/rooms' },
            { id: '2-2-2', label: 'Maintenance', url: 'https://example.com/maintenance' },
            { id: '2-2-3', label: 'Parking', url: 'https://example.com/parking' },
          ],
        },
      ],
    },
    {
      id: '3',
      label: 'MenuItem3',
      url: 'https://example.com/item3',
      children: [
        {
          id: '3-1',
          label: 'Finance',
          children: [
            { id: '3-1-1', label: 'Budget Planning', url: 'https://example.com/budget' },
            { id: '3-1-2', label: 'Expense Reports', url: 'https://example.com/expense-reports' },
            { id: '3-1-3', label: 'Invoicing', url: 'https://example.com/invoicing' },
          ],
        },
      ],
    },
    {
      id: '4',
      label: 'MenuItem4',
      url: 'https://example.com/item4',
    },
    {
      id: '5',
      label: 'MenuItem5',
      url: 'https://example.com/item5',
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
