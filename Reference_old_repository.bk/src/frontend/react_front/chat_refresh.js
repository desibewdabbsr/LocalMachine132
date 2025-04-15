/**
 * Chat Refresh Module
 * Handles real-time updates for chat messages
 */
class ChatRefreshManager {
    constructor(chatComponent) {
        this.chatComponent = chatComponent;
        this.refreshInterval = null;
        this.lastMessageCount = 0;
    }

    /**
     * Start the refresh interval
     * @param {number} interval - Refresh interval in milliseconds
     */
    startRefresh(interval = 1000) {
        // Clear any existing interval
        this.stopRefresh();
        
        // Set up a new interval
        this.refreshInterval = setInterval(() => {
            this.checkForUpdates();
        }, interval);
        
        console.log(`Chat refresh started with ${interval}ms interval`);
    }
    
    /**
     * Stop the refresh interval
     */
    stopRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('Chat refresh stopped');
        }
    }
    
    /**
     * Check for updates and refresh the UI if needed
     */
    checkForUpdates() {
        // If chat component doesn't exist, stop refreshing
        if (!this.chatComponent) {
            this.stopRefresh();
            return;
        }
        
        // Check if we have new messages
        const currentMessageCount = this.chatComponent.messages.length;
        
        if (currentMessageCount !== this.lastMessageCount) {
            console.log(`Message count changed: ${this.lastMessageCount} -> ${currentMessageCount}`);
            this.lastMessageCount = currentMessageCount;
            
            // Update the UI
            if (typeof this.chatComponent.updateUI === 'function') {
                this.chatComponent.updateUI();
            } else {
                // Fallback if updateUI doesn't exist
                this.renderMessages();
            }
        }
        
        // Check socket connection status
        this.checkSocketConnection();
    }
    
    /**
     * Check socket connection and reconnect if needed
     */
    checkSocketConnection() {
        if (this.chatComponent.socket) {
            if (!this.chatComponent.socket.connected) {
                console.log('Socket disconnected, attempting to reconnect...');
                try {
                    this.chatComponent.socket.connect();
                } catch (e) {
                    console.error('Failed to reconnect socket:', e);
                }
            }
        }
    }
    
    /**
     * Render messages directly (fallback if updateUI doesn't exist)
     */
    renderMessages() {
        if (!this.chatComponent.element) return;
        
        // Find or create messages container
        let messagesElement = this.chatComponent.element.querySelector('.chat-messages');
        if (!messagesElement) {
            messagesElement = document.createElement('div');
            messagesElement.className = 'chat-messages';
            this.chatComponent.element.appendChild(messagesElement);
        }
        
        // Clear current messages
        messagesElement.innerHTML = '';
        
        // Add all messages
        this.chatComponent.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
            
            // Format content
            if (typeof this.chatComponent.formatMessageContent === 'function') {
                messageElement.innerHTML = this.chatComponent.formatMessageContent(msg.content);
            } else {
                messageElement.textContent = msg.content;
            }
            
            messagesElement.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }
}

// Make available globally
window.ChatRefreshManager = ChatRefreshManager;