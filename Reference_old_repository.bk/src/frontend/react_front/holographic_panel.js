/**
 * Holographic Process Panel
 * Main controller for the holographic display system
 * Imports and coordinates the file viewer and terminal components
 */
class HolographicPanel {
    constructor() {
        this.element = null;
        this.activeProcess = null;
        this.logs = [];
        this.files = {};
        this.currentView = 'process'; // 'process', 'file', 'terminal'
        this.currentFile = null;
        this.socket = null;
        this.initialized = false;
        this.pendingUpdates = false; 
        this.isVisible = true; 
        this.refreshManager = null;

        
        // Initialize sub-components
        this.fileViewer = new HolographicFileViewer(this);
        this.terminal = new HolographicTerminal(this);
    }
    
    

    /**
     * Initialize the holographic panel
     */
    init() {
        console.log('Initializing holographic panel...');

        // Create the initial element if it doesn't exist
        if (!this.element) {
            this.element = this.render();
        }

        // Try to find a container to mount the panel
        const container = document.querySelector('.panel-content') || 
                            document.querySelector('.holographic-container') ||
                            document.getElementById('holographic-panel');

        if (container) {
            // Clear the container first
            container.innerHTML = '';
            container.appendChild(this.element);
            console.log('Panel mounted to container:', container);
        } else {
            // If no container is found, create one and append to body
            const newContainer = document.createElement('div');
            newContainer.id = 'holographic-panel-container';
            newContainer.className = 'holographic-container';
            document.body.appendChild(newContainer);
            newContainer.appendChild(this.element);
            console.log('Created new container for panel');
        }

        // Try to connect to websocket
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.addLog('system', 'Connected to AI system');
                
                // Only update UI after connection is established
                setTimeout(() => this.updateUI(), 100);
            });
            
            // Socket event handlers...
            
            this.initialized = true;
        } catch (e) {
            console.log('Socket.IO not available, falling back to simulated updates');
            this.socket = null;
            
            // Add some sample data for testing
            this.addLog('system', 'Holographic panel initialized in simulation mode');
            
            this.initialized = true;
        }

        // Initialize history manager
        this.historyManager = new HolographicHistoryManager(this);

        // Load history
        this.historyManager.loadHistory();

        // Set up auto-save with a longer interval
        this.historyManager.setupAutoSave(10000); // 10 seconds

        // Initialize sub-components
        this.fileViewer.init();
        this.terminal.init();

        // Initialize refresh manager with a longer interval
        this.refreshManager = new HolographicRefreshManager(this);
        this.refreshManager.startRefresh(2000); // 2 seconds

        console.log('Holographic panel initialized');
    }





    
    /**
     * Add a log entry
     * @param {string} type - Log type ('system', 'process', 'file', 'code')
     * @param {string} message - Log message
     * @param {string} path - File path (optional)
     */
    addLog(type, message, path = null) {
        this.logs.push({
            type,
            message,
            path,
            timestamp: new Date()
        });
        
        // If this is a code entry, update the file content
        if (type === 'code' && path) {
            this.files[path] = message;
        }
    }
    





    /**
     * Render the holographic panel
     * @returns {HTMLElement} - Holographic panel element
     */
    render() {
        console.log('Rendering holographic panel');

        // Create main container with holographic effect
        const container = document.createElement('div');
        container.className = 'holographic-container';

        // Create header with controls
        const header = document.createElement('div');
        header.className = 'holographic-header';

        // Create title with glowing effect
        const title = document.createElement('div');
        title.className = 'holographic-title';
        title.innerHTML = '<span class="glow">AI</span> Process Monitor';
        header.appendChild(title);

        // Create view selector
        const viewSelector = document.createElement('div');
        viewSelector.className = 'view-selector';

        const processBtn = document.createElement('button');
        processBtn.className = this.currentView === 'process' ? 'view-btn active' : 'view-btn';
        processBtn.innerHTML = '<span class="icon">⚙️</span> Process';
        processBtn.addEventListener('click', () => this.switchView('process'));
        viewSelector.appendChild(processBtn);

        const fileBtn = document.createElement('button');
        fileBtn.className = this.currentView === 'file' ? 'view-btn active' : 'view-btn';
        fileBtn.innerHTML = '<span class="icon">📄</span> Files';
        fileBtn.addEventListener('click', () => this.switchView('file'));
        viewSelector.appendChild(fileBtn);

        const terminalBtn = document.createElement('button');
        terminalBtn.className = this.currentView === 'terminal' ? 'view-btn active' : 'view-btn';
        terminalBtn.innerHTML = '<span class="icon">💻</span> Terminal';
        terminalBtn.addEventListener('click', () => this.switchView('terminal'));
        viewSelector.appendChild(terminalBtn);

        header.appendChild(viewSelector);
        container.appendChild(header);

        // Create content area - this is the key part that needs to be fixed
        const content = document.createElement('div');
        content.className = 'holographic-content panel-content'; // Add panel-content class
        container.appendChild(content);

        // Process view
        const processView = document.createElement('div');
        processView.className = this.currentView === 'process' ? 'view-content active' : 'view-content';
        processView.id = 'process-view';

        const processLogs = document.createElement('div');
        processLogs.className = 'process-logs';

        // Add logs to the process view
        this.logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}-log`;
            
            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';

            // Fix the timestamp handling
            let timeString;
            try {
                // Try to convert to Date if it's a string
                const timestampObj = typeof log.timestamp === 'string' 
                    ? new Date(log.timestamp) 
                    : log.timestamp;

                timeString = timestampObj instanceof Date 
                    ? timestampObj.toLocaleTimeString() 
                    : new Date().toLocaleTimeString();
            } catch (e) {
                // Fallback if timestamp is invalid
                timeString = new Date().toLocaleTimeString();
            }

            timestamp.textContent = timeString;
            logEntry.appendChild(timestamp);
            
            const icon = document.createElement('span');
            icon.className = 'log-icon';
            
            switch(log.type) {
                case 'system':
                    icon.textContent = '🔧';
                    break;
                case 'process':
                    icon.textContent = '⚙️';
                    break;
                case 'file':
                    icon.textContent = '📄';
                    break;
                case 'code':
                    icon.textContent = '💻';
                    break;
                default:
                    icon.textContent = '📌';
            }
            
            logEntry.appendChild(icon);
            
            const message = document.createElement('span');
            message.className = 'log-message';
            
            if (log.type === 'code') {
                message.innerHTML = `<strong>${log.path}</strong>: Code updated`;
                
                // Add a "View" button
                const viewBtn = document.createElement('button');
                viewBtn.className = 'view-code-btn';
                viewBtn.textContent = 'View';
                viewBtn.addEventListener('click', () => {
                    this.currentFile = log.path;
                    this.switchView('file');
                });
                
                logEntry.appendChild(message);
                logEntry.appendChild(viewBtn);
            } else {
                message.textContent = log.message;
                logEntry.appendChild(message);
            }
            
            processLogs.appendChild(logEntry);
        });

        processView.appendChild(processLogs);
        content.appendChild(processView);

        // File view container - create an empty container for the file viewer
        const fileView = document.createElement('div');
        fileView.className = this.currentView === 'file' ? 'view-content active file-view-container' : 'view-content file-view-container';
        fileView.id = 'file-view';
        content.appendChild(fileView);

        // Terminal view container - create an empty container for the terminal
        const terminalView = document.createElement('div');
        terminalView.className = this.currentView === 'terminal' ? 'view-content active terminal-view-container' : 'view-content terminal-view-container';
        terminalView.id = 'terminal-view';
        content.appendChild(terminalView);

        // Create footer with status
        const footer = document.createElement('div');
        footer.className = 'holographic-footer';

        // In the render method where the status is created
        const status = document.createElement('div');
        status.className = 'status';
        status.innerHTML = this.activeProcess 
            ? `<span class="status-indicator active"></span> ${this.activeProcess}` 
            : '<span class="status-indicator"></span> Idle';
        footer.appendChild(status);

        const fileCount = document.createElement('div');
        fileCount.className = 'file-count';
        fileCount.textContent = `Files: ${Object.keys(this.files).length}`;

        footer.appendChild(fileCount);
        container.appendChild(footer);

        // Store reference to the element
        this.element = container;

        // Initialize the appropriate view based on the current view
        if (this.currentView === 'file') {
            // Initialize file viewer after the DOM is ready
            setTimeout(() => {
                if (this.fileViewer) {
                    this.fileViewer.init(fileView);
                }
            }, 0);
        } else if (this.currentView === 'terminal') {
            // Initialize terminal after the DOM is ready
            setTimeout(() => {
                if (this.terminal) {
                    this.terminal.init(terminalView);
                }
            }, 0);
        }

        return container;
    }
    
    /**
     * Switch between views
     * @param {string} view - View to switch to ('process', 'file', 'terminal')
     */
    switchView(viewName) {
        if (this.currentView === viewName) {
            return; // Already on this view
        }

        this.currentView = viewName;

        // Create containers for each view if they don't exist
        const contentArea = this.element.querySelector('.panel-content');
        if (!contentArea) {
            console.error('Content area not found, cannot switch view');
            return;
        }

        // Clear content area
        contentArea.innerHTML = '';

        // Create and append the appropriate view container
        let viewContainer;

        if (viewName === 'process') {
            viewContainer = document.createElement('div');
            viewContainer.className = 'process-view-container';
            this._updateProcessView(viewContainer);
        } else if (viewName === 'file') {
            viewContainer = document.createElement('div');
            viewContainer.className = 'file-view-container';
            contentArea.appendChild(viewContainer);
            this._updateFileView();
        } else if (viewName === 'terminal') {
            viewContainer = document.createElement('div');
            viewContainer.className = 'terminal-view-container';
            this._updateTerminalView(viewContainer);
        }

        if (viewContainer) {
            contentArea.appendChild(viewContainer);
        }

        // Update UI to reflect the current view
        this.updateUI();
    }
    


    /**
     * Toggle visibility of the panel
     * @param {boolean} visible - Whether the panel should be visible
     */
    setVisible(visible) {
        console.log(`Setting holographic panel visibility to: ${visible}`);
        this.isVisible = visible;

        // If becoming visible and we have pending updates, render with the latest state
        if (visible && this.pendingUpdates) {
            this.pendingUpdates = false;
            console.log('Panel became visible, rendering with updated state');
            this.render();
        }

        // If becoming visible, force an update
        if (visible) {
            this.updateUI();
        }
    }





    // /**
    //  * Update the UI
    //  */
    // updateUI() {
    //     console.log('Updating holographic panel UI');
    //     console.log('Current view:', this.currentView);
    //     console.log('Current logs:', this.logs.length);
    //     console.log('Current files:', Object.keys(this.files).length);
    //     console.log('Active process:', this.activeProcess);

    //     // Only try to update the DOM if we have an element and it's attached to the DOM
    //     if (!this.element || !this.element.isConnected) {
    //         console.log('Element not connected to DOM, skipping UI update');
    //         this.pendingUpdates = true;
    //         return;
    //     }

    //     try {
    //         // Instead of replacing the entire element, update specific parts
    //         this._updateProcessView();
    //         this._updateFileView();
    //         this._updateTerminalView();
    //         this._updateFooter();
            
    //         console.log('UI updated successfully');
    //     } catch (error) {
    //         console.error('Error updating UI:', error);
    //     }
    // }




    /**
     * Update the UI
     */
    updateUI() {
        // If we're not initialized yet, skip the update
        if (!this.initialized) {
            return;
        }
    
        // Check if the element is actually in the DOM before trying to update
        if (!this.element) {
            console.log('Element not created yet, cannot update UI');
            return;
        }
        
        if (!document.body.contains(this.element)) {
            console.log('Element not connected to DOM, will update when connected');
            
            // Limit the number of retry attempts to prevent infinite loops
            if (!this._updateRetryCount) {
                this._updateRetryCount = 0;
            }
            
            if (this._updateRetryCount < 5) { // Max 5 retries
                this._updateRetryCount++;
                // Schedule an update when the element is connected
                setTimeout(() => this.updateUI(), 500); // Increased delay
            } else {
                console.warn('Max retry attempts reached, giving up on UI update');
                this._updateRetryCount = 0; // Reset for next time
                
                // Try to find a container to mount to
                const container = document.querySelector('.panel-content') || 
                                 document.querySelector('.holographic-container') ||
                                 document.getElementById('holographic-panel-container');
                
                if (container) {
                    // Clear the container first
                    container.innerHTML = '';
                    container.appendChild(this.element);
                    console.log('Re-mounted panel to container');
                    setTimeout(() => this.updateUI(), 100);
                } else {
                    // If no container is found, create one and append to body
                    const newContainer = document.createElement('div');
                    newContainer.id = 'holographic-panel-container';
                    newContainer.className = 'holographic-container';
                    document.body.appendChild(newContainer);
                    newContainer.appendChild(this.element);
                    console.log('Created new container for panel');
                    setTimeout(() => this.updateUI(), 100);
                }
            }
            return;
        }
    
        // Reset retry count on successful connection
        this._updateRetryCount = 0;

        try {
        // Update based on current view
        if (this.currentView === 'process') {
        this._updateProcessView();
        } else if (this.currentView === 'file') {
        this._updateFileView();
        } else if (this.currentView === 'terminal') {
        this._updateTerminalView();
        }

        // Always update the footer
        this._updateFooter();

        console.log('UI updated successfully');
        } catch (error) {
        console.error('Error updating UI:', error);
        }
    }


    renderFileView() {
        // Clear existing content
        this.clearContent();

        // Create file viewer if it doesn't exist
        if (!this.fileViewer) {
            this.fileViewer = new HolographicFileViewer(this);
            this.fileViewer.init(this.contentArea);
        } else {
            // Just update the existing viewer
            this.contentArea.appendChild(this.fileViewer.element);
            
            // Force a refresh of files
            this.fileViewer.refreshFiles();
        }

        // Ensure the directory structure is expanded for newly created files
        if (this.fileViewer.files && Object.keys(this.fileViewer.files).length > 0) {
            // Expand all directories by default
            Object.keys(this.fileViewer.files).forEach(dirPath => {
                this.fileViewer.expandedDirs.add(dirPath);
            });
            
            // If we have a current file, make sure it's visible
            if (this.currentFile) {
                // Find the directory containing the file
                const parts = this.currentFile.split('/');
                const fileName = parts.pop();
                const dirPath = parts.join('/');
                
                // Expand that directory
                this.fileViewer.expandedDirs.add(dirPath);
            }
        }
    }

    
    /**
     * Add a file to the panel
     * @param {string} path - File path
     * @param {string} content - File content
     */
    addFile(path, content) {
        this.files[path] = content;
        this.addLog('file', `Added file: ${path}`);
        this.updateUI();
    }
    
    /**
     * Show a specific file
     * @param {string} path - File path
     */
    showFile(path) {
        if (this.files[path]) {
            this.currentFile = path;
            this.switchView('file');
        }
    }
    
    /**
     * Execute a command in the terminal
     * @param {string} command - Command to execute
     */
    executeCommand(command) {
        this.terminal.executeCommand(command);
        this.switchView('terminal');
    }










    /**
     * Update the process view
     */
    _updateProcessView() {
    if (this.currentView !== 'process') return;

    const processView = this.element.querySelector('#process-view');
    if (!processView) return;

    const processLogs = processView.querySelector('.process-logs');
    if (!processLogs) return;

    // Clear existing logs
    processLogs.innerHTML = '';

    // Add logs to the process view
    this.logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.type}-log`;
        


        const timestamp = document.createElement('span');
        timestamp.className = 'log-timestamp';
        
        // Fix the timestamp handling
        let timeString;
        try {
            // Try to convert to Date if it's a string
            const timestampObj = typeof log.timestamp === 'string' 
                ? new Date(log.timestamp) 
                : log.timestamp;
            
            timeString = timestampObj instanceof Date 
                ? timestampObj.toLocaleTimeString() 
                : new Date().toLocaleTimeString();
        } catch (e) {
            // Fallback if timestamp is invalid
            timeString = new Date().toLocaleTimeString();
        }
        
        timestamp.textContent = timeString;
        logEntry.appendChild(timestamp);
        



        
        const icon = document.createElement('span');
        icon.className = 'log-icon';
        
        switch(log.type) {
            case 'system':
                icon.textContent = '🔧';
                break;
            case 'process':
                icon.textContent = '⚙️';
                break;
            case 'file':
                icon.textContent = '📄';
                break;
            case 'code':
                icon.textContent = '💻';
                break;
            default:
                icon.textContent = '📌';
        }
        
        logEntry.appendChild(icon);
        
        const message = document.createElement('span');
        message.className = 'log-message';
        
        if (log.type === 'code') {
            message.innerHTML = `<strong>${log.path}</strong>: Code updated`;
            
            // Add a "View" button
            const viewBtn = document.createElement('button');
            viewBtn.className = 'view-code-btn';
            viewBtn.textContent = 'View';
            viewBtn.addEventListener('click', () => {
                this.currentFile = log.path;
                this.switchView('file');
            });
            
            logEntry.appendChild(message);
            logEntry.appendChild(viewBtn);
        } else {
            message.textContent = log.message;
            logEntry.appendChild(message);
        }
        
        processLogs.appendChild(logEntry);
    });
    }

    /**
     * Update the file view
     */
    _updateFileView() {
        // Create file viewer if it doesn't exist
        if (!this.fileViewer) {
            this.fileViewer = new HolographicFileViewer(this);
        }

        // Get or create the file view container
        let fileViewContainer = this.element.querySelector('.file-view-container');
        if (!fileViewContainer) {
            console.log('Creating file view container');
            fileViewContainer = document.createElement('div');
            fileViewContainer.className = 'file-view-container';
            
            // Find the appropriate place to append the container
            const contentArea = this.element.querySelector('.panel-content');
            if (contentArea) {
                contentArea.appendChild(fileViewContainer);
            } else {
                console.error('Content area not found, cannot create file view container');
                return;
            }
        }

        // Clear the container
        fileViewContainer.innerHTML = '';

        // Initialize the file viewer with the container
        this.fileViewer.init(fileViewContainer);
    }





    /**
     * Update the terminal view
     */
    _updateTerminalView() {
    if (this.currentView !== 'terminal') return;

    // Let the terminal handle its own updates
    this.terminal.updateUI();
    }

    /**
     * Update the footer
     */
    _updateFooter() {
        const footer = this.element.querySelector('.holographic-footer');
        if (!footer) return;

        const status = footer.querySelector('.status');
        if (status) {
            status.innerHTML = this.activeProcess 
                ? `<span class="status-indicator active"></span> ${this.activeProcess}` 
                : '<span class="status-indicator"></span> Idle';
        }

        const fileCount = footer.querySelector('.file-count');
        if (fileCount) {
            fileCount.textContent = `Files: ${Object.keys(this.files).length}`;
        }
    

    }
}



// Ensure the script is loaded before trying to use it
document.addEventListener('DOMContentLoaded', function() {
    // Check if the other components are loaded
    if (typeof HolographicFileViewer === 'undefined') {
        console.error('HolographicFileViewer not loaded. Make sure holographic_file_viewer.js is included before holographic_panel.js');
    }
    
    if (typeof HolographicTerminal === 'undefined') {
        console.error('HolographicTerminal not loaded. Make sure holographic_terminal.js is included before holographic_panel.js');
    }
});
