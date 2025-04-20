import React from 'react';
import './AsciiTreeView.css';
import { getFileIcon } from './file_utils';

/**
 * AsciiTreeView Component
 * 
 * Renders a text-based tree view with ASCII characters
 * Files are displayed in gold color, folders in saffron
 */
const AsciiTreeView = ({ 
  files, 
  expandedFolders, 
  onToggleFolder, 
  onFileSelect,
  onContextMenu,
  onShowCreateDialog
}) => {
  // Render the ASCII tree recursively
  const renderAsciiTree = (files, prefix = '') => {
    return files.map((item, index) => {
      const isLast = index === files.length - 1;
      const linePrefix = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';
      const isFolder = item.type === 'folder';
      
      return (
        <div key={item.id} className="ascii-item-container">
          <div 
            className={`ascii-item ${isFolder ? 'ascii-folder' : 'ascii-file'}`}
            onClick={() => isFolder ? onToggleFolder(item.id) : onFileSelect(item.id)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            <span className="ascii-line">{prefix + linePrefix}</span>
            {isFolder ? (
              <>
                <span className="folder-name">{item.name}</span>
                
                {/* Show file/folder creation buttons on hover for folders */}
                <div className="ascii-actions">
                  <button 
                    className="ascii-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowCreateDialog('file', item);
                    }}
                    title="New File"
                  >
                    📄
                  </button>
                  <button 
                    className="ascii-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowCreateDialog('folder', item);
                    }}
                    title="New Folder"
                  >
                    📁
                  </button>
                </div>
              </>
            ) : (
              <span className="file-name">{item.name}</span>
            )}
          </div>
          
          {isFolder && expandedFolders[item.id] && item.children && item.children.length > 0 && (
            <div className="ascii-children">
              {renderAsciiTree(item.children, prefix + childPrefix)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="ascii-tree-view">
      {renderAsciiTree(files)}
    </div>
  );
};

export default AsciiTreeView;