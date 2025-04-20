import React, { useState, useEffect, useRef } from 'react';
import './CreateFileDialog.css';
import apiService from '../../services/apiService';

/**
 * CreateFileDialog Component
 * 
 * Dialog for creating new files or folders
 */
const CreateFileDialog = ({ 
  type, 
  parentPath, 
  parentItem, 
  onClose, 
  onRefresh 
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  // Focus input when dialog opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    try {
      let result;
      
      if (type === 'file') {
        result = await apiService.createFile(parentPath, name);
      } else {
        // If we're creating at the root level, use createProject
        if (parentPath === '.') {
          result = await apiService.createProject(name);
        } else {
          result = await apiService.createFolder(parentPath, name);
        }
      }
      
      if (result.status === 'success') {
        onRefresh();
        onClose();
      } else {
        setError(`Create failed: ${result.error}`);
      }
    } catch (error) {
      setError(`Create failed: ${error.message}`);
    }
  };
  
  return (
    <div className="create-file-dialog">
      <div className="dialog-header">
        <h3>Create New {type === 'file' ? 'File' : 'Folder'}</h3>
        <button 
          className="close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label htmlFor="item-name">Name:</label>
          <input
            ref={inputRef}
            type="text"
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${type} name`}
          />
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="create-button"
            disabled={!name.trim()}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFileDialog;