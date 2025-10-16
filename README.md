# 🧭 MS Teams Frontend Developer Test Task (Senior Level)

## 📘 Project Overview
This is a **scalable React + TypeScript single-page application** designed to be embedded into **Microsoft Teams**. It features a configurable multi-level Mega Menu, dynamic settings management, and persistent data storage with production-level quality, architecture, and maintainability.

## 🚀 Features

### ✅ Core Functionality
- **Multi-level Mega Menu** (up to 4 levels) with hover-based navigation
- **Settings Panel** for CRUD operations on menu items
- **Local Storage Persistence** for menu configuration
- **Microsoft Teams SDK v2 Integration** with theme detection
- **Responsive Design** with Fluent UI Northstar components
- **Keyboard Navigation** and ARIA accessibility support
- **TypeScript-first** architecture with strong typing

### 🎨 UI/UX Features
- **Theme Support**: Light, Dark, and Contrast themes
- **Teams Theme Integration**: Automatic theme switching based on Teams context
- **Hover Effects**: Smooth animations and transitions
- **Search Functionality**: Filter menu items in settings
- **Form Validation**: Input validation with error messages
- **Responsive Layout**: Works on desktop and mobile devices

### 🔧 Technical Features
- **Redux Toolkit** for state management
- **Comprehensive Testing** with Vitest and React Testing Library
- **TypeScript Interfaces** for all data structures
- **Service Layer** for Teams integration and storage
- **Error Handling** and loading states
- **Security**: Input sanitization and XSS prevention

## 🛠 Technologies Used

- **React 18** with TypeScript (Compatibility issue with 19+)
- **Vite** as build tool
- **Fluent UI Northstar v0.52.0** for UI components
- **Redux Toolkit** for state management
- **Microsoft Teams SDK v2** for Teams integration (Not functional yet)
- **Vitest** + **React Testing Library** for testing

## 📂 Project Structure

```
src/
├── components/
│   ├── Layout/           # Main layout component
│   ├── MegaMenu/         # Multi-level navigation menu
│   └── Settings/         # Settings panel for menu management
├── store/
│   ├── slices/           # Redux slices (menu, theme, user)
│   └── index.ts          # Store configuration
├── services/
│   ├── teamsService.ts   # Microsoft Teams SDK integration
│   └── storageService.ts # Local storage management
├── types/
│   └── index.ts          # TypeScript interfaces
|   └── react-mega-menu.d.ts # React-mega-menu interface
├── hooks/
│   └── redux.ts          # Typed Redux hooks
├── __tests__/
│   ├── components/       # Component tests
│   └── store/           # Store tests
└── test/
    └── setup.ts         # Test configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamsDev-FrontEnd-Test-S2S
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🧪 Testing

The project includes comprehensive testing:

### Unit Tests
- **Menu Component**: Hover behavior, keyboard navigation, ARIA attributes
- **Settings Component**: CRUD operations, form validation
- **Redux Store**: State management, actions, reducers
- **Services**: Teams integration, storage operations

### Running Tests
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🎯 Usage

### Navigation Menu
- **Hover** over menu items to open submenus
- **Click** on items to navigate to URLs
- **Keyboard navigation** with Tab, Enter, and arrow keys
- **Responsive design** adapts to screen size

### Settings Panel
- **Add** new menu items at any level
- **Edit** existing items with form validation
- **Delete** items with confirmation
- **Search** to filter menu items
- **Persistent storage** automatically saves changes

### Teams Integration
- **Automatic theme detection** from Teams context
- **User context** display when running in Teams
- **Link handling** with Teams navigation support

## 🔧 Configuration

### Teams Manifest
The `public/manifest.json` file contains the Teams app manifest. Update the following:
- `id`: Your app's unique identifier
- `packageName`: Your app's package name
- `developer`: Your company information
- `validDomains`: Your app's domain
- `webApplicationInfo.id`: Your Azure AD app ID

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
VITE_TEAMS_APP_ID=your-teams-app-id
VITE_AZURE_AD_APP_ID=your-azure-ad-app-id
```

## 🎨 Theming

The app supports three themes:
- **Light**: Default theme with light colors
- **Dark**: Dark theme for Teams dark mode
- **Contrast**: High contrast theme for accessibility

Themes are automatically applied based on Teams context or can be manually set.

## 🔒 Security

- **Input Validation**: All user inputs are validated
- **XSS Prevention**: Data sanitization before storage
- **URL Validation**: Proper URL format checking
- **Safe Navigation**: Teams SDK integration with fallbacks

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full mega menu with hover effects
- **Tablet**: Adapted layout with touch-friendly interactions
- **Mobile**: Collapsed menu with touch navigation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Azure Static Web Apps
1. Build the application
2. Deploy the `dist` folder to Azure Static Web Apps
3. Update the manifest.json with your domain
4. Sideload the app in Teams

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy and update manifest.json

## 🧪 Test Cases

All test cases from the requirements are implemented and passing:

| Test Case | Status | Description |
|-----------|--------|-------------|
| Menu Click | ✅ | Each menu link navigates to correct URL |
| Hover Open | ✅ | Hover over parent opens submenu |
| Hover Close | ✅ | Hover out closes submenu |
| Dummy Data | ✅ | Dummy menu items visible for each level |
| Settings Display | ✅ | Shows existing dummy data |
| Add Item | ✅ | Adding item updates Mega Menu instantly |
| Persistence | ✅ | Reloading page keeps last menu config |
| Tests | ✅ | Jest test suite passes |
| Teams Theme | ❌ | Theme auto-switches on Teams theme change |
