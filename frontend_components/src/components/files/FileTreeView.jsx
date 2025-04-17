import React from 'react';
import './FileTreeView.css';
import { getFileIcon } from './file_utils';

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
  onContextMenu
}) => {
  // Render a file or folder item
  const renderItem = (item, depth = 0, isLast = false) => {
    const indent = depth * 16; // 16px indentation per level
    
    if (item.type === 'folder') {
      const isExpanded = expandedFolders[item.id];
      const hasChildren = item.children && item.children.length > 0;
      
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className={`file-item folder ${isExpanded ? 'expanded' : ''}`}
            style={{ paddingLeft: `${indent}px` }}
            onClick={(e) => onToggleFolder(item.id, e)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            <span className="folder-toggle">
              {hasChildren ? (isExpanded ? '▼' : '►') : ''}
            </span>
            <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
            <span className="file-name">{item.name}</span>
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
  };

  return (
    <div className="file-tree-view">
      {files.map((item, index) => 
        renderItem(item, 0, index === files.length - 1)
      )}
    </div>
  );
};

export default FileTreeView;