/**
 * Chat History Manager
 * Handles saving and loading chat history
 */
class ChatHistoryManager {
    constructor(chatComponent) {
        this.chatComponent = chatComponent;
        this.storageKey = 'ai_chat_history';
        this.maxHistoryLength = 100; // Maximum number of messages to store
        this.lastSaveTime = Date.now();
        this.saveInterval = 5000; // Default save interval in ms
        
        console.log('Chat history manager created');
    }
    
    /**
     * Save the current chat history to localStorage
     */
    saveHistory() {
        if (!this.chatComponent || !this.chatComponent.messages) {
            console.error('Cannot save history: chat component or messages not available');
            return false;
        }
        
        // Only save if enough time has passed since last save
        const now = Date.now();
        if (now - this.lastSaveTime < this.saveInterval) {
            return false;
        }
        
        try {
            // Limit the number of messages to save
            const messagesToSave = this.chatComponent.messages.slice(-this.maxHistoryLength);
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify({
                messages: messagesToSave,
                timestamp: new Date().toISOString(),
                model: this.chatComponent.selectedModel
            }));
            
            this.lastSaveTime = now;
            console.log(`Saved ${messagesToSave.length} messages to history`);
            return true;
        } catch (e) {
            console.error('Failed to save chat history:', e);
            return false;
        }
    }
    
    /**
     * Load chat history from localStorage
     * @returns {boolean} - Whether history was successfully loaded
     */
    loadHistory() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            
            if (!savedData) {
                console.log('No saved chat history found');
                return false;
            }
            
            const parsedData = JSON.parse(savedData);
            
            if (!parsedData || !Array.isArray(parsedData.messages)) {
                console.log('Invalid chat history format');
                return false;
            }
            
            // Restore messages
            this.chatComponent.messages = parsedData.messages;
            
            // Restore model if available
            if (parsedData.model && this.chatComponent.availableModels.includes(parsedData.model)) {
                this.chatComponent.selectedModel = parsedData.model;
            }
            
            console.log(`Loaded ${parsedData.messages.length} messages from history`);
            
            // Update UI if possible
            if (typeof this.chatComponent.updateUI === 'function') {
                this.chatComponent.updateUI();
            }
            
            return true;
        } catch (e) {
            console.error('Failed to load chat history:', e);
            return false;
        }
    }
    
    /**
     * Clear the saved chat history
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            
            // Also clear the messages in the chat component
            if (this.chatComponent) {
                this.chatComponent.messages = [];
                
                // Add default welcome message
                this.chatComponent.addMessage('assistant', "Hello! I'm your AI development assistant. How can I help you today?");
                
                // Update UI if possible
                if (typeof this.chatComponent.updateUI === 'function') {
                    this.chatComponent.updateUI();
                }
            }
            
            console.log('Chat history cleared');
            return true;
        } catch (e) {
            console.error('Failed to clear chat history:', e);
            return false;
        }
    }
    
    /**
     * Set up automatic saving
     * @param {number} interval - Save interval in milliseconds
     */
    setupAutoSave(interval = 5000) {
        this.saveInterval = interval;
        
        // Save whenever a new message is added
        const originalAddMessage = this.chatComponent.addMessage;
        
        this.chatComponent.addMessage = (role, content) => {
            // Call the original method
            originalAddMessage.call(this.chatComponent, role, content);
            
            // Save history
            this.saveHistory();
        };
        
        console.log(`Auto-save enabled with ${interval}ms interval`);
        return true;
    }
}

// Make available globally
window.ChatHistoryManager = ChatHistoryManager;