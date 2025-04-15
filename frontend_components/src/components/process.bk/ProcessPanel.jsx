import React, { useState, useEffect, useRef } from 'react';
import './ProcessPanel.css';

/**
 * Process Panel Component
 * 
 * Shows logs of AI operations and code generation
 * Simplified to focus only on the process view
 */
const ProcessPanel = () => {
  const [logs, setLogs] = useState([]);
  const [activeProcess, setActiveProcess] = useState(null);
  const [files, setFiles] = useState({});
  const logsEndRef = useRef(null);

  // Simulate initial logs for demonstration
  useEffect(() => {
    const initialLogs = [
      { type: 'system', message: 'Connected to AI system', timestamp: new Date() },
      { type: 'process', message: 'Ready for code generation', timestamp: new Date() }
    ];
    setLogs(initialLogs);
  }, []);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

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
    
    setLogs(prev => [...prev, {
      type,
      message,
      path,
      timestamp: new Date()
    }]);
    
    // If this is a code entry, update the file content
    if (type === 'code' && path) {
      setFiles(prev => ({
        ...prev,
        [path]: message
      }));
    }
  };

  // View a specific file
  const viewFile = (path) => {
    // In a real implementation, this would open the file in the editor
    console.log('Opening file:', path);
    
    // Dispatch an event to open the file in the editor
    const event = new CustomEvent('openFile', {
      detail: {
        targetWorkspace: 'workspace2', // Open in workspace2 (top right)
        file: {
          id: `file-${path}`,
          serviceId: 'file-editor',
          title: path.split('/').pop(),
          data: {
            fileId: `file-${path}`,
            fileName: path.split('/').pop(),
            language: path.endsWith('.sol') ? 'solidity' : 'javascript',
            content: files[path] || '// No content available'
          }
        }
      }
    });
    document.dispatchEvent(event);
  };

  // Render a log entry
  const renderLogEntry = (log, index) => {
    return (
      <div key={index} className={`log-entry ${log.type}-log`}>
        <span className="log-timestamp">
          {log.timestamp.toLocaleTimeString()}
        </span>
        
        <span className="log-icon">
          {log.type === 'system' ? '🔧' : 
           log.type === 'process' ? '⚙️' : 
           log.type === 'file' ? '📄' : 
           log.type === 'code' ? '💻' : '📌'}
        </span>
        
        <span className="log-message">
          {log.type === 'code' ? (
            <>
              <button 
                className="view-code-btn"
                onClick={() => viewFile(log.path)}
              >
                View
              </button>
              <strong>{log.path}</strong>: Code updated
            </>
          ) : (
            log.message
          )}
        </span>
      </div>
    );
  };

  // Simulate code generation process
  const simulateCodeGeneration = () => {
    setActiveProcess('Code Generation');
    
    // Add initial logs
    addLog('process', 'Starting code generation for: Please create a solidity contract in 0.8.0 ...');
    addLog('process', 'Generating code...');
    
    // Simulate delay for code generation
    setTimeout(() => {
      addLog('process', 'Code generated, processing files...');
      
      // Simulate file creation
      const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;
    
    event ValueChanged(uint256 newValue);
    
    function setValue(uint256 _value) public {
        value = _value;
        emit ValueChanged(_value);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`;
      
      const filePath = 'projects/generated/SimpleStorage.sol';
      
      // Add file logs - only add one file creation log
      addLog('file', `Added file: ${filePath}`, filePath);
      
      // Add code log with View button at the beginning
      addLog('code', solCode, filePath);
      
      // Complete the process
      addLog('process', 'Code generation completed');
      setActiveProcess(null);
    }, 2000);
  };

  return (
    <div className="process-panel">
      {/* Header */}
      <div className="process-header">
        <div className="process-title">
          <span className="title-glow">AI</span> Process Monitor
        </div>
      </div>
      
      {/* Content area - only process logs */}
      <div className="process-content">
        <div className="process-logs">
          {logs.map((log, index) => renderLogEntry(log, index))}
          <div ref={logsEndRef} />
          
          {/* Demo button for testing */}
          <div className="demo-controls">
            <button 
              className="generate-btn"
              onClick={simulateCodeGeneration}
              disabled={activeProcess !== null}
            >
              Simulate Code Generation
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer with status */}
      <div className="process-footer">
        <div className="status">
          <span className={`status-indicator ${activeProcess ? 'active' : ''}`}></span>
          <span className="status-text">
            {activeProcess || 'Idle'}
          </span>
        </div>
        
        <div className="file-count">
          Files: {Object.keys(files).length}
        </div>
      </div>
    </div>
  );
};

export default ProcessPanel;