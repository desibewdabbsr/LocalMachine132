import React, { useRef, useEffect } from 'react';
import './ChatInput.css';

/**
 * ChatInput Component
 * 
 * Handles the text input area for the chat
 */
const ChatInput = ({ message, isProcessing, onChange, onSend }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate proper scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.4; // 40% of viewport height
      
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        // Only show scrollbar within the textarea itself
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [message]);

  // Handle message change
  const handleMessageChange = (e) => {
    onChange(e.target.value);
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className="chat-input"
      value={message}
      onChange={handleMessageChange}
      onKeyDown={handleKeyDown}
      placeholder={isProcessing ? "Processing..." : "Ask me anything..."}
      disabled={isProcessing}
      rows={1}
    />
  );
};

export default ChatInput;