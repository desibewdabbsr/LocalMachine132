/**
 * Holographic Refresh Manager
 * Handles real-time updates for the holographic panel
 */
class HolographicRefreshManager {
    constructor(panel) {
        this.panel = panel;
        this.refreshInterval = null;
        this.lastUpdateTime = 0;
        this.lastProcessStatus = null;
        this.lastFileCount = 0;
        this.lastLogCount = 0;
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
        
        console.log(`Holographic refresh started with ${interval}ms interval`);
    }
    
    /**
     * Stop the refresh interval
     */
    stopRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('Holographic refresh stopped');
        }
    }
    








    /**
     * Check for updates and refresh the UI if needed
     */
    checkForUpdates() {
        // If panel doesn't exist, stop refreshing
        if (!this.panel) {
            console.log('Panel no longer exists, stopping refresh');
            this.stopRefresh();
            return;
        }

        // Check if we have updates
        const currentProcessStatus = this.panel.activeProcess;
        const currentFileCount = Object.keys(this.panel.files).length;
        const currentLogCount = this.panel.logs.length;

        const hasUpdates = 
            currentProcessStatus !== this.lastProcessStatus ||
            currentFileCount !== this.lastFileCount ||
            currentLogCount > this.lastLogCount;

        if (hasUpdates) {
            console.log('Holographic panel has updates, refreshing UI');
            console.log(`Process: ${this.lastProcessStatus} -> ${currentProcessStatus}`);
            console.log(`Files: ${this.lastFileCount} -> ${currentFileCount}`);
            console.log(`Logs: ${this.lastLogCount} -> ${currentLogCount}`);
            
            this.lastProcessStatus = currentProcessStatus;
            this.lastFileCount = currentFileCount;
            this.lastLogCount = currentLogCount;
            
            // Don't check isVisible, only check if element is connected to DOM
            if (this.panel.element && this.panel.element.isConnected) {
                this.panel.updateUI();
            }
        }
    }


}

// Make available globally
window.HolographicRefreshManager = HolographicRefreshManager;




/**
 * This tests the HolographicRefreshManager class specifically
It creates a mock panel (not a real HolographicPanel instance)
It simulates state changes and checks if the refresh manager detects them
Purpose: Test the refresh detection logic in isolation
 */