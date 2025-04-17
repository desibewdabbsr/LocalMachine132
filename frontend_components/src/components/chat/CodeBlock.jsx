import React, { useState } from 'react';
import './CodeBlock.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * CodeBlock Component
 * 
 * Displays code with syntax highlighting and file operations
 */
const CodeBlock = ({ code, language, fileName, onOpenFile }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  // Get language for syntax highlighting
  const getHighlightLanguage = (lang) => {
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'sol': 'solidity',
      'java': 'java',
      'html': 'html',
      'css': 'css',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'json': 'json',
      'md': 'markdown'
    };
    
    // Remove any non-alphanumeric characters
    const cleanLang = lang.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return languageMap[cleanLang] || cleanLang;
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="file-info">
          <span className="file-icon">📄</span>
          <span className="file-name">{fileName}</span>
          <span className="language-badge">{language}</span>
        </div>
        <div className="code-actions">
          <button 
            className="code-action-button"
            onClick={copyToClipboard}
            title="Copy code"
          >
            {isCopied ? '✓' : '📋'}
          </button>
          <button 
            className="code-action-button"
            onClick={onOpenFile}
            title="Open in editor"
          >
            📝
          </button>
        </div>
      </div>
      <div className="code-content">
        <SyntaxHighlighter 
          language={getHighlightLanguage(language)} 
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 4px 4px',
            maxHeight: '400px'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;