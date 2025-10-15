import { Provider } from 'react-redux';
import { Provider as FluentProvider, teamsTheme } from '@fluentui/react-northstar';
import { store } from './store';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <FluentProvider theme={teamsTheme}>
        <Layout />
      </FluentProvider>
    </Provider>
  );
}

export default App;
