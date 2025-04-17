import React from 'react';
import './ChatControls.css';

/**
 * ChatControls Component
 * 
 * Handles the control buttons for the chat panel
 */
const ChatControls = ({ 
  position, 
  selectedModel, 
  models, 
  showModelDropdown,
  isAutoPilot,
  isVoiceEnabled,
  isProcessing,
  onToggleModelDropdown,
  onSelectModel,
  onToggleAutoPilot,
  onToggleVoice,
  onSendOrStop,
  onClearHistory
}) => {
  // Render left controls
  if (position === 'left') {
    return (
      <div className="chat-controls left-controls">
        {/* Model selection button */}
        <div className="model-selector">
          <button 
            className="control-button model-button" 
            onClick={onToggleModelDropdown}
            title={models.find(model => model.id === selectedModel).name}
          >
            {selectedModel}
          </button>
          
          {showModelDropdown && (
            <div className="model-dropdown">
              {models.map(model => (
                <div 
                  key={model.id} 
                  className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => onSelectModel(model.id)}
                >
                  {model.id}: {model.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Auto-pilot toggle */}
        <button 
          className={`control-button autopilot-button ${isAutoPilot ? 'active' : ''}`}
          onClick={onToggleAutoPilot}
          title={isAutoPilot ? 'Disable Auto-Pilot' : 'Enable Auto-Pilot'}
        >
          ✈️
        </button>
      </div>
    );
  }
  
  // Render right controls
  return (
    <div className="chat-controls right-controls">
      {/* Clear history button */}
      <button 
        className="control-button clear-button"
        onClick={onClearHistory}
        title="Clear chat history"
      >
        🗑️
      </button>
      
      {/* Voice toggle */}
      <button 
        className={`control-button voice-button ${isVoiceEnabled ? 'active' : ''}`}
        onClick={onToggleVoice}
        title={isVoiceEnabled ? 'Disable AI Voice' : 'Enable AI Voice'}
      >
        🔊
      </button>
      
      {/* Send/Stop button */}
      <button 
        className={`control-button send-button ${isProcessing ? 'processing' : ''}`}
        onClick={onSendOrStop}
        title={isProcessing ? 'Stop' : 'Send'}
      >
        {isProcessing ? '■' : '▶'}
      </button>
    </div>
  );
};

export default ChatControls;