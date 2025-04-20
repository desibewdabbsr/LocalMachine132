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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(`${type === 'file' ? 'File' : 'Folder'} name cannot be empty`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      let result;
      
      if (type === 'file') {
        result = await apiService.createFile(parentPath, name);
      } else {
        result = await apiService.createFolder(parentPath, name);
      }
      
      if (result.status === 'success') {
        // Ensure we call onRefresh to update the file tree
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
        onClose();
      } else {
        setError(`Failed to create ${type}: ${result.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      setError(`Error creating ${type}: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-file-dialog-overlay">
      <div className="create-file-dialog" ref={dialogRef}>
        <div className="dialog-header">
          <h3>{type === 'file' ? 'New File' : 'New Folder'}</h3>
          <button 
            className="close-button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-name">
              {type === 'file' ? 'File Name:' : 'Folder Name:'}
            </label>
            <input 
              ref={inputRef}
              type="text" 
              id="item-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'file' ? 'Enter file name' : 'Enter folder name'}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFileDialog;