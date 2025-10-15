import React, { useState, useEffect } from 'react';
import { Button, Flex } from '@fluentui/react-northstar';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setTheme, setTeamsTheme } from '../../store/slices/themeSlice';
import { setUser, setInitialized } from '../../store/slices/userSlice';
import { setMenuItems } from '../../store/slices/menuSlice';
import { TeamsService } from '../../services/teamsService';
import { StorageService } from '../../services/storageService';
import MegaMenu from '../MegaMenu/MegaMenu';
import Settings from '../Settings/Settings';
import './Layout.css';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTheme } = useAppSelector((state) => state.theme);
  const { currentUser, isInitialized } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load menu items from localStorage
        const savedItems = StorageService.loadMenuItems();
        if (savedItems) {
          dispatch(setMenuItems(savedItems));
        }

        // Initialize Teams integration
        const isRunningInTeams = TeamsService.isRunningInTeams();
        dispatch(setTeamsTheme(isRunningInTeams));

        if (isRunningInTeams) {
          const teamsContext = await TeamsService.getContext();
          if (teamsContext) {
            dispatch(setTheme(teamsContext.theme));
            dispatch(setUser(teamsContext.user));
            
            // Register theme change handler
            await TeamsService.registerThemeChangeHandler((theme) => {
              dispatch(setTheme(theme));
            });
          }
        } else {
          // Default theme for standalone mode
          dispatch(setTheme('light'));
        }

        dispatch(setInitialized(true));
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dispatch(setInitialized(true)); // Still mark as initialized to show the app
      }
    };

    initializeApp();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="layout" data-theme={currentTheme}>
      <div className="layout-header">
        <h1>Teams Intranet Navigation</h1>
        {currentUser && (
          <div className="user-info">
            Welcome, {currentUser.displayName}
          </div>
        )}
      </div>

      <div className="tab-list">
        <Flex gap="gap.medium" padding="padding.medium">
          <Button
            primary={activeTab === 'menu'}
            icon="navigation"
            onClick={() => setActiveTab('menu')}
          >
            Navigation
          </Button>
          <Button
            primary={activeTab === 'settings'}
            icon="settings"
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </Flex>
      </div>

      <div className="layout-content">
        {activeTab === 'menu' && <MegaMenu />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default Layout;
