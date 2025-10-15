import React, { useState, useCallback } from 'react';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Label *</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            placeholder="Enter menu item label"
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: errors.label ? '1px solid #d13438' : '1px solid #d1d1d1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {errors.label && <div style={{ color: '#d13438', fontSize: '12px', marginTop: '4px' }}>{errors.label}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>URL</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: errors.url ? '1px solid #d13438' : '1px solid #d1d1d1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {errors.url && <div style={{ color: '#d13438', fontSize: '12px', marginTop: '4px' }}>{errors.url}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Icon</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            placeholder="Icon name (optional)"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d1d1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.openInTeams}
              onChange={(e) => handleInputChange('openInTeams', e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontWeight: '600' }}>Open in Teams</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button 
            type="submit" 
            style={{
              backgroundColor: '#0078d4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {item ? 'Update' : 'Add'} Item
          </button>
          <button 
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'white',
              color: '#323130',
              border: '1px solid #d1d1d1',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
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
            <div className="menu-item-content">
              <span className="menu-item-label">
                {item.label}
                {isMaxDepth && <span className="depth-indicator"> (Max Depth)</span>}
              </span>
              <div className="menu-item-actions">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => {
                    console.log('Edit button clicked for item:', item.id);
                    setSelectedItem(item);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
                <button
                  className={`btn btn-small ${isMaxDepth ? 'btn-disabled' : 'btn-secondary'}`}
                  onClick={() => {
                    if (!isMaxDepth) {
                      console.log('Add Child button clicked for item:', item.id);
                      setSelectedParentId(item.id);
                      setIsAddDialogOpen(true);
                    }
                  }}
                  disabled={isMaxDepth}
                  title={isMaxDepth ? 'Maximum depth (4 levels) reached' : 'Add child item'}
                >
                  Add Child
                </button>
              </div>
            </div>
            {item.children && item.children.length > 0 && renderMenuItems(item.children, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className={`settings ${className || ''}`}>
      <div className="settings-container">
        <div className="settings-header">
          <h2 className="settings-title">Configure Navigations</h2>
          <button 
            className="settings-close"
            onClick={() => {
              // This will be handled by the parent component
              window.location.reload(); // Temporary solution
            }}
          >
            ×
          </button>
        </div>

        <div className="settings-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="search-clear"
              >
                ×
              </button>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log('Add Root Item clicked');
              setSelectedParentId(undefined);
              setIsAddDialogOpen(true);
            }}
          >
            Add Root Item
          </button>
        </div>

        <div className="menu-tree">
          {renderMenuItems(items)}
        </div>
      </div>

        {/* Add Item Modal */}
        {isAddDialogOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">
                Add Menu Item
              </h3>
              <MenuItemForm
                onSave={handleAddItem}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {isEditDialogOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">
                Edit Menu Item
              </h3>
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
