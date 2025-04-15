import React, { useState, useEffect, useRef } from 'react';
import './ProcessPanel.css';
import apiService from '../../services/apiService';

/**
 * Process Panel Component
 * 
 * Shows logs of AI operations and code generation
 * Now connected to real-time updates via socket.io
 */
const ProcessPanel = () => {
  const [logs, setLogs] = useState([]);
  const [activeProcess, setActiveProcess] = useState(null);
  const [files, setFiles] = useState({});
  const logsEndRef = useRef(null);

  // Initialize with system connection message
  useEffect(() => {
    const initialLogs = [
      { type: 'system', message: 'Connected to AI system', timestamp: new Date().toLocaleTimeString() },
      { type: 'process', message: 'Ready for code generation', timestamp: new Date().toLocaleTimeString() }
    ];
    setLogs(initialLogs);
    
    // Initialize socket connection for real-time updates
    const socket = apiService.initSocket();
    
    // Listen for process updates via custom events
    const handleProcessUpdate = (event) => {
      const update = event.detail;
      console.log('ProcessPanel received update:', update);
      
      // Add timestamp if not present
      const updatedUpdate = {
        ...update,
        timestamp: update.timestamp || new Date().toLocaleTimeString()
      };
      
      addLog(updatedUpdate.type, updatedUpdate.message, updatedUpdate.path);
      
      // If this is a process start update, set the active process
      if (updatedUpdate.type === 'process' && updatedUpdate.message.includes('Starting')) {
        setActiveProcess(updatedUpdate.message);
      }
      
      // If this is a process completion update, clear the active process
      if (updatedUpdate.type === 'process' && updatedUpdate.message.includes('completed')) {
        setActiveProcess(null);
      }
      
      // If this is a file update, store the file content
      if (updatedUpdate.type === 'file' || updatedUpdate.type === 'code') {
        if (updatedUpdate.path) {
          setFiles(prev => ({
            ...prev,
            [updatedUpdate.path]: updatedUpdate.message
          }));
        }
      }
    };
    
    // Listen for socket connection events
    const handleSocketConnected = () => {
      addLog('system', 'Socket connected to server', null);
    };
    
    const handleSocketDisconnected = () => {
      addLog('system', 'Socket disconnected from server', null);
    };
    
    // Add event listeners
    document.addEventListener('process-update', handleProcessUpdate);
    document.addEventListener('socket-connected', handleSocketConnected);
    document.addEventListener('socket-disconnected', handleSocketDisconnected);
    
    // Also listen directly to the socket for process_update events
    if (socket) {
      socket.on('process_update', (update) => {
        console.log('Direct socket process update:', update);
        // Add timestamp if not present
        const updatedUpdate = {
          ...update,
          timestamp: update.timestamp || new Date().toLocaleTimeString()
        };
        
        addLog(updatedUpdate.type, updatedUpdate.message, updatedUpdate.path);
        
        // If this is a process start update, set the active process
        if (updatedUpdate.type === 'process' && updatedUpdate.message.includes('Starting')) {
          setActiveProcess(updatedUpdate.message);
        }
        
        // If this is a process completion update, clear the active process
        if (updatedUpdate.type === 'process' && updatedUpdate.message.includes('completed')) {
          setActiveProcess(null);
        }
        
        // If this is a file update, store the file content
        if (updatedUpdate.type === 'file' || updatedUpdate.type === 'code') {
          if (updatedUpdate.path) {
            setFiles(prev => ({
              ...prev,
              [updatedUpdate.path]: updatedUpdate.message
            }));
          }
        }
      });
      
      // Handle connection events directly from socket
      socket.on('connect', () => {
        console.log('Socket connected directly');
        addLog('system', 'Socket connected to server', null);
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected directly');
        addLog('system', 'Socket disconnected from server', null);
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        addLog('error', `Socket error: ${error}`, null);
      });
    } else {
      // If socket initialization failed, log it
      addLog('error', 'Failed to initialize socket connection. Real-time updates not available.', null);
    }
    
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('process-update', handleProcessUpdate);
      document.removeEventListener('socket-connected', handleSocketConnected);
      document.removeEventListener('socket-disconnected', handleSocketDisconnected);
      
      if (socket) {
        socket.off('process_update');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
      }
    };
  }, []);

  // Add a log entry
  const addLog = (type, message, path = null) => {
    // Check for duplicate file logs
    if (type === 'file') {
      // If this is a file creation log and we already have an "Added file" log for the same path,
      // don't add another log entry
      if (message.startsWith('Created file:') && 
          logs.some(log => 
            log.type === 'file' && 
            log.message.startsWith('Added file:') && 
            log.message.includes(path)
          )) {
        return;
      }
    }
    
    const newLog = {
      type,
      message,
      path,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
  };

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Get icon for log type
  const getLogIcon = (type) => {
    switch (type) {
      case 'system':
        return '🔧';
      case 'process':
        return '⚙️';
      case 'file':
        return '📄';
      case 'code':
        return '💻';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  // Handle file click
  const handleFileClick = (path) => {
    // Open file in editor or show file content
    console.log('File clicked:', path);
    
    // This would typically open the file in an editor component
    // For now, just show an alert with the file content
    if (files[path]) {
      // In a real application, you would dispatch an action to open the file in an editor
      alert(`File content for ${path}:\n\n${files[path].substring(0, 200)}...`);
    } else {
      alert(`File ${path} not found in memory. It may need to be loaded from the server.`);
    }
  };

  return (
    <div className="process-panel">
      <div className="process-header">
        <h2>Process Monitor</h2>
        {activeProcess && (
          <div className="active-process">
            <div className="spinner"></div>
            <span>{activeProcess}</span>
          </div>
        )}
      </div>
      
      <div className="process-logs">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry ${log.type}`}>
            <span className="log-timestamp">{log.timestamp}</span>
            <span className="log-icon">{getLogIcon(log.type)}</span>
            <span className="log-message">
              {log.path ? (
                <span 
                  className="file-link" 
                  onClick={() => handleFileClick(log.path)}
                >
                  {log.message}
                </span>
              ) : (
                log.message
              )}
            </span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default ProcessPanel;