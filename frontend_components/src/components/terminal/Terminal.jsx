import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';
import appConfig from '../../config/appConfig';
import { executeCommand, getAvailableCommands } from './terminal_commands';
import { useWorkspace } from '../../context/WorkspaceContext';

/**
 * Terminal Component
 * 
 * A dual-tab terminal with:
 * - Problems tab: Shows errors, warnings, and info messages
 * - Terminal tab: Command-line interface with history
 */
const Terminal = () => {
  const [activeTab, setActiveTab] = useState('terminal'); // Default to Terminal tab
  const [problems, setProblems] = useState([
    { 
      type: 'error', 
      message: 'Cannot find module \'./utils\'', 
      file: 'src/components/CodeEditor.jsx', 
      line: 12, 
      column: 8 
    },
    { 
      type: 'warning', 
      message: 'Variable \'result\' is defined but never used', 
      file: 'src/services/api.js', 
      line: 45, 
      column: 10 
    },
    { 
      type: 'info', 
      message: 'Consider using const instead of let for read-only variables', 
      file: 'src/hooks/useData.js', 
      line: 23, 
      column: 5 
    },
    { 
      type: 'error', 
      message: 'Unexpected token, expected ";"', 
      file: 'src/components/Dashboard.jsx', 
      line: 78, 
      column: 32 
    }
  ]);
  
  const [history, setHistory] = useState([
    { type: 'info', content: `${appConfig.appName} Terminal v${appConfig.version}` },
    { type: 'info', content: 'Type "help" for available commands' },
  ]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('~/.Repositories');
  
  // Try to use the workspace context, but don't fail if it's not available
  let workspaceContext;
  try {
    workspaceContext = useWorkspace();
  } catch (error) {
    workspaceContext = { activeWorkspace: null };
  }
  
  const { activeWorkspace } = workspaceContext;

  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [problems, history, activeTab]);

  // Focus input when terminal tab is active
  useEffect(() => {
    if (activeTab === 'terminal' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  // Count problems by type
  const errorCount = problems.filter(p => p.type === 'error').length;
  const warningCount = problems.filter(p => p.type === 'warning').length;
  const infoCount = problems.filter(p => p.type === 'info').length;

  // Process command using the terminal_commands module
  const processCommand = async (cmd) => {
    // Add command to history even if empty
    const newHistory = [...history, { type: 'command', content: `${currentDirectory}$ ${cmd}` }];
    setHistory(newHistory);
    
    // If command is empty, just add a new line and return
    if (!cmd.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Execute the command
      const result = await executeCommand(cmd);
      
      if (!result) {
        return;
      }
      
      if (result.type === 'clear') {
        setHistory([
          { type: 'info', content: `${appConfig.appName} Terminal v${appConfig.version}` },
          { type: 'info', content: 'Type "help" for available commands' },
        ]);
        return;
      }
      
      // Update current directory if command changed it
      if (result.newDirectory) {
        setCurrentDirectory(result.newDirectory);
      }
      
      // Add result to history
      const updatedHistory = [...newHistory, { type: result.type, content: result.content }];
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error processing command:', error);
      const errorHistory = [...newHistory, { type: 'error', content: `Error: ${error.message}` }];
      setHistory(errorHistory);
    } finally {
      setIsProcessing(false);
    }
    
    // Add to command history (only non-empty commands)
    if (cmd.trim()) {
      setCommandHistory([cmd, ...commandHistory]);
    }
    
    // Reset history index
    setHistoryIndex(-1);
  };

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault();
    processCommand(command);
    setCommand('');
  };

  // Handle key navigation through command history
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    if (activeTab === 'terminal') {
      setHistory([
        { type: 'info', content: `${appConfig.appName} Terminal v${appConfig.version}` },
        { type: 'info', content: 'Type "help" for available commands' },
      ]);
    } else {
      setProblems([]);
    }
  };

  // Copy terminal content
  const copyTerminal = () => {
    let content = '';
    
    if (activeTab === 'terminal') {
      content = history.map(item => {
        if (item.type === 'command') return item.content;
        return `  ${item.content}`;
      }).join('\n');
    } else {
      content = problems.map(problem => {
        return `${problem.type === 'error' ? '❌' : problem.type === 'warning' ? '⚠️' : 'ℹ️'} ${problem.message}\n${problem.file}:${problem.line}:${problem.column}`;
      }).join('\n\n');
    }
    
    navigator.clipboard.writeText(content)
      .then(() => {
        // Add temporary copy confirmation
        if (activeTab === 'terminal') {
          setHistory([...history, { type: 'info', content: 'Terminal content copied to clipboard' }]);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button 
            className={`terminal-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            PROBLEMS
            <div className="tab-counts">
              <span className="error-count">{errorCount}</span>
              <span className="warning-count">{warningCount}</span>
              <span className="info-count">{infoCount}</span>
            </div>
          </button>
          <button 
            className={`terminal-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            Terminal
          </button>
        </div>
        
        {/* Controls moved to the right - removed the + button */}
        <div className="terminal-controls">
          <button 
            className="terminal-control-button" 
            onClick={copyTerminal}
            title="Copy content"
          >
            📋
          </button>
          <button 
            className="terminal-control-button" 
            onClick={clearTerminal}
            title="Clear content"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="terminal-content" ref={outputRef}>
        {activeTab === 'problems' ? (
          // Problems tab content
          <div className="problems-content">
            {problems.map((problem, index) => (
              <div key={index} className={`problem-line ${problem.type}`}>
                <div className="problem-icon">
                  {problem.type === 'error' ? '❌' : problem.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="problem-content">
                  <div className="problem-message">{problem.message}</div>
                  <div className="problem-location">
                    {problem.file}:{problem.line}:{problem.column}
                  </div>
                </div>
              </div>
            ))}
            {problems.length === 0 && (
              <div className="no-problems">No problems detected in workspace</div>
            )}
          </div>
        ) : (
          // Terminal tab content
          <div className="terminal-output">
            {history.map((item, index) => (
              <div key={index} className={`terminal-line ${item.type}`}>
                {item.content}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {activeTab === 'terminal' && (
        <div className="terminal-input-container">
          <form onSubmit={handleSubmit} className="terminal-input-form">
            <div className="terminal-prompt">
              {activeWorkspace ? `${activeWorkspace.name}$ ` : `${currentDirectory}$ `}
            </div>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isProcessing ? "Processing..." : ""}
              disabled={isProcessing}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default Terminal;