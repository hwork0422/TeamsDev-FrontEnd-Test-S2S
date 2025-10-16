export interface MenuItem {
  id: string;
  label: string;
  url?: string;
  icon?: string;
  openInTeams?: boolean;
  children?: MenuItem[];
}

export interface AppState {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark' | 'contrast';
  currentUser: User | null;
}

export interface User {
  id: string;
  displayName: string;
  email?: string;
}

export interface MenuItemFormData {
  label: string;
  url: string;
  icon: string;
  openInTeams: boolean;
}

export interface TeamsContext {
  theme: 'light' | 'dark' | 'contrast';
  user: User | null;
  isInitialized: boolean;
}

export type MenuLevel = 0 | 1 | 2 | 3; // 0 = top level, 1-3 = sub levels

export interface MenuHoverState {
  [key: string]: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ReactMegaMenu data
export interface ReactMegaMenuData {
  label: string;
  key: string;
  items: ReactMegaMenuData[];
}

// ReactMegaMenu props
export interface ReactMegaMenuProps {
  data: ReactMegaMenuData[];
  tolerance: number;
  styleConfig: any;
  onExit: () => void;
}