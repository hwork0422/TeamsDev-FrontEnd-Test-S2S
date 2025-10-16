import React from 'react';
import { ReactMegaMenu } from 'react-mega-menu';
import { Button, Flex } from '@fluentui/react-northstar';
import { MenuIcon, MoreIcon } from '@fluentui/react-icons-northstar';
import { useAppSelector } from '../../hooks/redux';
import type { MenuItem } from '../../types';
import { TeamsService } from '../../services/teamsService';
import './MegaMenu.css';

interface ReactMegaMenuProps {
  className?: string;
  onSettingsClick?: () => void;
  onHomeClick?: () => void;
}

const MegaMenuComponent: React.FC<ReactMegaMenuProps> = ({ className, onSettingsClick, onHomeClick }) => {
  const { items } = useAppSelector((state) => state.menu);
  const [selectedSubItem, setSelectedSubItem] = React.useState<string | null>(null);

  const handleItemClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const handleSubItemClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const handleSectionClick = async (item: MenuItem) => {
    if (item.url) {
      await TeamsService.openLink(item.url, item.openInTeams);
    }
  };

  const handleSubItemHover = (subItemId: string) => {
    setSelectedSubItem(subItemId);
  };

  // Set first sub-item as selected when menu opens
  React.useEffect(() => {
    if (items.length > 0 && items[0].children && items[0].children.length > 0) {
      setSelectedSubItem(items[0].children[0].id);
    }
  }, [items]);

  // Transform our menu items to react-mega-menu format with 4-level structure
  const transformMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const menuItem = {
        label: item.label.length > 50 ? item.label.substring(0, 50) + '...' : item.label,
        key: item.id,
        items: item.children && item.children.length > 0 ? (
          <div className="mega-menu-content">
            {/* Level 2: Left vertical sub-menu panel */}
            <div className="mega-menu-left-panel">
              {item.children.map((child) => {
                return (
                <div 
                  key={child.id} 
                  className="mega-menu-sub-item"
                  onMouseEnter={() => handleSubItemHover(child.id)}
                >
                  <Button
                    className={`mega-menu-sub-item-button`}
                    text
                    data-selected={selectedSubItem === child.id ? 'true' : 'false'}
                    design={{
                      paddingLeft: '16px !important',
                    }}
                    onClick={() => handleSubItemClick(child)}
                    styles={{
                      border: 'none !important',
                      fontWeight: 600,
                    }}
                  >
                    <Flex vAlign="center" gap="gap.small">
                      {child.icon && (
                        <img 
                          src={child.icon} 
                          alt={`${child.label} icon`}
                          className="mega-menu-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      {child.label.length > 50 ? child.label.substring(0, 50) + '...' : child.label}
                    </Flex>
                  </Button>
                </div>
              );
              })}
            </div>
            
            {/* Level 3 & 4: Right content panel with columns - show content for selected sub-item */}
            <div className="mega-menu-right-panel">
              {(() => {
                const selectedChild = item.children.find(child => child.id === selectedSubItem) || item.children[0];
                return selectedChild.children && selectedChild.children.map((subItem) => (
                  <div key={subItem.id} className="mega-menu-column">
                    <div className="mega-menu-section-title" onClick={() => handleSectionClick(subItem)}>
                      <Flex vAlign="center" gap="gap.small">
                        {subItem.icon && (
                          <img 
                            src={subItem.icon} 
                            alt={`${subItem.label} icon`}
                            className="mega-menu-icon"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        {subItem.label.length > 50 ? subItem.label.substring(0, 50) + '...' : subItem.label}
                      </Flex>
                    </div>
                    {subItem.children && subItem.children.map((subSubItem) => (
                      <div key={subSubItem.id} className="mega-menu-link">
                        <Button
                          className="mega-menu-link-button"
                          onClick={() => handleItemClick(subSubItem)}
                          text
                        >
                          <Flex vAlign="center" gap="gap.small">
                            {subSubItem.icon && (
                              <img 
                                src={subSubItem.icon} 
                                alt={`${subSubItem.label} icon`}
                                className="mega-menu-icon"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            {subSubItem.label.length > 20 ? subSubItem.label.substring(0, 20) + '...' : subSubItem.label}
                          </Flex>
                        </Button>
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : <></>,
      };
      return menuItem;
    });
  };

  const menuData = transformMenuItems(items);

  return (
    <div className={`react-mega-menu-container ${className || ''}`}>
      <div className="react-mega-menu-nav">
        <div className="react-mega-menu-left">
          <Button
            title="Home"
            onClick={onHomeClick}
            className="react-mega-menu-left-button"
            icon={<MenuIcon />}
            iconOnly
          />
        </div>
        
        <div className="react-mega-menu-center">
          <ReactMegaMenu
            data={menuData}
            tolerance={100}
            styleConfig={{
              containerProps: {
                style: {
                  position: 'relative',
                }
              },
              menuProps: {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0',
                }
              },
              menuItemProps: {
                style: {
                  padding: '12px 0',
                  margin: '0',
                  cursor: 'pointer',
                }
              },
              contentProps: {
                style: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e1dfdd',
                  borderRadius: '4px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  padding: '0px',
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  zIndex: '1000',
                  marginTop: '2px',
                  minHeight: '100px',
                },
              }
            }}
            onExit={() => {
              console.log('Menu exited');
            }}
          />
        </div>
        
        <div className="react-mega-menu-right">
          <Button
            title="Settings"
            onClick={onSettingsClick}
            className="react-mega-menu-right-button"
            icon={<MoreIcon />}
            iconOnly
          />
        </div>
      </div>
    </div>
  );
};

export default MegaMenuComponent;
