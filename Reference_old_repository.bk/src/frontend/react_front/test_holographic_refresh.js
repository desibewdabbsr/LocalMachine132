/**
 * Test file for holographic refresh functionality
 * This file creates a simple test environment to verify the refresh manager works
 */

// Create a test button to run the tests
document.addEventListener('DOMContentLoaded', function() {
    // Create test button
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Holographic Refresh';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.backgroundColor = '#00704A';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '10px';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // Add click handler
    testButton.addEventListener('click', runRefreshTest);
    
    // Add to document
    document.body.appendChild(testButton);
    
    console.log('Holographic refresh test button added');
});

/**
 * Run the refresh test
 */
function runRefreshTest() {
    console.log('=== STARTING HOLOGRAPHIC REFRESH TEST ===');
    
    // Create a visible test panel
    const testPanel = createVisibleTestPanel();
    
    // Create a mock holographic panel
    const mockPanel = createMockPanel(testPanel);
    
    // Create the refresh manager with the mock panel
    const refreshManager = new HolographicRefreshManager(mockPanel);
    
    // Start the refresh interval
    refreshManager.startRefresh(500); // Faster refresh for testing
    
    console.log('Refresh manager started');
    updateTestPanel(testPanel, mockPanel);
    
    // Schedule state changes to test refresh detection
    setTimeout(() => {
        console.log('TEST: Adding a log entry');
        mockPanel.logs.push({
            type: 'system',
            message: 'Test log entry',
            timestamp: new Date()
        });
        updateTestPanel(testPanel, mockPanel);
    }, 1000);
    
    setTimeout(() => {
        console.log('TEST: Setting active process');
        mockPanel.activeProcess = 'Test Process';
        updateTestPanel(testPanel, mockPanel);
    }, 2000);
    
    setTimeout(() => {
        console.log('TEST: Adding a file');
        mockPanel.files['test.js'] = 'console.log("test");';
        updateTestPanel(testPanel, mockPanel);
    }, 3000);
    
    // Stop the test after 5 seconds
    setTimeout(() => {
        refreshManager.stopRefresh();
        console.log('=== HOLOGRAPHIC REFRESH TEST COMPLETED ===');
        console.log('Check the test panel to verify the refresh behavior');
    }, 5000);
}

/**
 * Create a visible test panel
 */
function createVisibleTestPanel() {
    // Create test panel container
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '50px';
    panel.style.right = '10px';
    panel.style.width = '300px';
    panel.style.height = '400px';
    panel.style.backgroundColor = '#1b1b1b';
    panel.style.border = '1px solid #00704A';
    panel.style.color = '#00704A';
    panel.style.padding = '10px';
    panel.style.zIndex = '9998';
    panel.style.overflow = 'auto';
    panel.style.fontFamily = 'monospace';
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = 'Holographic Refresh Test';
    panel.appendChild(header);
    
    // Add status section
    const status = document.createElement('div');
    status.id = 'test-status';
    status.style.marginBottom = '10px';
    panel.appendChild(status);
    
    // Add logs section
    const logs = document.createElement('div');
    logs.id = 'test-logs';
    panel.appendChild(logs);
    
    // Add to document
    document.body.appendChild(panel);
    
    return panel;
}

/**
 * Update the test panel with current state
 */
function updateTestPanel(panel, mockPanel) {
    const status = panel.querySelector('#test-status');
    const logs = panel.querySelector('#test-logs');
    
    // Update status
    status.innerHTML = `
        <div>Active Process: ${mockPanel.activeProcess || 'None'}</div>
        <div>Logs: ${mockPanel.logs.length}</div>
        <div>Files: ${Object.keys(mockPanel.files).length}</div>
        <div>Element Connected: ${mockPanel.element.isConnected ? 'Yes' : 'No'}</div>
    `;
    
    // Update logs
    logs.innerHTML = '<h4>Logs:</h4>';
    mockPanel.logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${log.type}: ${log.message}`;
        logs.appendChild(logEntry);
    });
}

/**
 * Create a mock holographic panel for testing
 */
function createMockPanel(testPanel) {
    return {
        element: {
            isConnected: true
        },
        activeProcess: null,
        logs: [],
        files: {},
        pendingUpdates: false,
        updateUI: function() {
            console.log('MOCK: updateUI called');
            console.log('MOCK: activeProcess =', this.activeProcess);
            console.log('MOCK: logs.length =', this.logs.length);
            console.log('MOCK: files count =', Object.keys(this.files).length);
            
            // Update the test panel
            updateTestPanel(testPanel, this);
        }
    };
}