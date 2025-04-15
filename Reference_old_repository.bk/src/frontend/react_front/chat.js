/**
 * Chat Component
 * Handles AI chat functionality
 */
class ChatComponent {
    constructor() {
        this.messages = [];
        this.socket = null;
        this.element = null;
        this.availableModels = ['auto', 'mistral', 'deepseek', 'cohere'];
        this.selectedModel = 'auto';
        this.isLoading = false;
        this.messagesElement = null;
        this.inputElement = null;
        this.sendButtonElement = null;
        this.autoPilot = false;
        
        // Initialize refresh and history managers
        this.refreshManager = new ChatRefreshManager(this);
        this.historyManager = new ChatHistoryManager(this);
    }
    





        

    init() {
        console.log('Initializing chat component...');
        
        // Try to connect to websocket
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.addSystemMessage('Connected to AI assistant');
            });
            
            this.socket.on('ai_response', (data) => {
                this.isLoading = false;
                this.addMessage('assistant', data.response);
                this.updateUI();
            });
            
            // Add listener for code generation events
            this.socket.on('code_generation', (data) => {
                console.log('Received code generation:', data);
                
                // If we have a holographic panel, update it
                if (window.holographicPanel) {
                    // Add a file to the panel
                    window.holographicPanel.addFile(data.path, data.code);
                    
                    // Add a log entry
                    window.holographicPanel.addLog('file', `Created file: ${data.path}`);
                    window.holographicPanel.addLog('code', `${data.path}: Code updated`, data.path);
                }
            });
            
            this.socket.on('connect_error', (error) => {
                console.log('Socket connection error:', error);
                this.socket = null;
            });
        } catch (e) {
            console.log('Socket.IO not available, falling back to REST API');
            this.socket = null;
        }
        
        // Load chat history
        const historyLoaded = this.historyManager.loadHistory();
        
        // Add default welcome message if no history
        if (!historyLoaded && this.messages.length === 0) {
            this.addMessage('assistant', "Hello! I'm your AI development assistant. How can I help you today?");
        }
        
        // Set up auto-save for chat history
        this.historyManager.setupAutoSave();
        
        // Start refresh manager
        this.refreshManager.startRefresh();
        
        console.log('Chat component initialized');
    }



    
    /**
     * Render the chat component
     * @returns {HTMLElement} - Chat component element
     */
    render() {
        console.log('Rendering chat component');
        
        // Create main container
        const container = document.createElement('div');
        container.className = 'chat-container';
        container.style.padding = '0'; // Remove extra padding
        
        // Create messages container - remove extra padding
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'chat-messages';
        messagesContainer.style.padding = '5px 0'; // Reduce top/bottom padding
        
        // Add existing messages
        this.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
            messageElement.style.border = 'none'; // Remove border from messages
            
            // Check if content contains code blocks
            const content = this.formatMessageContent(msg.content);
            messageElement.innerHTML = content;
            
            messagesContainer.appendChild(messageElement);
        });
        container.appendChild(messagesContainer);
        
        // Create input area
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input';
        inputContainer.style.position = 'relative'; // For positioning elements
        
        // Create model selector buttons container
        const modelBtnContainer = document.createElement('div');
        modelBtnContainer.className = 'model-buttons';
        modelBtnContainer.style.display = 'flex';
        modelBtnContainer.style.flexDirection = 'column';
        modelBtnContainer.style.marginRight = '5px';
        
        // Create model selector button
        const modelBtn = document.createElement('button');
        modelBtn.className = 'round-button model-button';
        modelBtn.textContent = this.selectedModel.charAt(0).toUpperCase(); // First letter only
        modelBtn.title = this.selectedModel.charAt(0).toUpperCase() + this.selectedModel.slice(1);
        
        // Model selection dropdown (initially hidden)
        const modelDropdown = document.createElement('div');
        modelDropdown.className = 'model-dropdown';
        modelDropdown.style.display = 'none';
        modelDropdown.style.position = 'absolute';
        modelDropdown.style.bottom = '60px';
        modelDropdown.style.left = '5px';
        modelDropdown.style.backgroundColor = 'var(--background-color)';
        modelDropdown.style.border = '1px solid var(--primary-color)';
        modelDropdown.style.borderRadius = '4px';
        modelDropdown.style.zIndex = '100';
        
        this.availableModels.forEach(model => {
            const modelOption = document.createElement('div');
            modelOption.className = 'model-option';
            modelOption.textContent = model.charAt(0).toUpperCase(); // First letter
            modelOption.title = model.charAt(0).toUpperCase() + model.slice(1);
            modelOption.style.padding = '8px';
            modelOption.style.cursor = 'pointer';
            
            if (model === this.selectedModel) {
                modelOption.style.backgroundColor = 'rgba(0, 112, 74, 0.3)';
            }
            
            modelOption.addEventListener('click', () => {
                this.selectedModel = model;
                modelBtn.textContent = model.charAt(0).toUpperCase();
                modelBtn.title = model.charAt(0).toUpperCase() + model.slice(1);
                modelDropdown.style.display = 'none';
                
                // Update styles of selected option
                Array.from(modelDropdown.children).forEach(child => {
                    child.style.backgroundColor = child === modelOption ? 
                        'rgba(0, 112, 74, 0.3)' : 'transparent';
                });
            });
            
            modelDropdown.appendChild(modelOption);
        });
        
        // Toggle model dropdown
        modelBtn.addEventListener('click', () => {
            modelDropdown.style.display = modelDropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Create autopilot toggle button
        const autopilotBtn = document.createElement('button');
        autopilotBtn.className = 'round-button autopilot-button';
        autopilotBtn.textContent = '🔄';
        autopilotBtn.title = this.autoPilot ? 'Autopilot: ON' : 'Autopilot: OFF';
        autopilotBtn.style.backgroundColor = this.autoPilot ? '#00aa44' : '#aa0000';
        autopilotBtn.style.padding = '3px 3px';

        autopilotBtn.addEventListener('click', () => {
            this.autoPilot = !this.autoPilot;
            autopilotBtn.title = this.autoPilot ? 'Autopilot: ON' : 'Autopilot: OFF';
            autopilotBtn.style.backgroundColor = this.autoPilot ? '#00aa44' : '#aa0000';
        });
        
        // Add buttons to container
        modelBtnContainer.appendChild(modelBtn);
        modelBtnContainer.appendChild(autopilotBtn);
        
        // Create expandable textarea instead of input
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Type your message here...';
        textarea.disabled = this.isLoading;

        // Remove any inline styles that might override the CSS
        // textarea.style.resize = 'none'; - Remove this
        // textarea.style.minHeight = '20px'; - Remove this
        // textarea.style.maxHeight = '200px'; - Remove this
        // textarea.style.transition = 'height 0.1s ease'; - Remove this
        // textarea.style.paddingRight = '5px'; - Remove this

        // Instead, add this class to ensure CSS styles are applied
        textarea.className = 'chat-textarea';

        // Add auto-resize functionality
        textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
        });

        // Auto-resize textarea
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 200);
            textarea.style.height = `${newHeight}px`;
        });
        
        // Create send button (positioned inside textarea)
        const sendButtonContainer = document.createElement('div');
        sendButtonContainer.style.position = 'absolute';
        sendButtonContainer.style.right = '10px';
        sendButtonContainer.style.bottom = '10px';
        
        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.innerHTML = this.isLoading ? '<div class="loading-indicator"></div>' : '➤';
        sendButton.disabled = this.isLoading;
        sendButton.style.width = '30px';
        sendButton.style.height = '30px';
        
        // Add event listeners
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(textarea.value);
                textarea.value = '';
                textarea.style.height = '20px'; // Reset height
            }
        });
        
        sendButton.addEventListener('click', () => {
            this.sendMessage(textarea.value);
            textarea.value = '';
            textarea.style.height = '20px'; // Reset height
        });
        
        // Assemble input container
        inputContainer.appendChild(modelBtnContainer);
        inputContainer.appendChild(textarea);
        inputContainer.appendChild(sendButtonContainer);
        sendButtonContainer.appendChild(sendButton);
        inputContainer.appendChild(modelDropdown);
        
        container.appendChild(inputContainer);
        
        // Store reference to elements
        this.element = container;
        this.messagesElement = messagesContainer;
        this.inputElement = textarea;
        this.sendButtonElement = sendButton;
        
        // Add click event to document to hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!modelBtn.contains(e.target) && !modelDropdown.contains(e.target)) {
                modelDropdown.style.display = 'none';
            }
        });
        
        return container;
    }



    /**
     * Format message content with code block handling
     * @param {string} content - Message content
     * @returns {string} - Formatted HTML content
     */
    formatMessageContent(content) {
        // Ensure content is a string
        if (content === null || content === undefined) {
            return '';
        }

        // Convert to string if it's not already
        if (typeof content !== 'string') {
            try {
                content = String(content);
            } catch (e) {
                console.error('Error converting content to string:', e);
                return '';
            }
        }

        // Check if content contains code blocks
        if (content.includes('```')) {
            let formattedContent = '';
            let inCodeBlock = false;
            let language = '';
            
            // Split by code block markers
            const parts = content.split('```');
            
            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    // Regular text
                    formattedContent += part;
                } else {
                    // Code block
                    const firstNewline = part.indexOf('\n');
                    if (firstNewline > 0) {
                        language = part.substring(0, firstNewline).trim();
                        part = part.substring(firstNewline + 1);
                    }
                    
                    // Create code block container
                    formattedContent += `
                        <div class="code-block-container">
                            <div class="code-block-header">
                                <span class="code-language">${language || 'code'}</span>
                                <button class="copy-code-btn" title="Copy code">📋</button>
                            </div>
                            <pre class="code-block"><code>${this.escapeHtml(part)}</code></pre>
                        </div>
                    `;
                }
            });
            
            return formattedContent;
        }

        return content;
    }



    


    
    /**
     * Escape HTML characters to prevent XSS
     * @param {string} html - Raw HTML 
     * @returns {string} - Escaped HTML
     */
    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
    
    /**
     * Add copy code functionality to code blocks
     */
    addCopyCodeFunctionality() {
        if (!this.messagesElement) return;
        
        const copyButtons = this.messagesElement.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const codeBlock = button.closest('.code-block-container').querySelector('code');
                const textToCopy = codeBlock.textContent;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show copied feedback
                    const originalText = button.textContent;
                    button.textContent = '✓';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                });
            });
        });
    }
    
    /**
     * Send a message
     * @param {string} message - Message to send
     */
 

    sendMessage(message) {
        if (!message || !message.trim()) return;
        
        console.log(`Sending message: ${message}`);
        this.isLoading = true;
        
        // Add user message
        this.addMessage('user', message);
        
        // Update UI
        this.updateUI();
        
        // Check if this is a code generation request
        const isCodeRequest = message.toLowerCase().includes('create') || 
                             message.toLowerCase().includes('build') ||
                             message.toLowerCase().includes('generate') ||
                             message.toLowerCase().includes('develop');
        
        // Send to server
        if (this.socket && this.socket.connected) {
            if (isCodeRequest) {
                console.log('Detected code generation request, using generate_code event');
                this.socket.emit('generate_code', {
                    prompt: message,
                    model: this.selectedModel,
                    autopilot: this.autoPilot
                });
            } else {
                this.socket.emit('send_message', {
                    message: message,
                    model: this.selectedModel,
                    autopilot: this.autoPilot
                });
            }
        } else {
            // Fallback to REST API
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    model: this.selectedModel,
                    autopilot: this.autoPilot
                })
            })
            .then(response => response.json())
            .then(data => {
                this.isLoading = false;
                this.addMessage('assistant', data.content || data.response);
                this.updateUI();
            })
            .catch(error => {
                console.error('Error:', error);
                this.isLoading = false;
                this.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
                this.updateUI();
            });
        }
    }
    
    








    /**
     * Add a message to the chat
     * @param {string} role - Message role ('user' or 'assistant')
     * @param {string} content - Message content
     */
    addMessage(role, content) {
        this.messages.push({
            role: role,
            content: content,
            timestamp: new Date()
        });
    }
    
    /**
     * Add a system message
     * @param {string} content - Message content
     */
    addSystemMessage(content) {
        console.log(`System message: ${content}`);
        // Optionally add system messages to the chat
    }
    

    /**
     * Update the UI
     */
    updateUI() {
        // If we don't have a reference to the messages element, exit
        if (!this.messagesElement || !this.element) return;
        
        // Update send button state if it exists
        if (this.sendButtonElement) {
            this.sendButtonElement.innerHTML = this.isLoading ? 
                '<div class="loading-indicator"></div>' : '➤';
            this.sendButtonElement.disabled = this.isLoading;
        }
        
        // Update input field state if it exists
        if (this.inputElement) {
            this.inputElement.disabled = this.isLoading;
        }
        
        // No need to rebuild the entire message list - just check if we need to add new messages
        const currentMessageCount = this.messagesElement.querySelectorAll('.message').length;
        
        if (currentMessageCount < this.messages.length) {
            // We have new messages to add
            for (let i = currentMessageCount; i < this.messages.length; i++) {
                const msg = this.messages[i];
                const messageElement = document.createElement('div');
                messageElement.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
                
                // Check if content contains code blocks
                const content = this.formatMessageContent(msg.content);
                messageElement.innerHTML = content;
                
                this.messagesElement.appendChild(messageElement);
            }
            
            // Add copy code functionality to new messages
            this.addCopyCodeFunctionality();
            
            // Scroll to bottom
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
        }
    }
    
}