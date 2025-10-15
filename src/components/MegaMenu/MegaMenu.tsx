import React, { useState, useRef } from 'react';
import { Button } from '@fluentui/react-northstar';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setHoveredItem } from '../../store/slices/menuSlice';
import type { MenuItem } from '../../types';
import { TeamsService } from '../../services/teamsService';
import './MegaMenu.css';

interface MegaMenuProps {
  className?: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.menu);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (itemId: string) => {
    setActiveItem(itemId);
    dispatch(setHoveredItem(itemId));
  };

  const handleMouseLeave = () => {
    setActiveItem(null);
    dispatch(setHoveredItem(null));
  };

  const handleItemClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeItem === item.id;

    if (level === 0) {
      // Top level items
      return (
        <div
          key={item.id}
          className={`mega-menu-item level-${level}`}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={handleMouseLeave}
          role="menuitem"
          tabIndex={0}
          aria-haspopup={hasChildren ? 'true' : 'false'}
          aria-expanded={isActive ? 'true' : 'false'}
        >
          <Button
            icon={item.icon}
            onClick={() => handleItemClick(item)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
            className="mega-menu-button"
          >
            {item.label}
          </Button>
          {hasChildren && isActive && (
            <div className="mega-menu-dropdown" role="menu">
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      // Sub-level items
      return (
        <div
          key={item.id}
          className={`mega-menu-item level-${level}`}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={handleMouseLeave}
          role="menuitem"
          tabIndex={0}
          aria-haspopup={hasChildren ? 'true' : 'false'}
          aria-expanded={isActive ? 'true' : 'false'}
        >
          <Button
            icon={item.icon}
            onClick={() => handleItemClick(item)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
            className="mega-menu-button sub-level"
          >
            {item.label}
          </Button>
          {hasChildren && isActive && (
            <div className="mega-menu-dropdown" role="menu">
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div
      ref={menuRef}
      className={`mega-menu ${className || ''}`}
      role="menubar"
      aria-label="Main navigation menu"
    >
      {items.map((item) => renderMenuItem(item))}
    </div>
  );
};

export default MegaMenu;
