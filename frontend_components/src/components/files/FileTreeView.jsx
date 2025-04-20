import React, { useState } from 'react';
import './FileTreeView.css';
import { getFileIcon } from './file_utils';
import CreateFileDialog from './CreateFileDialog';

/**
 * FileTreeView Component
 * 
 * Renders a tree view of files and folders
 */
const FileTreeView = ({ 
  files, 
  expandedFolders, 
  onToggleFolder, 
  onFileSelect,
  onContextMenu,
  onRefresh,
  viewMode = 'tree' // Add viewMode prop with default 'tree'
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
  
  // Render a file or folder item
  const renderItem = (item, depth = 0, isLast = false) => {
    const indent = depth * 16; // 16px indentation per level
    
    if (item.type === 'folder') {
      const isExpanded = expandedFolders[item.id];
      const hasChildren = item.children && item.children.length > 0;
      const isProjectRoot = depth === 0; // Top-level folders are project roots
      
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className={`file-item folder ${isExpanded ? 'expanded' : ''} ${isProjectRoot ? 'project-item' : ''}`}
            style={{ paddingLeft: `${indent}px` }}
            onClick={(e) => onToggleFolder(item.id, e)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            <div className="project-item-left">
              <span className="folder-toggle">
                {hasChildren ? (isExpanded ? '▼' : '►') : ''}
              </span>
              <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
              <span className="file-name">{item.name}</span>
            </div>
            
            {/* Show file/folder creation buttons on ALL folders, not just project roots */}
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
                renderItem(
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
      
      // For tree view, use indentation and icons
      if (viewMode === 'tree') {
        return (
          <div key={item.id} className="tree-item-container">
            <div 
              className="file-item"
              style={{ paddingLeft: `${indent}px` }}
              onClick={() => onFileSelect(item.id)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <span className="file-icon">{fileIcon}</span>
              <span className="file-name">{item.name}</span>
            </div>
          </div>
        );
      } 
      // For folder view, use a simpler layout
      else {
        return (
          <div key={item.id} className="tree-item-container">
            <div 
              className="file-item file-item-simple"
              onClick={() => onFileSelect(item.id)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <span className="file-icon">{fileIcon}</span>
              <span className="file-name">{item.name}</span>
            </div>
          </div>
        );
      }
    }
  };

  // For ASCII tree view
  const renderAsciiTree = (files, prefix = '') => {
    return (
      <div className="ascii-tree">
        {files.map((item, index) => {
          const isLast = index === files.length - 1;
          const linePrefix = isLast ? '└── ' : '├── ';
          const childPrefix = isLast ? '    ' : '│   ';
          
          return (
            <div key={item.id}>
              <div className="ascii-item" onClick={() => item.type === 'folder' ? onToggleFolder(item.id) : onFileSelect(item.id)}>
                {prefix + linePrefix + item.name}
              </div>
              {item.type === 'folder' && expandedFolders[item.id] && item.children && item.children.length > 0 && (
                renderAsciiTree(item.children, prefix + childPrefix)
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render based on view mode
  if (viewMode === 'ascii') {
    return (
      <div className="file-tree-view ascii-mode">
        {renderAsciiTree(files)}
        
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
  }

  return (
    <div className="file-tree-view">
      {files.map((item, index) => 
        renderItem(item, 0, index === files.length - 1)
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