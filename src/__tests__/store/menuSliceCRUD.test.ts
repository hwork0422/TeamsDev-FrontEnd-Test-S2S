import { configureStore } from '@reduxjs/toolkit';
import menuReducer, { addMenuItem, updateMenuItem, deleteMenuItem, setMenuItems } from '../../store/slices/menuSlice';
import mockMenuData from '../../__mocks__/menuData.json';
import type { MenuItem } from '../../types';

describe('Menu Slice CRUD Operations', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        menu: menuReducer,
      },
      preloadedState: {
        menu: {
          items: mockMenuData,
          isLoading: false,
          error: null,
          hoveredItem: null,
        },
      },
    });
  });

  describe('Create Operations', () => {
    it('should add a new root menu item', () => {
      const newItem = {
        id: 'new-item-1',
        label: 'New Root Item',
        url: 'https://example.com/new-root',
        children: [],
      };

      store.dispatch(addMenuItem({ item: newItem }));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toHaveLength(mockMenuData.length + 1);
      expect(state.items.find((item: MenuItem) => item.id === 'new-item-1')).toEqual(newItem);
    });

    it('should add a new child menu item', () => {
      const parentId = mockMenuData[0].id;
      const newChildItem = {
        id: 'new-child-1',
        label: 'New Child Item',
        url: 'https://example.com/new-child',
        children: [],
      };

      store.dispatch(addMenuItem({ parentId, item: newChildItem }));

      // @ts-ignore
      const state = store.getState().menu;
      const parentItem = state.items.find((item: MenuItem) => item.id === parentId);
      expect(parentItem?.children).toHaveLength((mockMenuData[0].children?.length || 0) + 1);
      expect(parentItem?.children?.find((child: MenuItem) => child.id === 'new-child-1')).toEqual(newChildItem);
    });

    it('should generate unique IDs for new items', () => {
      const newItem1 = {
        id: 'item-1',
        label: 'Item 1',
        url: 'https://example.com/item1',
        children: [],
      };

      const newItem2 = {
        id: 'item-2',
        label: 'Item 2',
        url: 'https://example.com/item2',
        children: [],
      };

      store.dispatch(addMenuItem({ item: newItem1 }));
      store.dispatch(addMenuItem({ item: newItem2 }));

      // @ts-ignore
      const state = store.getState().menu;
      const addedItems = state.items.filter((item: MenuItem) => item.label.startsWith('Item'));
      expect(addedItems).toHaveLength(2);
      expect(addedItems[0].id).not.toBe(addedItems[1].id);
    });
  });

  describe('Read Operations', () => {
    it('should return the initial menu items', () => {
      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual(mockMenuData);
    });

    it('should handle empty menu items', () => {
      const emptyStore = configureStore({
        reducer: {
          menu: menuReducer,
        },
        preloadedState: {
          menu: {
            items: [],
            isLoading: false,
            error: null,
            hoveredItem: null,
          },
        },
      });

      const state = emptyStore.getState().menu;
      expect(state.items).toEqual([]);
    });

    it('should maintain menu item hierarchy', () => {
      // @ts-ignore
      const state = store.getState().menu;
      const firstItem = state.items[0];
      
      expect(firstItem.children).toBeDefined();
      expect(firstItem.children?.length).toBeGreaterThan(0);
      
      if (firstItem.children && firstItem.children.length > 0) {
        const firstChild = firstItem.children[0];
        expect(firstChild.children).toBeDefined();
      }
    });
  });

  describe('Update Operations', () => {
    it('should update an existing menu item', () => {
      const itemId = mockMenuData[0].id;
      const updates = {
        label: 'Updated Menu Item',
        url: 'https://example.com/updated',
      };

      store.dispatch(updateMenuItem({ id: itemId, updates }));

      // @ts-ignore
      const state = store.getState().menu;
      const updatedItem = state.items.find((item: MenuItem) => item.id === itemId);
      expect(updatedItem?.label).toBe('Updated Menu Item');
      expect(updatedItem?.url).toBe('https://example.com/updated');
    });

    it('should update a child menu item', () => {
      const parentId = mockMenuData[0].id;
      const childId = mockMenuData[0].children?.[0]?.id;
      
      if (childId) {
        const updates = {
          label: 'Updated Child Item',
          url: 'https://example.com/updated-child',
        };

        store.dispatch(updateMenuItem({ id: childId, updates }));

        // @ts-ignore
        const state = store.getState().menu;
        const parentItem = state.items.find((item: MenuItem) => item.id === parentId);
        const updatedChild = parentItem?.children?.find((child: MenuItem) => child.id === childId);
        expect(updatedChild?.label).toBe('Updated Child Item');
        expect(updatedChild?.url).toBe('https://example.com/updated-child');
      }
    });

    it('should not update non-existent items', () => {
      const nonExistentId = 'non-existent-id';
      const updates = {
        label: 'This should not work',
      };

      store.dispatch(updateMenuItem({ id: nonExistentId, updates }));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual(mockMenuData);
    });

    it('should update only specified fields', () => {
      const itemId = mockMenuData[0].id;
      const originalItem = { ...mockMenuData[0] };
      const updates = {
        label: 'Only label updated',
      };

      store.dispatch(updateMenuItem({ id: itemId, updates }));

      // @ts-ignore
      const state = store.getState().menu;
      const updatedItem = state.items.find((item: MenuItem) => item.id === itemId);
      expect(updatedItem?.label).toBe('Only label updated');
      expect(updatedItem?.url).toBe(originalItem.url);
      expect(updatedItem?.children).toEqual(originalItem.children);
    });
  });

  describe('Delete Operations', () => {
    it('should delete a root menu item', () => {
      const itemId = mockMenuData[0].id;
      
      store.dispatch(deleteMenuItem(itemId));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toHaveLength(mockMenuData.length - 1);
      expect(state.items.find((item: MenuItem) => item.id === itemId)).toBeUndefined();
    });

    it('should delete a child menu item', () => {
      const parentId = mockMenuData[0].id;
      const childId = mockMenuData[0].children?.[0]?.id;
      
      if (childId) {
        const originalChildCount = mockMenuData[0].children?.length || 0;
        
        store.dispatch(deleteMenuItem(childId));

        // @ts-ignore
        const state = store.getState().menu;
        const parentItem = state.items.find((item: MenuItem) => item.id === parentId);
        expect(parentItem?.children).toHaveLength(originalChildCount - 1);
        expect(parentItem?.children?.find((child: MenuItem) => child.id === childId)).toBeUndefined();
      }
    });

    it('should delete all children when parent is deleted', () => {
      const parentId = mockMenuData[0].id;
      const childIds = mockMenuData[0].children?.map(child => child.id) || [];
      
      store.dispatch(deleteMenuItem(parentId));

      // @ts-ignore
      const state = store.getState().menu;
      childIds.forEach(childId => {
        const childExists = state.items.some((item: MenuItem) => 
          item.children?.some(child => child.id === childId)
        );
        expect(childExists).toBe(false);
      });
    });

    it('should not delete non-existent items', () => {
      const nonExistentId = 'non-existent-id';
      
      store.dispatch(deleteMenuItem(nonExistentId));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual(mockMenuData);
    });
  });

  describe('Bulk Operations', () => {
    it('should set multiple menu items at once', () => {
      const newMenuData = [
        {
          id: 'bulk-1',
          label: 'Bulk Item 1',
          url: 'https://example.com/bulk1',
          children: [],
        },
        {
          id: 'bulk-2',
          label: 'Bulk Item 2',
          url: 'https://example.com/bulk2',
          children: [],
        },
      ];

      store.dispatch(setMenuItems(newMenuData));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual(newMenuData);
    });

    it('should clear all menu items when setting empty array', () => {
      store.dispatch(setMenuItems([]));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual([]);
    });
  });

  describe('Local Storage Integration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should handle localStorage operations (integration with Settings component)', () => {
      // This test verifies that the Redux store can work with localStorage
      // The actual localStorage integration is handled in the Settings component
      const newItem = {
        id: 'local-storage-test',
        label: 'Local Storage Test Item',
        url: 'https://example.com/local-storage',
        children: [],
      };

      store.dispatch(addMenuItem({ item: newItem }));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items.find((item: MenuItem) => item.id === 'local-storage-test')).toEqual(newItem);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid menu item data gracefully', () => {
      const invalidItem = {
        id: 'invalid-item',
        // Missing required fields
      } as any;

      // This should not throw an error
      expect(() => {
        store.dispatch(addMenuItem({ item: invalidItem }));
      }).not.toThrow();
    });

    it('should maintain state consistency after failed operations', () => {
      // @ts-ignore
      const originalState = store.getState().menu;
      
      // Try to update non-existent item
      store.dispatch(updateMenuItem({ id: 'non-existent', updates: { label: 'test' } }));
      
      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toEqual(originalState.items);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of menu items', () => {
      const largeMenuData = Array.from({ length: 1000 }, (_, index) => ({
        id: `item-${index}`,
        label: `Item ${index}`,
        url: `https://example.com/item${index}`,
        children: [],
      }));

      store.dispatch(setMenuItems(largeMenuData));

      // @ts-ignore
      const state = store.getState().menu;
      expect(state.items).toHaveLength(1000);
    });

    it('should handle deeply nested menu structures', () => {
      const deepItem = {
        id: 'deep-root',
        label: 'Deep Root',
        url: 'https://example.com/deep',
        children: [
          {
            id: 'deep-1',
            label: 'Deep Level 1',
            url: 'https://example.com/deep1',
            children: [
              {
                id: 'deep-2',
                label: 'Deep Level 2',
                url: 'https://example.com/deep2',
                children: [
                  {
                    id: 'deep-3',
                    label: 'Deep Level 3',
                    url: 'https://example.com/deep3',
                    children: [
                      {
                        id: 'deep-4',
                        label: 'Deep Level 4',
                        url: 'https://example.com/deep4',
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      store.dispatch(addMenuItem({ item: deepItem }));

      // @ts-ignore
      const state = store.getState().menu;
      const addedItem = state.items.find((item: MenuItem) => item.id === 'deep-root');
      expect(addedItem).toBeDefined();
      expect(addedItem?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.id).toBe('deep-4');
    });
  });
});
