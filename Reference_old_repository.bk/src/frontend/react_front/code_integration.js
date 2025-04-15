/**
 * Code Integration
 * Connects chat component to code generation
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing code integration...');
    
    // Wait for components to be initialized
    const checkInterval = setInterval(() => {
        if (window.app && window.app.chatComponent && window.app.holographicPanel) {
            clearInterval(checkInterval);
            initializeCodeIntegration();
        }
    }, 100);
    
    function initializeCodeIntegration() {
        console.log('Components found, setting up code integration');
        
        // Make holographic panel globally available
        window.holographicPanel = window.app.holographicPanel;
        
        // Get the chat component
        const chat = window.app.chatComponent;
        
        // Add code generation event listener
        if (chat.socket) {
            chat.socket.on('code_generation', (data) => {
                console.log('Received code generation:', data);
                
                // Update holographic panel
                if (window.holographicPanel) {
                    // Add a file to the panel
                    window.holographicPanel.addFile(data.path, data.code);
                    
                    // Add a log entry
                    window.holographicPanel.addLog('file', `Created file: ${data.path}`);
                    window.holographicPanel.addLog('code', `${data.path}: Code updated`, data.path);
                    
                    // Set active process
                    window.holographicPanel.activeProcess = 'Code Generation';
                }
            });
            
            // Override the sendMessage method to detect code generation requests
            const originalSendMessage = chat.sendMessage;
            chat.sendMessage = function(message) {
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
                    // Fallback to original method
                    originalSendMessage.call(this, message);
                }
            };
            
            console.log('Code integration initialized');
        } else {
            console.log('Socket not available, code integration not initialized');
        }
    }
});