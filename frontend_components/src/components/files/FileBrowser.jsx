import React, { useState, useEffect } from 'react';
import './FileBrowser.css';
import FileTreeView from './FileTreeView';
import FileOperations from './FileOperations';
import apiService from '../../services/apiService';
import mockFileSystem from '../../data/mockFileSystem';

/**
 * FileBrowser Component
 * 
 * A file explorer for the .Repositories directory
 */
const FileBrowser = ({ instanceId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: null,
    item: null
  });
  const [error, setError] = useState(null);
  const [useTestData, setUseTestData] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Toggle between test data and real API
  const toggleDataSource = () => {
    setUseTestData(prev => !prev);
    loadFiles();
  };

  // Load the project structure
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useTestData) {
        setTimeout(() => {
          setFiles(mockFileSystem);
          setIsLoading(false);
          
          // Auto-expand all project folders
          const expanded = { 'repo-root': true };
          mockFileSystem.forEach(item => {
            if (item.type === 'folder') {
              expanded[item.id] = true;
            }
          });
          setExpandedFolders(expanded);
        }, 500);
      } else {
        const response = await apiService.getFiles();
        console.log('Loaded file system:', response);
        
        setFiles(response);
        
        // Auto-expand all project folders
        const expanded = { 'repo-root': true };
        response.forEach(item => {
          if (item.type === 'folder') {
            expanded[item.id] = true;
          }
        });
        setExpandedFolders(expanded);
        
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

  // Toggle folder expansion (only for project subfolders, not for .Repositories)
  const toggleFolder = (folderId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Don't toggle repo-root
    if (folderId === 'repo-root') return;
    
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Open file in workspace2
  const openFileInWorkspace = (fileId) => {
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
        content: file.content || ''
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

  // Show create project dialog
  const handleCreateProject = () => {
    setShowCreateProjectDialog(true);
  };

  // Handle create project submission
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      return;
    }
    
    try {
      const result = await apiService.createProject(newProjectName, projectDescription);
      
      if (result.status === 'success') {
        console.log('Project created:', result);
        // Refresh file list
        await loadFiles();
        
        // Reset form
        setNewProjectName('');
        setProjectDescription('');
        setShowCreateProjectDialog(false);
      } else {
        setError(`Failed to create project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError(`Failed to create project: ${error.message}`);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <div className="explorer-title">EXPLORER</div>
        <div className="explorer-controls">
          {/* Create Project button in header */}
          <button 
            className="explorer-control-button" 
            onClick={handleCreateProject}
            title="Create Project"
          >
            📁+
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
            onClick={toggleDataSource}
            title={useTestData ? "Switch to API data" : "Switch to test data"}
          >
            {useTestData ? "🌐" : "🧪"}
          </button>
        </div>
      </div>
      
      <div className="explorer-content">
        {isLoading ? (
          <div className="loading-message">Loading files...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Project list */}
            {files.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <div className="empty-state-message">No projects found</div>
                <button 
                  className="empty-state-button"
                  onClick={handleCreateProject}
                >
                  Create New Project
                </button>
              </div>
            ) : (
              <div className="projects-list">
                <div className="projects-header">
                  <span className="projects-title">PROJECTS</span>
                </div>
                <div className="projects-container">
                  <FileTreeView 
                    files={files}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onFileSelect={openFileInWorkspace}
                    onContextMenu={handleContextMenu}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Context menu */}
      {contextMenu.visible && (
        <FileOperations 
          contextMenuPosition={contextMenu.position}
          selectedItem={contextMenu.item}
          onClose={closeContextMenu}
          onRefresh={loadFiles}
        />
      )}
      
      {/* Create project dialog */}
      {showCreateProjectDialog && (
        <div className="create-project-dialog">
          <div className="dialog-header">
            <h3>Create New Project</h3>
            <button 
              className="close-button"
              onClick={() => setShowCreateProjectDialog(false)}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleCreateProjectSubmit}>
            <div className="form-group">
              <label htmlFor="project-name">Project Name:</label>
              <input 
                type="text" 
                id="project-name" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="project-description">Description (optional):</label>
              <textarea 
                id="project-description" 
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowCreateProjectDialog(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="create-button"
                disabled={!newProjectName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;