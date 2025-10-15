import React, { useState, useEffect } from 'react';
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

  const handleHamburgerClick = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isHamburgerOpen && !target.closest('.mega-menu-left')) {
        setIsHamburgerOpen(false);
      }
    };

    if (isHamburgerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHamburgerOpen]);

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
                    <button
                      className="mega-menu-link-button"
                      onClick={() => handleItemClick(subSubItem)}
                    >
                      {subSubItem.label}
                    </button>
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
          <button 
            className={`hamburger-menu ${isHamburgerOpen ? 'active' : ''}`} 
            title="Menu"
            onClick={handleHamburgerClick}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          {isHamburgerOpen && (
            <div className="hamburger-dropdown">
              <button onClick={() => handleHamburgerMenuClick('home')} className="hamburger-item">
                🏠 Home
              </button>
              <button onClick={() => handleHamburgerMenuClick('settings')} className="hamburger-item">
                ⚙️ Settings
              </button>
              <button onClick={() => handleHamburgerMenuClick('theme')} className="hamburger-item">
                🌙 Theme ({currentTheme})
              </button>
            </div>
          )}
        </div>
        
        <div className="mega-menu-center">
          <div className="mega-menu-items">
            {items.map((item) => (
              <div
                key={item.id}
                className={`mega-menu-nav-item ${activeItem === item.id ? 'active' : ''}`}
                onMouseEnter={() => handleMouseEnter(item.id)}
              >
                <button
                  className="mega-menu-nav-button"
                  onClick={() => handleItemClick(item)}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mega-menu-right">
          <button className="settings-menu" title="Settings" onClick={onSettingsClick}>
            <span className="three-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </button>
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
