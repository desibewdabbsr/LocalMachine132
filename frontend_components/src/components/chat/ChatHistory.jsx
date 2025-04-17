import React, { useState, useEffect } from 'react';
import './ChatHistory.css';
import apiService from '../../services/apiService';

/**
 * ChatHistory Component
 * 
 * Manages and displays chat history
 */
const ChatHistory = ({ onSelectHistory, onClearHistory }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const chatHistory = await apiService.getChatHistorySessions();
        setHistory(chatHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (isLoading) {
    return <div className="history-loading">Loading history...</div>;
  }
  
  if (history.length === 0) {
    return <div className="history-empty">No chat history found</div>;
  }
  
  return (
    <div className="chat-history">
      <div className="history-header">
        <h3>Chat History</h3>
        <button 
          className="clear-history-button"
          onClick={onClearHistory}
          title="Clear all history"
        >
          🗑️
        </button>
      </div>
      
      <div className="history-list">
        {history.map((session, index) => (
          <div 
            key={index}
            className="history-item"
            onClick={() => onSelectHistory(session.id)}
          >
            <div className="history-item-title">
              {session.title || `Chat ${index + 1}`}
            </div>
            <div className="history-item-date">
              {formatDate(session.timestamp)}
            </div>
            <div className="history-item-preview">
              {session.preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;