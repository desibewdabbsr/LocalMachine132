// This is just for testing - you can remove this file later
document.addEventListener('DOMContentLoaded', function() {
    // Create a test button to manually trigger file creation
    const testButton = document.createElement('button');
    testButton.textContent = 'Create Test File';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '1000';
    
    testButton.addEventListener('click', function() {
        // Get the socket instance
        const socket = io();
        
        // Emit a file creation event
        socket.emit('file_created', {
            path: 'test/example.js',
            content: '// This is a test file\nconsole.log("Hello, world!");'
        });
        
        // Emit a code generation event
        socket.emit('code_generation', {
            path: 'test/generated.py',
            code: 'def hello():\n    print("Hello from generated code!")\n\nhello()'
        });
        
        // Emit a process update
        socket.emit('ai_process', {
            process: 'Test Process',
            message: 'Running test process...'
        });
    });
    
    document.body.appendChild(testButton);
});



/**
 * 
This is a simple test that creates a button to trigger socket events
It emits events like 'file_created', 'code_generation', and 'ai_process'
It doesn't test the refresh mechanism directly
Purpose: Test socket communication between client and server

 */
