import React, { useState, useCallback } from 'react';
import { Button, Input, Checkbox, Flex, Text, Form, Dialog, AddIcon, CloseIcon, EditIcon, TrashCanIcon } from '@fluentui/react-northstar';
import { TriangleDownIcon, TriangleEndIcon, SearchIcon } from '@fluentui/react-icons-northstar';
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
                    className="full-width-input"

                    onChange={(_, data) => handleInputChange('label', data?.value || '')}
                    placeholder="Enter menu item label"
                    error={!!errors.label}
                />

                <Input
                    label="URL"
                    type="url"
                    value={formData.url}
                    className="full-width-input"
                    onChange={(_, data) => handleInputChange('url', data?.value || '')}
                    placeholder="https://example.com"
                    error={!!errors.url}
                />

                <Input
                    label="Icon"
                    value={formData.icon}
                    className="full-width-input"
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
                    return {
                        ...item, children: item.children.map(child =>
                            child.id === selectedParentId
                                ? { ...child, children: [...(child.children || []), sanitizedData] }
                                : child
                        )
                    };
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

    const handleDeleteClick = useCallback((item: MenuItem) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (!itemToDelete) return;

        dispatch(deleteMenuItem(itemToDelete.id));

        // Remove from items array and save to storage
        const removeItem = (items: MenuItem[]): MenuItem[] => {
            return items.filter(item => {
                if (item.id === itemToDelete.id) {
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

        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    }, [dispatch, items, itemToDelete]);

    const handleDeleteCancel = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    }, []);

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Helper function to check if an item or any of its children match the search term
    const itemMatchesSearch = (item: MenuItem, searchTerm: string): boolean => {
        if (!searchTerm) return true;

        const itemMatches = item.label.toLowerCase().includes(searchTerm.toLowerCase());
        if (itemMatches) return true;

        // Check if any children match
        if (item.children) {
            return item.children.some(child => itemMatchesSearch(child, searchTerm));
        }

        return false;
    };

    // Helper function to check if an item should be visible (either matches search or has children that match)
    const shouldShowItem = (item: MenuItem, searchTerm: string): boolean => {
        if (!searchTerm) return true;

        const itemMatches = item.label.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingChildren = item.children && item.children.some(child => itemMatchesSearch(child, searchTerm));

        return itemMatches || (hasMatchingChildren ?? false);
    };

    const renderMenuItems = (items: MenuItem[], level: number = 0): React.ReactNode[] => {
        return items
            .filter(item => shouldShowItem(item, searchTerm))
            .map(item => {
                const isMaxDepth = level >= 3; // 0-based indexing, so 3 means 4th level
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.id);

                return (
                    <div key={item.id} className="menu-item" style={{ marginLeft: level * 20 }}>
                        <Flex space="between" vAlign="center" padding="padding.medium" className="menu-item-content"
                            onClick={() => { if (hasChildren) { toggleExpanded(item.id); } }}>
                            <Flex vAlign="center" gap="gap.small">
                                {
                                    <Button
                                        icon={isExpanded ? <TriangleDownIcon /> : <TriangleEndIcon className={!hasChildren ? 'color-disabled' : ''} />}
                                        iconOnly
                                        className="expand-button"
                                        text
                                        disabled={!hasChildren}
                                    />}
                                <Flex vAlign="center" gap="gap.small">
                                    {item.icon && (
                                        <img 
                                            src={item.icon} 
                                            alt={`${item.label} icon`}
                                            className="menu-item-icon"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <Text>
                                        {item.label.length > 50 ? item.label.substring(0, 50) + '...' : item.label}
                                        {isMaxDepth && <Text className="depth-indicator"> (Max Depth)</Text>}
                                    </Text>
                                </Flex>
                            </Flex>
                            <Flex gap="gap.small">
                                <Button
                                    content="Add child"
                                    disabled={isMaxDepth}
                                    icon={<AddIcon />}
                                    primary
                                    title={isMaxDepth ? 'Maximum depth (4 levels) reached' : 'Add child item'}
                                    className="responsive-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isMaxDepth) {
                                            console.log('Add Child button clicked for item:', item.id);
                                            setSelectedParentId(item.id);
                                            setIsAddDialogOpen(true);
                                        }
                                    }}
                                />
                                <Button
                                    content="Edit"
                                    icon={<EditIcon />}
                                    title="Edit item"
                                    className="responsive-button"
                                    onClick={(e) => {
                                        console.log('Edit button clicked for item:', item.id);
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                        setIsEditDialogOpen(true);
                                    }}
                                />
                                <Button
                                    content="Delete"
                                    icon={<TrashCanIcon />}
                                    title="Delete item"
                                    className="responsive-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(item);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        {hasChildren && (isExpanded || searchTerm) && renderMenuItems(item.children!, level + 1)}
                    </div>
                );
            });
    };

    return (
        <div className={`settings ${className || ''}`}>
            <Flex column gap="gap.large">
                {/* Header Section */}
                <Flex column className="settings-header">
                    <Text size="large" weight="semibold" className="settings-title">
                        Configure Navigation
                    </Text>
                    <Text size="medium" className="settings-subtitle">
                        The Mega Menu can be configured here.
                    </Text>
                </Flex>

                {/* Add Navigation Entries Section */}

                <Flex column className="add-navigation-section">
                    <Text size="medium" weight="semibold" className="section-title">
                        Add Navigation entries.
                    </Text>
                    <Text size="small" className="section-description">
                        Here's an example of how a section can be used to group inputs.
                    </Text>

                    <Flex vAlign="center" className="controls-row">
                        <Button
                            primary
                            icon={<AddIcon />}
                            content="Add entry"
                            onClick={() => {
                                console.log('Add Root Item clicked');
                                setSelectedParentId(undefined);
                                setIsAddDialogOpen(true);
                            }}
                            styles={{
                                borderRadius: '4px',
                            }}
                        />
                        <Input
                            placeholder="Search for a navigation item"
                            value={searchTerm}
                            onChange={(_, data) => setSearchTerm(data?.value || '')}
                            icon={<SearchIcon />}
                            clearable
                            className="search-input"
                            styles={{
                                borderRadius: '4px',
                            }}
                        />
                    </Flex>
                </Flex>

                {/* Navigation Items List */}
                <div className="navigation-items-section">
                    <div className="menu-tree">
                        {renderMenuItems(items)}
                    </div>
                </div>

            </Flex>

            {/* Add Item Dialog */}
            <Dialog
                open={isAddDialogOpen}
                onOpen={() => setIsAddDialogOpen(true)}
                header="Add Menu Item"
                backdrop={true}
                headerAction={{
                    icon: <CloseIcon />,
                    title: 'Close',
                    onClick: () => setIsAddDialogOpen(false),
                }}
                styles={{
                    width: '400px',
                }}
                content={
                    <MenuItemForm
                        onSave={handleAddItem}
                        onCancel={() => setIsAddDialogOpen(false)}
                    />
                }
                onCancel={() => setIsAddDialogOpen(false)}
            />

            {/* Edit Item Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onOpen={() => setIsEditDialogOpen(true)}
                header="Edit Menu Item"
                backdrop={true}
                headerAction={{
                    icon: <CloseIcon />,
                    title: 'Close',
                    onClick: () => setIsEditDialogOpen(false),
                }}
                styles={{
                    width: '400px',
                }}
                content={
                    <MenuItemForm
                        item={selectedItem || undefined}
                        onSave={handleEditItem}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                }
                onCancel={() => setIsEditDialogOpen(false)}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpen={() => setIsDeleteDialogOpen(true)}
                header="Delete Menu Item"
                backdrop={true}
                headerAction={{
                    icon: <CloseIcon />,
                    title: 'Close',
                    onClick: handleDeleteCancel,
                }}
                content={
                    <Flex column gap="gap.medium" padding="padding.medium">
                        <Text>
                            Are you sure you want to delete "{itemToDelete?.label}"?
                        </Text>
                        <Text size="small" color="grey">
                            This action cannot be undone.
                        </Text>
                        <Flex gap="gap.small" vAlign="center">
                            <Button
                                content="Cancel"
                                onClick={handleDeleteCancel}
                            />
                            <Button
                                content="Delete"
                                primary
                                onClick={handleDeleteConfirm}
                                styles={{
                                    root: {
                                        backgroundColor: '#d13438',
                                        borderColor: '#d13438',
                                    },
                                    rootHovered: {
                                        backgroundColor: '#b71c1c',
                                        borderColor: '#b71c1c',
                                    },
                                }}
                            />
                        </Flex>
                    </Flex>
                }
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default Settings;
