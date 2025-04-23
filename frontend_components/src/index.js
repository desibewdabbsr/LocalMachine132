import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/colorPalette.css';
import { WorkspaceProvider } from './context/WorkspaceContext';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <WorkspaceProvider>
    <App />
  </WorkspaceProvider>
);