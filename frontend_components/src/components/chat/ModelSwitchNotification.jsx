import React from 'react';
import './ModelSwitchNotification.css';

/**
 * ModelSwitchNotification Component
 * 
 * Shows a notification when the AI model is switched
 */
const ModelSwitchNotification = ({ model, isVisible }) => {
  if (!isVisible) return null;
  
  // Format model name for display
  const formatModelName = (name) => {
    switch (name) {
      case 'auto':
        return 'Auto';
      case 'llama':
        return 'Mistral';
      case 'deepseek':
        return 'Deepseek';
      case 'cohere':
        return 'Cohere';
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };
  
  return (
    <div className="model-switch-notification">
      <div className="notification-content">
        <span className="notification-icon">🔄</span>
        <span className="notification-text">
          Switched to {formatModelName(model)} model
        </span>
      </div>
    </div>
  );
};

export default ModelSwitchNotification;