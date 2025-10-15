import { Provider } from 'react-redux';
import { Provider as FluentProvider, teamsTheme } from '@fluentui/react-northstar';
import { store } from './store';
import Layout from './components/Layout/Layout';
import './App.css';

// Custom theme configuration to reduce warnings
const customTheme = {
  ...teamsTheme,
  // Disable some Fluent UI features that cause warnings
  disableAnimations: false,
  rtl: false,
};

function App() {
  return (
    <Provider store={store}>
      <FluentProvider theme={customTheme}>
        <Layout />
      </FluentProvider>
    </Provider>
  );
}

export default App;
