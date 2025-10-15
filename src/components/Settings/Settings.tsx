import React, { useState, useCallback } from 'react';
import { Button, Input, Checkbox, Flex, Text, Divider, Form, Dialog } from '@fluentui/react-northstar';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addMenuItem, updateMenuItem, deleteMenuItem } from '../../store/slices/menuSlice';
import type { MenuItem, MenuItemFormData } from '../../types';
import { StorageService } from '../../services/storageService';
import './Settings.css';

interface SettingsProps {
  className?: string;
}

interface MenuItemFormProps {
  item?: MenuItem;
  parentId?: string;
  onSave: (data: MenuItemFormData) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    label: item?.label || '',
    url: item?.url || '',
    icon: item?.icon || '',
    openInTeams: item?.openInTeams || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    if (validateForm()) {
      console.log('Form is valid, calling onSave');
      onSave(formData);
    } else {
      console.log('Form validation failed');
    }
  };

  const handleInputChange = (field: keyof MenuItemFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Flex column gap="gap.medium">
        <Input
          label="Label"
          required
          value={formData.label}
          onChange={(_, data) => handleInputChange('label', data?.value || '')}
          placeholder="Enter menu item label"
          error={!!errors.label}
        />

        <Input
          label="URL"
          type="url"
          value={formData.url}
          onChange={(_, data) => handleInputChange('url', data?.value || '')}
          placeholder="https://example.com"
          error={!!errors.url}
        />

        <Input
          label="Icon"
          value={formData.icon}
          onChange={(_, data) => handleInputChange('icon', data?.value || '')}
          placeholder="Icon name (optional)"
        />

        <Checkbox
          label="Open in Teams"
          checked={formData.openInTeams}
          onChange={(_, data) => handleInputChange('openInTeams', data?.checked || false)}
        />

        <Flex gap="gap.small">
          <Button
            type="submit"
            primary
            content={item ? 'Update Item' : 'Add Item'}
          />
          <Button
            onClick={onCancel}
            content="Cancel"
          />
        </Flex>
      </Flex>
    </Form>
  );
};

const Settings: React.FC<SettingsProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.menu);
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to calculate the depth of a menu item
  const getItemDepth = (items: MenuItem[], targetId: string, currentDepth: number = 0): number => {
    for (const item of items) {
      if (item.id === targetId) {
        return currentDepth;
      }
      if (item.children) {
        const childDepth = getItemDepth(item.children, targetId, currentDepth + 1);
        if (childDepth !== -1) {
          return childDepth;
        }
      }
    }
    return -1;
  };

  const handleAddItem = useCallback((data: MenuItemFormData) => {
    console.log('Adding item:', data);
    
    // Check if adding this item would exceed the 4-level limit
    if (selectedParentId) {
      const parentDepth = getItemDepth(items, selectedParentId);
      if (parentDepth >= 3) { // 0-based indexing, so 3 means 4th level
        alert('Cannot add more than 4 levels of navigation. Maximum depth reached.');
        return;
      }
    }

    const sanitizedData = StorageService.sanitizeMenuItem({
      id: Date.now().toString(),
      ...data,
    } as MenuItem);

    dispatch(addMenuItem({ parentId: selectedParentId, item: sanitizedData }));

    // Update the items array and save to storage
    const updatedItems = selectedParentId
      ? items.map(item => {
          if (item.id === selectedParentId) {
            return { ...item, children: [...(item.children || []), sanitizedData] };
          }
          if (item.children) {
            return { ...item, children: item.children.map(child =>
              child.id === selectedParentId
                ? { ...child, children: [...(child.children || []), sanitizedData] }
                : child
            )};
          }
          return item;
        })
      : [...items, sanitizedData];

    StorageService.saveMenuItems(updatedItems);

    setIsAddDialogOpen(false);
    setSelectedParentId(undefined);
  }, [dispatch, items, selectedParentId]);

  const handleEditItem = useCallback((data: MenuItemFormData) => {
    if (!selectedItem) return;

    console.log('Editing item:', selectedItem.id, data);
    const sanitizedData = StorageService.sanitizeMenuItem({
      ...selectedItem,
      ...data,
    });

    dispatch(updateMenuItem({ id: selectedItem.id, updates: sanitizedData }));
    
    // Update the items array and save to storage
    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === selectedItem.id) {
          return sanitizedData;
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    
    const updatedItems = updateItems(items);
    StorageService.saveMenuItems(updatedItems);
    
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  }, [dispatch, items, selectedItem]);

  const handleDeleteItem = useCallback((itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteMenuItem(itemId));
      
      // Remove from items array and save to storage
      const removeItem = (items: MenuItem[]): MenuItem[] => {
        return items.filter(item => {
          if (item.id === itemId) {
            return false;
          }
          if (item.children) {
            return { ...item, children: removeItem(item.children) };
          }
          return true;
        });
      };
      
      const updatedItems = removeItem(items);
      StorageService.saveMenuItems(updatedItems);
    }
  }, [dispatch, items]);

  const renderMenuItems = (items: MenuItem[], level: number = 0): React.ReactNode[] => {
    return items
      .filter(item => 
        !searchTerm || 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(item => {
        const isMaxDepth = level >= 3; // 0-based indexing, so 3 means 4th level
        return (
          <div key={item.id} className="menu-item" style={{ marginLeft: level * 20 }}>
            <Flex space="between" vAlign="center" padding="padding.medium" className="menu-item-content">
              <Text>
                {item.label}
                {isMaxDepth && <Text className="depth-indicator"> (Max Depth)</Text>}
              </Text>
              <Flex gap="gap.small">
                <Button
                  size="small"
                  content="Edit"
                  onClick={() => {
                    console.log('Edit button clicked for item:', item.id);
                    setSelectedItem(item);
                    setIsEditDialogOpen(true);
                  }}
                />
                <Button
                  size="small"
                  content="Delete"
                  onClick={() => handleDeleteItem(item.id)}
                />
                <Button
                  size="small"
                  content="Add Child"
                  disabled={isMaxDepth}
                  title={isMaxDepth ? 'Maximum depth (4 levels) reached' : 'Add child item'}
                  onClick={() => {
                    if (!isMaxDepth) {
                      console.log('Add Child button clicked for item:', item.id);
                      setSelectedParentId(item.id);
                      setIsAddDialogOpen(true);
                    }
                  }}
                />
              </Flex>
            </Flex>
            {item.children && item.children.length > 0 && renderMenuItems(item.children, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className={`settings ${className || ''}`}>
      <Flex column gap="gap.large">
        <Text size="large" weight="semibold">
          Configure Navigations
        </Text>

        <Flex space="between" vAlign="center">
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data?.value || '')}
            icon="search"
            clearable
          />
          <Button
            primary
            content="Add Root Item"
            onClick={() => {
              console.log('Add Root Item clicked');
              setSelectedParentId(undefined);
              setIsAddDialogOpen(true);
            }}
          />
        </Flex>

        <Divider />

        <div className="menu-tree">
          {renderMenuItems(items)}
        </div>
      </Flex>

        {/* Add Item Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(_, data) => setIsAddDialogOpen(data.open)}
          header="Add Menu Item"
          content={
            <MenuItemForm
              onSave={handleAddItem}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          }
        />

        {/* Edit Item Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(_, data) => setIsEditDialogOpen(data.open)}
          header="Edit Menu Item"
          content={
            <MenuItemForm
              item={selectedItem || undefined}
              onSave={handleEditItem}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          }
        />
      </div>
  );
};

export default Settings;
