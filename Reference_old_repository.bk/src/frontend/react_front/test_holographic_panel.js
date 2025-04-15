/**
 * Comprehensive test for holographic panel refresh
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create test button
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Panel Refresh';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '50px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.backgroundColor = '#ff4500';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '10px';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // Add click handler
    testButton.addEventListener('click', runPanelTest);
    
    // Add to document
    document.body.appendChild(testButton);
    
    console.log('Holographic panel test button added');
});

/**
 * Run the panel test
 */
function runPanelTest() {
    console.log('=== STARTING HOLOGRAPHIC PANEL TEST ===');
    
    // Create a test container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50px';
    container.style.left = '50px';
    container.style.width = '80%';
    container.style.height = '80%';
    container.style.backgroundColor = '#1b1b1b';
    container.style.border = '1px solid #00704A';
    container.style.zIndex = '9997';
    document.body.appendChild(container);
    
    // Create a real holographic panel
    const panel = new HolographicPanel();
    panel.init();
    
    // Render the panel to the container
    const panelElement = panel.render();
    container.appendChild(panelElement);
    
    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Test';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '9998';
    closeButton.addEventListener('click', () => {
        container.remove();
    });
    container.appendChild(closeButton);
    
    // Test sequence
    console.log('Running test sequence...');
    
    // Test 1: Add a log entry
    setTimeout(() => {
        console.log('TEST 1: Adding a log entry');
        panel.addLog('system', 'Test log entry 1');
        
        // Check if the UI was updated
        setTimeout(() => {
            const logEntries = container.querySelectorAll('.log-entry');
            console.log(`Found ${logEntries.length} log entries in the DOM`);
            console.log(`Panel has ${panel.logs.length} logs in memory`);
        }, 100);
    }, 1000);
    
    // Test 2: Add another log entry
    setTimeout(() => {
        console.log('TEST 2: Adding another log entry');
        panel.addLog('process', 'Test log entry 2');
        
        // Check if the UI was updated
        setTimeout(() => {
            const logEntries = container.querySelectorAll('.log-entry');
            console.log(`Found ${logEntries.length} log entries in the DOM`);
            console.log(`Panel has ${panel.logs.length} logs in memory`);
        }, 100);
    }, 2000);
    
    // Test 3: Set active process
    setTimeout(() => {
        console.log('TEST 3: Setting active process');
        panel.activeProcess = 'Test Process';
        
        // Check if the UI was updated
        setTimeout(() => {
            const statusText = container.querySelector('.status');
            console.log(`Status text: ${statusText ? statusText.textContent : 'Not found'}`);
        }, 100);
    }, 3000);
    
    // Test 4: Add a file
    setTimeout(() => {
        console.log('TEST 4: Adding a file');
        panel.addFile('test.js', 'console.log("test");');
        
        // Check if the UI was updated
        setTimeout(() => {
            const fileCount = container.querySelector('.file-count');
            console.log(`File count: ${fileCount ? fileCount.textContent : 'Not found'}`);
        }, 100);
    }, 4000);
    
    console.log('Test sequence scheduled');
}


/**
 * This tests the actual HolographicPanel class with the refresh manager
It creates a real HolographicPanel instance
It makes changes to the panel and checks if the UI updates automatically
Purpose: Test the integration between the panel and refresh manager

 */