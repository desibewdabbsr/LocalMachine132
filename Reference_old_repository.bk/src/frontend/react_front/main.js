/**
 * Main Application
 * Initializes and connects all components
 */
class App {
    constructor() {
        console.log('Creating App instance');
        this.layout = new Layout();
        this.chatComponent = new ChatComponent();
        this.holographicPanel = new HolographicPanel();
        
        // Initialize settings component if available
        if (typeof SettingsComponent !== 'undefined') {
            this.settingsComponent = new SettingsComponent();
            console.log('Settings component created');
        }
        
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing application...');
        if (this.initialized) return;
        
        // Get the container
        const container = document.getElementById('app-container');
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        // Initialize layout
        this.layout.init(container);
        
        // Initialize components
        this.chatComponent.init();
        this.holographicPanel.init();
        
        // Initialize settings component if available
        if (this.settingsComponent) {
            this.settingsComponent.init();
        }
        
        // Register services
        const chatButton = this.layout.registerService('AI Chat', this.chatComponent, '💬');
        
        // Register holographic panel with its own icon
        const holographicButton = this.layout.registerService('AI Process Monitor', this.holographicPanel, '🔮');
        
        // Register settings component if available
        if (this.settingsComponent) {
            const settingsButton = this.layout.registerService('Settings', this.settingsComponent, '⚙️');
        }
        
        // Activate chat by default
        this.layout.toggleService('AI Chat');
        
        this.initialized = true;
        
        // Update status
        this.updateStatus('Ready');
        console.log('Application initialized successfully');
        
        // Make app globally available for debugging
        window.app = this;
    }

    /**
     * Update the status bar
     * @param {string} status - Status message
     */
    updateStatus(status) {
        const statusElement = document.querySelector('.status-bar span:first-child');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, creating app...');
    const app = new App();
    app.init().then(() => {
        console.log('App initialized successfully');
    });
});