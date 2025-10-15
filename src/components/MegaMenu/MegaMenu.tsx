import React, { useState, useEffect } from 'react';
import { Button, Menu } from '@fluentui/react-northstar';
import { useAppSelector } from '../../hooks/redux';
import type { MenuItem } from '../../types';
import { TeamsService } from '../../services/teamsService';
import './MegaMenu.css';

interface MegaMenuProps {
  className?: string;
  onSettingsClick?: () => void;
  onHomeClick?: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ className, onSettingsClick, onHomeClick }) => {
  const { items } = useAppSelector((state) => state.menu);
  const { currentTheme } = useAppSelector((state) => state.theme);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [hamburgerTimeout, setHamburgerTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (itemId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveItem(itemId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveItem(null);
    }, 150); // Small delay to prevent flickering
    setHoverTimeout(timeout);
  };

  const handleItemClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const handleHamburgerMouseEnter = () => {
    if (hamburgerTimeout) {
      clearTimeout(hamburgerTimeout);
      setHamburgerTimeout(null);
    }
    setIsHamburgerOpen(true);
  };

  const handleHamburgerMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHamburgerOpen(false);
    }, 150); // Small delay to prevent flickering
    setHamburgerTimeout(timeout);
  };

  const handleHamburgerMenuClick = (action: string) => {
    setIsHamburgerOpen(false);
    
    switch (action) {
      case 'home':
        // Navigate to home/main page
        onHomeClick?.();
        break;
      case 'settings':
        onSettingsClick?.();
        break;
      case 'theme':
        // Cycle through themes
        const themes = ['light', 'dark', 'contrast'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        document.documentElement.setAttribute('data-theme', nextTheme);
        break;
      default:
        break;
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (hamburgerTimeout) {
        clearTimeout(hamburgerTimeout);
      }
    };
  }, [hoverTimeout, hamburgerTimeout]);


  const renderMegaMenuContent = (item: MenuItem) => {
    if (!item.children || item.children.length === 0) return null;

    return (
      <div className="mega-menu-content">
        {item.children.map((child, index) => (
          <div key={child.id} className="mega-menu-column">
            <div className="mega-menu-section-title">
              {child.label}
            </div>
            {child.children && child.children.map((subItem) => (
              <div key={subItem.id} className="mega-menu-subsection">
                <div className="mega-menu-subsection-title">
                  {subItem.label}
                </div>
                {subItem.children && subItem.children.map((subSubItem) => (
                  <div key={subSubItem.id} className="mega-menu-link">
                    <Button
                      className="mega-menu-link-button"
                      onClick={() => handleItemClick(subSubItem)}
                      content={subSubItem.label}
                      text
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`mega-menu-container ${className || ''}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mega-menu-nav">
        <div className="mega-menu-left">
          <div 
            className="hamburger-container"
            onMouseEnter={handleHamburgerMouseEnter}
            onMouseLeave={handleHamburgerMouseLeave}
          >
            <Button 
              className={`hamburger-menu ${isHamburgerOpen ? 'active' : ''}`} 
              title="Menu"
              icon="menu"
            />
            
            {isHamburgerOpen && (
              <div className="hamburger-dropdown">
                <Button 
                  onClick={() => handleHamburgerMenuClick('home')} 
                  className="hamburger-item"
                  content="🏠 Home"
                  text
                />
                <Button 
                  onClick={() => handleHamburgerMenuClick('settings')} 
                  className="hamburger-item"
                  content="⚙️ Settings"
                  text
                />
                <Button 
                  onClick={() => handleHamburgerMenuClick('theme')} 
                  className="hamburger-item"
                  content={`🌙 Theme (${currentTheme})`}
                  text
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mega-menu-center">
          <Menu
            items={items.map((item) => ({
              key: item.id,
              content: item.label,
              onMouseEnter: () => handleMouseEnter(item.id),
              onClick: () => handleItemClick(item),
              className: activeItem === item.id ? 'active' : '',
            }))}
            className="mega-menu-items"
            underlined
          />
        </div>
        
        <div className="mega-menu-right">
          <Button 
            className="settings-menu" 
            title="Settings" 
            onClick={onSettingsClick}
            icon="settings"
          />
        </div>
      </div>
      
      {activeItem && (
        <div 
          className="mega-menu-panel"
          onMouseEnter={() => handleMouseEnter(activeItem)}
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
