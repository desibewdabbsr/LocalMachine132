/**
 * Settings Component
 * Handles application settings
 */
class SettingsComponent {
    constructor() {
        this.element = null;
    }
    
    /**
     * Initialize the settings component
     */
    init() {
        console.log('Initializing settings component...');
    }
    
    /**
     * Render the settings component
     * @returns {HTMLElement} - Settings component element
     */
    render() {
        console.log('Rendering settings component');
        
        // Create main container
        const container = document.createElement('div');
        container.className = 'settings-container';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'settings-header';
        header.innerHTML = '<h2>Settings</h2>';
        container.appendChild(header);
        
        // Create settings sections
        container.appendChild(this.createChatSection());
        container.appendChild(this.createHolographicSection());
        
        this.element = container;
        return container;
    }
    
    /**
     * Create chat settings section
     * @returns {HTMLElement} - Chat settings section
     */
    createChatSection() {
        const section = document.createElement('div');
        section.className = 'settings-section';
        
        const title = document.createElement('h3');
        title.textContent = 'Chat Settings';
        section.appendChild(title);
        
        // Clear chat history button
        const clearChatBtn = document.createElement('button');
        clearChatBtn.className = 'settings-button';
        clearChatBtn.textContent = 'Clear Chat History';
        clearChatBtn.addEventListener('click', () => {
            if (window.app && window.app.chatComponent && window.app.chatComponent.historyManager) {
                window.app.chatComponent.historyManager.clearHistory();
                window.app.chatComponent.messages = [];
                window.app.chatComponent.updateUI();
                alert('Chat history cleared');
            }
        });
        section.appendChild(clearChatBtn);
        
        // New chat button
        const newChatBtn = document.createElement('button');
        newChatBtn.className = 'settings-button';
        newChatBtn.textContent = 'Start New Chat';
        newChatBtn.addEventListener('click', () => {
            if (window.app && window.app.chatComponent) {
                window.app.chatComponent.messages = [];
                window.app.chatComponent.addMessage('assistant', "Hello! I'm your AI development assistant. How can I help you today?");
                window.app.chatComponent.updateUI();
                alert('New chat started');
            }
        });
        section.appendChild(newChatBtn);
        
        return section;
    }
    
    /**
     * Create holographic settings section
     * @returns {HTMLElement} - Holographic settings section
     */
    createHolographicSection() {
        const section = document.createElement('div');
        section.className = 'settings-section';
        
        const title = document.createElement('h3');
        title.textContent = 'Process Monitor Settings';
        section.appendChild(title);
        
        // Clear holographic history button
        const clearHolographicBtn = document.createElement('button');
        clearHolographicBtn.className = 'settings-button';
        clearHolographicBtn.textContent = 'Clear Process Monitor History';
        clearHolographicBtn.addEventListener('click', () => {
            if (window.app && window.app.holographicPanel && window.app.holographicPanel.historyManager) {
                window.app.holographicPanel.historyManager.clearHistory();
                window.app.holographicPanel.logs = [];
                window.app.holographicPanel.files = {};
                window.app.holographicPanel.activeProcess = null;
                window.app.holographicPanel.updateUI();
                alert('Process monitor history cleared');
            }
        });
        section.appendChild(clearHolographicBtn);
        
        return section;
    }
}




// Make available globally
window.SettingsComponent = SettingsComponent;