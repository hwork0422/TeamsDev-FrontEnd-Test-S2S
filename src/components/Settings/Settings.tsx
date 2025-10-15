import React, { useState, useCallback } from 'react';
import {
  Button,
  Input,
  Checkbox,
  Text,
  Flex,
  Divider,
} from '@fluentui/react-northstar';
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
    <form onSubmit={handleSubmit}>
      <Flex column gap="gap.medium">
        <Input
          label="Label"
          value={formData.label}
          onChange={(_, data: any) => handleInputChange('label', data?.value || '')}
          error={!!errors.label}
          required
          placeholder="Enter menu item label"
        />

        <Input
          label="URL"
          value={formData.url}
          onChange={(_, data: any) => handleInputChange('url', data?.value || '')}
          error={!!errors.url}
          placeholder="https://example.com"
        />

        <Input
          label="Icon"
          value={formData.icon}
          onChange={(_, data: any) => handleInputChange('icon', data?.value || '')}
          placeholder="Icon name (optional)"
        />

        <Checkbox
          label="Open in Teams"
          checked={formData.openInTeams}
          onChange={(_, data: any) => handleInputChange('openInTeams', data?.checked || false)}
        />

        <Flex gap="gap.small">
          <Button type="submit" primary>
            {item ? 'Update' : 'Add'} Item
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Flex>
      </Flex>
    </form>
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

  const handleAddItem = useCallback((data: MenuItemFormData) => {
    console.log('Adding item:', data);
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
      .map(item => (
        <div key={item.id} style={{ marginLeft: level * 20, marginBottom: 8 }}>
          <Flex space="between" vAlign="center" padding="padding.medium" style={{ border: '1px solid #ccc', borderRadius: 4 }}>
            <Text>{item.label}</Text>
            <Flex gap="gap.small">
              <Button
                size="small"
                onClick={() => {
                  console.log('Edit button clicked for item:', item.id);
                  setSelectedItem(item);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </Button>
              <Button
                size="small"
                onClick={() => {
                  console.log('Add Child button clicked for item:', item.id);
                  setSelectedParentId(item.id);
                  setIsAddDialogOpen(true);
                }}
              >
                Add Child
              </Button>
            </Flex>
          </Flex>
          {item.children && item.children.length > 0 && renderMenuItems(item.children, level + 1)}
        </div>
      ));
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
              onChange={(_, data: any) => setSearchTerm(data?.value || '')}
              icon="search"
              clearable
            />
            <Button
              primary
              onClick={() => {
                console.log('Add Root Item clicked');
                setSelectedParentId(undefined);
                setIsAddDialogOpen(true);
              }}
            >
              Add Root Item
            </Button>
          </Flex>

          <Divider />

          <div className="menu-tree">
            {renderMenuItems(items)}
          </div>
        </Flex>

        {/* Add Item Modal */}
        {isAddDialogOpen && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: 24, 
              borderRadius: 8, 
              minWidth: 400,
              maxWidth: 600
            }}>
              <Text size="large" weight="semibold" style={{ marginBottom: 16 }}>
                Add Menu Item
              </Text>
              <MenuItemForm
                onSave={handleAddItem}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {isEditDialogOpen && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: 24, 
              borderRadius: 8, 
              minWidth: 400,
              maxWidth: 600
            }}>
              <Text size="large" weight="semibold" style={{ marginBottom: 16 }}>
                Edit Menu Item
              </Text>
              <MenuItemForm
                item={selectedItem || undefined}
                onSave={handleEditItem}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
  );
};

export default Settings;
