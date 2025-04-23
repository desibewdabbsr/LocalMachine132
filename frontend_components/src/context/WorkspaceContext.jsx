import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

// Create the context
const WorkspaceContext = createContext();

/**
 * WorkspaceProvider Component
 * 
 * Provides workspace context to the entire application
 * Manages the active workspace state and related operations
 */
export const WorkspaceProvider = ({ children }) => {
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
    
    // Try to load the last active workspace from localStorage
    const savedWorkspace = localStorage.getItem('activeWorkspace');
    if (savedWorkspace) {
      try {
        setActiveWorkspace(JSON.parse(savedWorkspace));
      } catch (error) {
        console.error('Error parsing saved workspace:', error);
      }
    }
  }, []);

  // Load all available workspaces
  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getFiles();
      // Filter to only include folders
      const folderWorkspaces = data.filter(item => item.type === 'folder');
      setWorkspaces(folderWorkspaces);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set active workspace and save to localStorage
  const setActiveWorkspaceWithStorage = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('activeWorkspace', JSON.stringify(workspace));
    
    // Also notify the backend about the active workspace
    apiService.setActiveWorkspace(workspace.path)
      .catch(error => console.error('Error setting active workspace on server:', error));
  };

  // Create a new workspace
  const createWorkspace = async (name, description = '') => {
    try {
      const result = await apiService.createWorkspace(name, description);
      await loadWorkspaces(); // Reload workspaces
      return result;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  // Value to be provided by the context
  const contextValue = {
    activeWorkspace,
    setActiveWorkspace: setActiveWorkspaceWithStorage,
    workspaces,
    isLoading,
    loadWorkspaces,
    createWorkspace
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;