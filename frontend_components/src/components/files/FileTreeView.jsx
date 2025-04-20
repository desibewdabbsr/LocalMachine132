import React, { useState } from 'react';
import './FileTreeView.css';
import { getFileIcon } from './file_utils';
import CreateFileDialog from './CreateFileDialog';
import AsciiTreeView from './AsciiTreeView';

/**
 * FileTreeView Component
 * 
 * Renders a tree view of files and folders with three view modes:
 * - Tree: Traditional tree view with hierarchy indicators
 * - Folder: Simple folder view like a standard file explorer
 * - ASCII: Text-based tree view with ASCII characters
 */
const FileTreeView = ({ 
  files, 
  expandedFolders, 
  onToggleFolder, 
  onFileSelect,
  onContextMenu,
  onRefresh,
  viewMode = 'tree' // 'tree', 'folder', or 'ascii'
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createDialogProps, setCreateDialogProps] = useState({
    type: 'file',
    parentPath: '',
    parentItem: null
  });
  
  // Show create dialog
  const handleShowCreateDialog = (type, parentItem, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    setCreateDialogProps({
      type,
      parentPath: parentItem.path,
      parentItem
    });
    setShowCreateDialog(true);
  };
  
  // Close create dialog
  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };
  
  // Render tree indicators for hierarchy visualization
  const renderTreeIndicators = (depth, isLast) => {
    if (depth === 0) return null;
    
    const indicators = [];
    
    // Add vertical lines for each level of depth
    for (let i = 1; i < depth; i++) {
      indicators.push(
        <div 
          key={`v-${i}`} 
          className="tree-indicator" 
          style={{ left: `${i * 16}px` }}
        />
      );
    }
    
    // Add the horizontal line for the current item
    indicators.push(
      <div 
        key="h" 
        className="tree-indicator-horizontal" 
        style={{ left: `${(depth - 1) * 16}px` }}
      />
    );
    
    return indicators;
  };
  
  // Render folder view (traditional file explorer style)
  const renderFolderView = () => {
    // Function to render a single folder level
    const renderFolderLevel = (items, currentPath = '') => {
      return (
        <div className="folder-view-level">
          {currentPath && (
            <div className="folder-view-header">
              <span className="folder-view-path">{currentPath}</span>
            </div>
          )}
          <div className="folder-view-items">
            {items.map(item => (
              <div 
                key={item.id}
                className={`folder-view-item ${item.type}`}
                onClick={() => item.type === 'folder' ? onToggleFolder(item.id) : onFileSelect(item.id)}
                onContextMenu={(e) => onContextMenu(e, item)}
              >
                <div className="folder-view-item-icon">
                  {item.type === 'folder' ? (expandedFolders[item.id] ? '📂' : '📁') : getFileIcon(item.name)}
                </div>
                <div className="folder-view-item-name">{item.name}</div>
                
                {item.type === 'folder' && (
                  <div className="folder-view-item-actions">
                    <button 
                      className="folder-view-item-action"
                      onClick={(e) => handleShowCreateDialog('file', item, e)}
                      title="New File"
                    >
                      📄
                    </button>
                    <button 
                      className="folder-view-item-action"
                      onClick={(e) => handleShowCreateDialog('folder', item, e)}
                      title="New Folder"
                    >
                      📁
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    // Find the currently expanded folder to display its contents
    const findExpandedFolder = (items, path = '') => {
      for (const item of items) {
        if (item.type === 'folder' && expandedFolders[item.id]) {
          const newPath = path ? `${path} > ${item.name}` : item.name;
          if (item.children && item.children.length > 0) {
            return renderFolderLevel(item.children, newPath);
          }
        }
      }
      return renderFolderLevel(items);
    };
    
    return findExpandedFolder(files);
  };
  
  // Render a file or folder item in tree view
  const renderTreeItem = (item, depth = 0, isLast = false) => {
    const indent = depth * 16; // 16px indentation per level
    
    if (item.type === 'folder') {
      const isExpanded = expandedFolders[item.id];
      const hasChildren = item.children && item.children.length > 0;
      const isProjectRoot = depth === 0; // Top-level folders are project roots
      
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className={`file-item folder ${isExpanded ? 'expanded' : ''} ${isProjectRoot ? 'project-item' : ''}`}
            style={{ paddingLeft: `${indent + 16}px` }}
            onClick={(e) => onToggleFolder(item.id, e)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            {/* Tree indicators for hierarchy visualization */}
            {renderTreeIndicators(depth, isLast)}
            
            <div className="project-item-left">
              <span className="folder-toggle">
                {hasChildren ? (isExpanded ? '▼' : '►') : ''}
              </span>
              <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
              <span className="file-name">{item.name}</span>
            </div>
            
            {/* Show file/folder creation buttons on ALL folders */}
            <div className="project-item-actions">
              <button 
                className="project-item-action"
                onClick={(e) => handleShowCreateDialog('file', item, e)}
                title="New File"
              >
                📄
              </button>
              <button 
                className="project-item-action"
                onClick={(e) => handleShowCreateDialog('folder', item, e)}
                title="New Folder"
              >
                📁
              </button>
            </div>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="folder-children">
              {item.children.map((child, index) => 
                renderTreeItem(
                  child, 
                  depth + 1, 
                  index === item.children.length - 1
                )
              )}
            </div>
          )}
        </div>
      );
    } else {
      // File item
      const fileIcon = getFileIcon(item.name);
      
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className="file-item"
            style={{ paddingLeft: `${indent + 16}px` }}
            onClick={() => onFileSelect(item.id)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            {/* Tree indicators for hierarchy visualization */}
            {renderTreeIndicators(depth, isLast)}
            
            <span className="file-icon">{fileIcon}</span>
            <span className="file-name">{item.name}</span>
          </div>
        </div>
      );
    }
  };

  // Render based on view mode
  if (viewMode === 'ascii') {
    return (
      <>
        <AsciiTreeView
          files={files}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onFileSelect={onFileSelect}
          onContextMenu={onContextMenu}
          onShowCreateDialog={handleShowCreateDialog}
        />
        
        {/* Create file/folder dialog */}
        {showCreateDialog && (
          <CreateFileDialog
            type={createDialogProps.type}
            parentPath={createDialogProps.parentPath}
            parentItem={createDialogProps.parentItem}
            onClose={handleCloseCreateDialog}
            onRefresh={onRefresh}
          />
        )}
      </>
    );
  }
  
  if (viewMode === 'folder') {
    return (
      <>
        {renderFolderView()}
        
        {/* Create file/folder dialog */}
        {showCreateDialog && (
          <CreateFileDialog
            type={createDialogProps.type}
            parentPath={createDialogProps.parentPath}
            parentItem={createDialogProps.parentItem}
            onClose={handleCloseCreateDialog}
            onRefresh={onRefresh}
          />
        )}
      </>
    );
  }

  // Default: Tree view
  return (
    <div className="file-tree-view">
      {files.map((item, index) => 
        renderTreeItem(item, 0, index === files.length - 1)
      )}
      
      {/* Create file/folder dialog */}
      {showCreateDialog && (
        <CreateFileDialog
          type={createDialogProps.type}
          parentPath={createDialogProps.parentPath}
          parentItem={createDialogProps.parentItem}
          onClose={handleCloseCreateDialog}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default FileTreeView;