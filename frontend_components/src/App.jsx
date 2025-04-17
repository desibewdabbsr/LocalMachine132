import React, { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import './pages/Dashboard.css';
import appConfig from './config/appConfig';
import './styles/colorPalette.css';

function App() {
  useEffect(() => {
    // Set document title dynamically based on appConfig
    document.title = appConfig.appName;
  }, []);

  return <Dashboard />;
}

export default App;