/**
 * Holographic History Manager
 * Handles saving and loading holographic panel state
 */
class HolographicHistoryManager {
    constructor(panel) {
        this.panel = panel;
        this.storageKey = 'holographic_panel_history';
    }
    

        // Fix the saveHistory method to properly define stateToSave
    saveHistory() {
        if (!this.panel) {
            console.error('Cannot save history: panel not available');
            return;
        }

        try {
            // Don't save if the panel element is not in the DOM
            if (this.panel.element && !document.body.contains(this.panel.element)) {
                return; // Don't save if the panel is not in the DOM
            }

            // Convert Date objects to strings before saving
            const logsToSave = this.panel.logs ? this.panel.logs.map(log => {
                // Create a new object to avoid modifying the original
                const newLog = {...log};
                
                // Convert Date objects to ISO strings
                if (newLog.timestamp instanceof Date) {
                    newLog.timestamp = newLog.timestamp.toISOString();
                }
                
                return newLog;
            }) : [];
            
            // Define stateToSave properly
            const stateToSave = {
                logs: logsToSave,
                files: this.panel.files || {},
                activeProcess: this.panel.activeProcess || null,
                currentView: this.panel.currentView || 'process',
                currentFile: this.panel.currentFile || null,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
            console.log('Saved holographic panel state to history');
        } catch (e) {
            console.error('Failed to save holographic panel history:', e);
        }
    }






    
    /**
     * Load panel state from localStorage
     * @returns {boolean} - Whether history was successfully loaded
     */
    loadHistory() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            
            if (!savedData) {
                console.log('No saved holographic panel history found');
                return false;
            }
            
            const parsedData = JSON.parse(savedData);
            
            if (!parsedData) {
                console.log('Invalid holographic panel history format');
                return false;
            }
            
            // Restore state
            if (parsedData.logs) this.panel.logs = parsedData.logs;
            if (parsedData.files) this.panel.files = parsedData.files;
            if (parsedData.activeProcess) this.panel.activeProcess = parsedData.activeProcess;
            if (parsedData.currentView) this.panel.currentView = parsedData.currentView;
            if (parsedData.currentFile) this.panel.currentFile = parsedData.currentFile;
            
            console.log('Loaded holographic panel history');
            
            // Update UI
            if (typeof this.panel.updateUI === 'function') {
                this.panel.updateUI();
            }
            
            return true;
        } catch (e) {
            console.error('Failed to load holographic panel history:', e);
            return false;
        }
    }
    
    /**
     * Clear the saved history
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Holographic panel history cleared');
            return true;
        } catch (e) {
            console.error('Failed to clear holographic panel history:', e);
            return false;
        }
    }
    



    /**
     * Set up automatic saving
     * @param {number} interval - Save interval in milliseconds
     */
    setupAutoSave(interval = 10000) { // Increased to 10 seconds
        // Clear any existing interval
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        
        // Save periodically
        this.saveInterval = setInterval(() => {
            this.saveHistory();
        }, interval);
    
        console.log(`Auto-save enabled with ${interval}ms interval`);
    }
    
    



}

// Make available globally
window.HolographicHistoryManager = HolographicHistoryManager;