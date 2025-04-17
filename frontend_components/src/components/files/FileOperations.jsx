import React, { useState, useEffect, useRef } from 'react';
import './FileOperations.css';
import apiService from '../../services/apiService';

/**
 * FileOperations Component
 * 
 * Handles file operations like create, rename, delete, etc.
 */
const FileOperations = ({ 
  contextMenuPosition, 
  selectedItem, 
  onClose, 
  onRefresh 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [createName, setCreateName] = useState('');
  const [error, setError] = useState('');
  
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const createInputRef = useRef(null);
  
  // Set initial name when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setNewName(selectedItem.name);
    }
  }, [selectedItem]);
  
  // Focus input when renaming or creating
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
    }
    if (isCreating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isRenaming, isCreating]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle rename
  const handleRename = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    try {
      await apiService.renameFile(selectedItem.path, newName);
      setIsRenaming(false);
      onRefresh();
      onClose();
    } catch (error) {
      setError(`Rename failed: ${error.message}`);
    }
  };
  
  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!createName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    try {
      if (createType === 'file') {
        await apiService.createFile(selectedItem.path, createName);
      } else {
        await apiService.createFolder(selectedItem.path, createName);
      }
      setIsCreating(false);
      onRefresh();
      onClose();
    } catch (error) {
      setError(`Create failed: ${error.message}`);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
      return;
    }
    
    try {
      await apiService.deleteFile(selectedItem.path);
      onRefresh();
      onClose();
    } catch (error) {
      setError(`Delete failed: ${error.message}`);
    }
  };
  
  // Handle copy path
  const handleCopyPath = () => {
    navigator.clipboard.writeText(selectedItem.path)
      .then(() => {
        onClose();
      })
      .catch(err => {
        setError(`Copy failed: ${err.message}`);
      });
  };
  
  if (!selectedItem || !contextMenuPosition) {
    return null;
  }
  
  const { x, y } = contextMenuPosition;
  const isFolder = selectedItem.type === 'folder';
  
  return (
    <div 
      ref={menuRef}
      className="file-operations-menu" 
      style={{ top: y, left: x }}
    >
      {error && <div className="error-message">{error}</div>}
      
      {isRenaming ? (
        <form onSubmit={handleRename} className="rename-form">
          <input
            ref={renameInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rename-input"
          />
          <button type="submit" className="rename-button">Save</button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => setIsRenaming(false)}
          >
            Cancel
          </button>
        </form>
      ) : isCreating ? (
        <form onSubmit={handleCreate} className="create-form">
          <div className="create-type-selector">
            <button 
              type="button"
              className={`create-type-button ${createType === 'file' ? 'active' : ''}`}
              onClick={() => setCreateType('file')}
            >
              File
            </button>
            <button 
              type="button"
              className={`create-type-button ${createType === 'folder' ? 'active' : ''}`}
              onClick={() => setCreateType('folder')}
            >
              Folder
            </button>
          </div>
          <input
            ref={createInputRef}
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="create-input"
            placeholder={`New ${createType} name...`}
          />
          <button type="submit" className="create-button">Create</button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <ul className="operations-list">
          <li onClick={() => setIsRenaming(true)}>Rename</li>
          <li onClick={handleDelete}>Delete</li>
          <li onClick={handleCopyPath}>Copy Path</li>
          {isFolder && (
            <>
              <li onClick={() => { setIsCreating(true); setCreateType('file'); }}>
                New File
              </li>
              <li onClick={() => { setIsCreating(true); setCreateType('folder'); }}>
                New Folder
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default FileOperations;