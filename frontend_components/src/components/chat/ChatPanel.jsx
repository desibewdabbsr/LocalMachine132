import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import ChatControls from './ChatControls';
import ModelSwitchNotification from './ModelSwitchNotification';
import ChatHistory from './ChatHistory';
import apiService from '../../services/apiService';

/**
 * ChatPanel Component
 * 
 * A chat interface with:
 * - Auto-expanding prompt box
 * - Model selection button with dropdown
 * - Auto-Pilot toggle with flight icon
 * - AI Voice toggle
 * - Send/Process/Stop button
 * - Positioned at bottom with 2% space from notification bar
 */
const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('A'); // Default: Auto
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [responses, setResponses] = useState([]);
  const [showModelSwitch, setShowModelSwitch] = useState(false);
  const [currentModelName, setCurrentModelName] = useState('auto');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const responsesEndRef = useRef(null);

  // Models available for selection - updated to match backend
  const models = [
    { id: 'A', name: 'Auto', apiName: 'auto' },
    { id: 'M', name: 'Mistral', apiName: 'llama' },
    { id: 'D', name: 'Deepseek', apiName: 'deepseek' },
    { id: 'H', name: 'Cohere', apiName: 'cohere' }
  ];

  // Scroll to bottom when new responses are added
  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responses]);

  // Initialize socket connection and check server health
  useEffect(() => {
    // Initialize socket
    apiService.initSocket();
    
    // Check server health
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          const data = await response.json();
          setConnectionStatus('connected');
          console.log('Server health:', data);
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setConnectionStatus('error');
      }
    };
    
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    // Load chat history
    loadChatHistory();
    
    return () => clearInterval(interval);
  }, []);

  // Load chat history from local storage or API
  const loadChatHistory = async () => {
    try {
      // Just load from local storage since the API function doesn't exist
      const savedHistory = localStorage.getItem('chat-history');
      if (savedHistory) {
        setResponses(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save chat history to local storage and API
  const saveChatHistory = (history) => {
    try {
      localStorage.setItem('chat-history', JSON.stringify(history));
      // Remove the API call that doesn't exist
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Handle message change
  const handleMessageChange = (newMessage) => {
    setMessage(newMessage);
  };

  // Toggle model dropdown
  const toggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
  };

  // Select a model
  const selectModel = (modelId) => {
    const previousModel = models.find(model => model.id === selectedModel);
    const newModel = models.find(model => model.id === modelId);
    
    setSelectedModel(modelId);
    setShowModelDropdown(false);
    
    if (previousModel.apiName !== newModel.apiName) {
      setCurrentModelName(newModel.apiName);
      setShowModelSwitch(true);
      
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowModelSwitch(false);
      }, 2000);
    }
  };

  // Toggle auto-pilot mode
  const toggleAutoPilot = () => {
    setIsAutoPilot(!isAutoPilot);
  };

  // Toggle voice mode
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  // Get the API model name from the selected model ID
  const getApiModelName = () => {
    const model = models.find(model => model.id === selectedModel);
    return model ? model.apiName : 'auto';
  };

  // Simulate generation progress
  const simulateGenerationProgress = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };

  // Handle opening a code file
  const handleOpenCodeFile = (fileName, content, language) => {
    // Create a unique ID for this file
    const fileTabId = `file-${Date.now()}`;

    // Create the file object to be passed to the editor
    const fileData = {
      id: fileTabId,
      serviceId: 'file-editor',
      title: fileName,
      data: {
        fileId: fileTabId,
        fileName: fileName,
        language: language || 'javascript',
        content: content || ''
      }
    };

    // Dispatch a custom event that WorkspaceManager can listen to
    const openFileEvent = new CustomEvent('LocalMachine132:openFile', {
      detail: {
        targetWorkspace: 'workspace2',
        file: fileData
      }
    });

    window.dispatchEvent(openFileEvent);
  };

  // Handle sending or stopping message processing
  const handleSendOrStop = async () => {
    if (isProcessing) {
      // Stop processing - would need to implement cancellation logic
      setIsProcessing(false);
    } else if (message.trim()) {
      // Start processing
      setIsProcessing(true);
      
      // Add user message to responses
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      const newResponses = [...responses, userMessage];
      setResponses(newResponses);
      
      // Start generation progress animation
      const stopSimulation = simulateGenerationProgress();
      
      try {
        let response;
        
        // Get the API model name
        const modelName = getApiModelName();
        
        if (isAutoPilot) {
          // In Auto-Pilot mode, treat the message as a code generation request
          // or as a command to the Auto-Pilot system
          if (message.toLowerCase().includes('next module') || 
              message.toLowerCase().includes('continue') ||
              message.toLowerCase().includes('next step')) {
            // Process next module command
            response = await apiService.processNextModule();
          } else if (message.toLowerCase().includes('status') ||
                    message.toLowerCase().includes('progress')) {
            // Get status command
            response = await apiService.getAutoPilotStatus();
          } else {
            // Treat as code generation request
            response = await apiService.generateCode(message, modelName);
          }
        } else {
          // Normal mode - process message with the selected model
          response = await apiService.processMessage(message, modelName);
        }
        
        // Add AI response to responses
        const aiResponse = {
          type: 'ai',
          content: response.content || response.response || response.error || 'No response received',
          model: response.model || modelName,
          timestamp: new Date().toISOString()
        };
        
        const updatedResponses = [...newResponses, aiResponse];
        setResponses(updatedResponses);
        
        // If we received code, also add it as a separate message
        if (response.code) {
          const codeResponse = {
            type: 'ai',
            content: `\`\`\`\n${response.code}\n\`\`\``,
            model: response.model || modelName,
            timestamp: new Date().toISOString(),
            isCode: true,
            fileName: response.fileName || 'generated_code.js',
            language: response.language || 'javascript'
          };
          
          const finalResponses = [...updatedResponses, codeResponse];
          setResponses(finalResponses);
          
          // Save the updated chat history
          saveChatHistory(finalResponses);
        } else {
          // Save the updated chat history
          saveChatHistory(updatedResponses);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Add error response
        const errorResponse = {
          type: 'ai',
          content: `Error: ${error.message}`,
          model: getApiModelName(),
          timestamp: new Date().toISOString()
        };
        
        const updatedResponses = [...newResponses, errorResponse];
        setResponses(updatedResponses);
        
        // Save the updated chat history
        saveChatHistory(updatedResponses);
      } finally {
        stopSimulation();
        setIsProcessing(false);
        setMessage('');
      }
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setResponses([]);
    saveChatHistory([]);
  };

  return (
    <div className="chat-container">
      {/* Connection status indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? 'Connected to AI Server' : 
         connectionStatus === 'connecting' ? 'Connecting to AI Server...' : 
         'Connection Error - Server Unavailable'}
      </div>
      
      {/* Chat messages area */}
      <ChatMessages 
        responses={responses} 
        onOpenCodeFile={handleOpenCodeFile}
        responsesEndRef={responsesEndRef}
      />
      
      {/* Generation progress indicator */}
      {isGenerating && (
        <div className="generation-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${generationProgress}%` }}
          ></div>
          <div className="progress-text">
            Generating response... {Math.round(generationProgress)}%
          </div>
        </div>
      )}
      
      {/* Model switch notification */}
      <ModelSwitchNotification 
        model={currentModelName} 
        isVisible={showModelSwitch} 
      />
      
      <div className="chat-panel">
        {/* Left side controls */}
        <ChatControls 
          position="left"
          selectedModel={selectedModel}
          models={models}
          showModelDropdown={showModelDropdown}
          isAutoPilot={isAutoPilot}
          onToggleModelDropdown={toggleModelDropdown}
          onSelectModel={selectModel}
          onToggleAutoPilot={toggleAutoPilot}
        />
        
        {/* Chat input area */}
        <ChatInput 
          message={message}
          isProcessing={isProcessing}
          onChange={handleMessageChange}
          onSend={handleSendOrStop}
        />
        
        {/* Right side controls */}
        <ChatControls 
          position="right"
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={toggleVoice}
          onClearHistory={clearChatHistory}
        />
      </div>
    </div>
  );
};

export default ChatPanel;