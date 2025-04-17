import React, { useState, useEffect } from 'react';
import './FileBrowser.css';
import FileTreeView from './FileTreeView';
import FileOperations from './FileOperations';
import { getFileIcon } from './file_utils';
import apiService from '../../services/apiService';
import mockFileSystem from '../../data/mockFileSystem';

/**
 * FileBrowser Component
 * 
 * A file explorer similar to VS Code's Explorer panel
 * Shows the project structure for LocalMachine132
 */
const FileBrowser = ({ instanceId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [repositoryName, setRepositoryName] = useState('LocalMachine132');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'files'
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: null,
    item: null
  });
  const [error, setError] = useState(null);
  const [useTestData, setUseTestData] = useState(true); // Toggle for using mock data

  // Load the project structure
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use mock data for testing or real API for production
      if (useTestData) {
        // Simulate API delay
        setTimeout(() => {
          setFiles(mockFileSystem);
          setIsLoading(false);
          
          // Auto-expand the repository root and some key folders
          setExpandedFolders({ 
            'repo-root': true,
            'folder-projects': true,
            'folder-localmachine132': true
          });
        }, 500);
      } else {
        const response = await apiService.getFiles();
        console.log('Loaded file system:', response);
        
        setFiles(response);
        
        // Auto-expand the repository root
        setExpandedFolders(prev => ({ 
          ...prev,
          'repo-root': true 
        }));
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files. Please try again.');
      setIsLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Toggle view mode between tree and files
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tree' ? 'files' : 'tree');
  };

  // Toggle folder expansion
  const toggleFolder = (folderId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Toggle repository collapse/expand
  const toggleRepository = () => {
    setExpandedFolders(prev => ({
      ...prev,
      'repo-root': !prev['repo-root']
    }));
  };

  // Open file in workspace2
  const openFileInWorkspace = (fileId) => {
    // Find the file in our file structure
    const findFile = (files) => {
      for (const file of files) {
        if (file.id === fileId) return file;
        if (file.type === 'folder' && file.children) {
          const found = findFile(file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(files);
    if (!file) {
      console.error('File not found:', fileId);
      return;
    }

    console.log('Opening file:', file);

    // Create a unique ID for this file
    const fileTabId = `file-${file.id}`;

    // Create the file object to be passed to the editor
    const fileData = {
      id: fileTabId,
      serviceId: 'file-editor',
      title: file.name,
      data: {
        fileId: file.id,
        fileName: file.name,
        language: file.language,
        content: file.content || '' // Ensure content is never undefined
      }
    };

    // Dispatch a custom event that WorkspaceManager can listen to
    const openFileEvent = new CustomEvent('LocalMachine132:openFile', {
      detail: {
        targetWorkspace: 'workspace2',
        file: fileData
      }
    });

    window.dispatchEvent(openFileEvent);
  };

  // Handle context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      item
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      position: null,
      item: null
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    loadFiles();
  };

  // Handle collapse all
  const handleCollapseAll = () => {
    setExpandedFolders({ 'repo-root': true });
  };

  // Create new file
  const handleNewFile = () => {
    setContextMenu({
      visible: true,
      position: { x: 100, y: 100 }, // Position near the top of the explorer
      item: { id: 'repo-root', name: repositoryName, type: 'folder', path: '.' }
    });
  };

  // Toggle between test data and real API
  const toggleDataSource = () => {
    setUseTestData(prev => !prev);
    loadFiles();
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <div className="explorer-title">EXPLORER</div>
        <div className="explorer-controls">
          <button 
            className="explorer-control-button" 
            onClick={toggleViewMode}
            title={viewMode === 'tree' ? 'Switch to Files view' : 'Switch to Tree view'}
          >
            {viewMode === 'tree' ? '🌲' : '📁'}
          </button>
          <button 
            className="explorer-control-button" 
            onClick={handleNewFile}
            title="New File"
          >
            📝
          </button>
          <button 
            className="explorer-control-button" 
            onClick={handleRefresh}
            title="Refresh"
          >
            🔄
          </button>
          <button 
            className="explorer-control-button" 
            onClick={handleCollapseAll}
            title="Collapse All"
          >
            ⬆️
          </button>
          <button 
            className="explorer-control-button" 
            onClick={toggleDataSource}
            title={useTestData ? "Switch to API data" : "Switch to test data"}
          >
            {useTestData ? "🧪" : "🌐"}
          </button>
        </div>
      </div>
      
      <div className="explorer-content">
        {isLoading ? (
          <div className="loading-message">Loading files...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-message">No files found</div>
            <button 
              className="empty-state-button"
              onClick={handleNewFile}
            >
              Create New File
            </button>
          </div>
        ) : (
          <div className="repository-root">
            <div 
              className={`repository-header ${expandedFolders['repo-root'] ? 'expanded' : ''}`}
              onClick={toggleRepository}
            >
              <span className="collapse-icon">{expandedFolders['repo-root'] ? '▼' : '►'}</span>
              <span className="repository-name">{repositoryName}</span>
            </div>
            
            {expandedFolders['repo-root'] && (
              <div className="repository-files">
                <FileTreeView 
                  files={files}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                  onFileSelect={openFileInWorkspace}
                  onContextMenu={handleContextMenu}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {contextMenu.visible && (
        <FileOperations 
          contextMenuPosition={contextMenu.position}
          selectedItem={contextMenu.item}
          onClose={closeContextMenu}
          onRefresh={loadFiles}
        />
      )}
    </div>
  );
};

export default FileBrowser;