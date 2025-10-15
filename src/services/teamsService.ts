import * as microsoftTeams from '@microsoft/teams-js';
import type { TeamsContext } from '../types';

export class TeamsService {
  private static isInitialized = false;

  static async initialize(): Promise<boolean> {
    try {
      await microsoftTeams.app.initialize();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Teams SDK:', error);
      return false;
    }
  }

  static async getContext(): Promise<TeamsContext | null> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const context = await microsoftTeams.app.getContext();
      
      return {
        theme: this.mapTeamsTheme(context.app?.theme || 'default'),
        user: context.user ? {
          id: context.user.id,
          displayName: context.user.displayName || 'Unknown User',
          email: context.user.userPrincipalName,
        } : null,
        isInitialized: true,
      };
    } catch (error) {
      console.error('Failed to get Teams context:', error);
      return null;
    }
  }

  static async registerThemeChangeHandler(callback: (theme: 'light' | 'dark' | 'contrast') => void): Promise<void> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return;
    }

    try {
      microsoftTeams.app.registerOnThemeChangeHandler((theme: string) => {
        callback(this.mapTeamsTheme(theme));
      });
    } catch (error) {
      console.error('Failed to register theme change handler:', error);
    }
  }

  static async openLink(url: string, openInTeams: boolean = false): Promise<void> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        // Fallback to window.open if Teams is not available
        window.open(url, '_blank');
        return;
      }
    }

    try {
      if (openInTeams) {
        await microsoftTeams.pages.backStack.navigateBack();
        await microsoftTeams.pages.tabs.navigateToTab({
          tabName: 'Tab',
          url: url,
        });
      } else {
        await microsoftTeams.pages.backStack.navigateBack();
        await microsoftTeams.pages.tabs.navigateToTab({
          tabName: 'Tab',
          url: url,
        });
      }
    } catch (error) {
      console.error('Failed to open link in Teams:', error);
      // Fallback to window.open
      window.open(url, '_blank');
    }
  }

  private static mapTeamsTheme(teamsTheme: string): 'light' | 'dark' | 'contrast' {
    switch (teamsTheme) {
      case 'dark':
        return 'dark';
      case 'contrast':
        return 'contrast';
      case 'light':
      default:
        return 'light';
    }
  }

  static isRunningInTeams(): boolean {
    return window.location !== window.parent.location;
  }
}
