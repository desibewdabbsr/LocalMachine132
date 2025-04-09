import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';
import appConfig from '../../config/appConfig';

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

  // Process command
  const processCommand = (cmd) => {
    // Add command to history
    const newHistory = [...history, { type: 'command', content: `$ ${cmd}` }];
    
    // Process command (this would be replaced with actual command processing)
    switch (cmd.toLowerCase()) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Available commands: help, clear, version, status' });
        break;
      case 'clear':
        setHistory([
          { type: 'info', content: `${appConfig.appName} Terminal v${appConfig.version}` },
          { type: 'info', content: 'Type "help" for available commands' },
        ]);
        return;
      case 'version':
        newHistory.push({ type: 'output', content: `${appConfig.appName} v${appConfig.version}` });
        break;
      case 'status':
        newHistory.push({ type: 'output', content: 'All systems operational' });
        break;
      default:
        if (cmd.trim()) {
          newHistory.push({ type: 'error', content: `Command not found: ${cmd}` });
        }
    }
    
    setHistory(newHistory);
    
    // Add to command history
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
        
        {/* Controls moved to the right */}
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
      
      {activeTab === 'terminal' ? (
        <form onSubmit={handleSubmit} className="terminal-input-form">
          <span className="terminal-prompt">$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
          />
        </form>
      ) : (
        <div className="terminal-input-form">
          <input
            type="text"
            className="terminal-input"
            placeholder="Filter problems..."
            disabled
          />
        </div>
      )}
    </div>
  );
};

export default Terminal;