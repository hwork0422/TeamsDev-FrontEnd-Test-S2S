import React, { useState } from 'react';
import { Button, Text } from '@fluentui/react-northstar';
import { useAppSelector } from '../../hooks/redux';
import type { MenuItem } from '../../types';
import { TeamsService } from '../../services/teamsService';
import './MegaMenu.css';

interface MegaMenuProps {
  className?: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ className }) => {
  const { items } = useAppSelector((state) => state.menu);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleMouseEnter = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleMouseLeave = () => {
    setActiveItem(null);
  };

  const handleItemClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const renderMegaMenuContent = (item: MenuItem) => {
    if (!item.children || item.children.length === 0) return null;

    return (
      <div className="mega-menu-content">
        {item.children.map((child, index) => (
          <div key={child.id} className="mega-menu-column">
            <Text size="large" weight="semibold" className="mega-menu-section-title">
              {child.label}
            </Text>
            {child.children && child.children.map((subItem) => (
              <div key={subItem.id} className="mega-menu-link">
                <Button
                  text
                  content={subItem.label}
                  onClick={() => handleItemClick(subItem)}
                  className="mega-menu-link-button"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`mega-menu-container ${className || ''}`}>
      <div className="mega-menu-nav">
        {items.map((item) => (
          <div
            key={item.id}
            className={`mega-menu-nav-item ${activeItem === item.id ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              text
              content={item.label}
              onClick={() => handleItemClick(item)}
              className="mega-menu-nav-button"
            />
          </div>
        ))}
      </div>
      
      {activeItem && (
        <div 
          className="mega-menu-panel"
          onMouseEnter={() => handleMouseEnter(activeItem)}
          onMouseLeave={handleMouseLeave}
        >
          {items.find(item => item.id === activeItem) && 
            renderMegaMenuContent(items.find(item => item.id === activeItem)!)
          }
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
