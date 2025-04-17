import React from 'react';
import './ChatMessages.css';
import AIResponseFormatter from './AIResponseFormatter';
import CodeBlock from './CodeBlock';

/**
 * ChatMessages Component
 * 
 * Displays the chat conversation history
 */
const ChatMessages = ({ responses, onOpenCodeFile, responsesEndRef }) => {
  // Extract code blocks from message content
  const extractCodeBlocks = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'javascript';
      const code = match[2];
      const fileName = `generated_${language}_${Date.now()}.${getFileExtension(language)}`;
      
      blocks.push({
        language,
        code,
        fileName
      });
    }
    
    return blocks;
  };
  
  // Get file extension based on language
  const getFileExtension = (language) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      html: 'html',
      css: 'css',
      solidity: 'sol',
      rust: 'rs',
      go: 'go',
      ruby: 'rb',
      php: 'php',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c'
    };
    
    return extensions[language.toLowerCase()] || 'txt';
  };

  return (
    <div className="chat-messages">
      {responses.map((response, index) => (
        <div key={index} className={`message ${response.type}`}>
          {response.type === 'user' ? (
            <div className="user-message">{response.content}</div>
          ) : response.isCode ? (
            <div className="ai-message">
              <div className="message-header">
                <span className="model-badge">{response.model || 'AI'}</span>
                <span className="timestamp">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <CodeBlock 
                code={response.content.replace(/```\n|```/g, '')}
                language={response.language || 'javascript'}
                fileName={response.fileName}
                onOpenFile={() => onOpenCodeFile(
                  response.fileName,
                  response.content.replace(/```\n|```/g, ''),
                  response.language
                )}
              />
            </div>
          ) : (
            <div className="ai-message">
              <div className="message-header">
                <span className="model-badge">{response.model || 'AI'}</span>
                <span className="timestamp">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <AIResponseFormatter response={response.content} model={response.model} />
              
              {/* Extract and display code blocks as separate components */}
              {extractCodeBlocks(response.content).map((block, blockIndex) => (
                <CodeBlock 
                  key={blockIndex}
                  code={block.code}
                  language={block.language}
                  fileName={block.fileName}
                  onOpenFile={() => onOpenCodeFile(block.fileName, block.code, block.language)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={responsesEndRef} />
    </div>
  );
};

export default ChatMessages;