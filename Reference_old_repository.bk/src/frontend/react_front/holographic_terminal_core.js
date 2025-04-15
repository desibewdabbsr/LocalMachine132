/**
 * Holographic Terminal Core
 * Core functionality for the terminal interface
 */
class HolographicTerminalCore {
    constructor(panel) {
        this.panel = panel;
        this.element = null;
        this.initialized = false;
        this.history = [];
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentInput = '';
        this.prompt = '$ ';
        this.cursorBlinking = true;
        this.commands = null; // Will be set by HolographicTerminal
    }
    
    /**
     * Initialize the terminal core
     */
    init() {
        console.log('Initializing holographic terminal core...');
        this.initialized = true;
        this._startCursorBlink();
    }
    
    /**
     * Render the terminal
     * @returns {HTMLElement} - Terminal element
     */
    render() {
        // Create main container
        const container = document.createElement('div');
        container.className = 'terminal-container';
        
        // Terminal display
        const terminalDisplay = document.createElement('div');
        terminalDisplay.className = 'terminal-display';
        
        // Add history lines
        this.history.forEach(item => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            
            if (item.type === 'input') {
                line.innerHTML = `<span class="terminal-prompt">${this.prompt}</span><span class="terminal-input">${this._escapeHtml(item.text)}</span>`;
            } else {
                line.innerHTML = `<span class="terminal-output">${this._formatOutput(item.text)}</span>`;
            }
            
            terminalDisplay.appendChild(line);
        });
        
        // Add current input line with blinking cursor
        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-line current-line';
        
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = this.prompt;
        inputLine.appendChild(promptSpan);
        
        const inputSpan = document.createElement('span');
        inputSpan.className = 'terminal-input';
        inputSpan.textContent = this.currentInput;
        inputLine.appendChild(inputSpan);
        
        const cursor = document.createElement('span');
        cursor.className = this.cursorBlinking ? 'terminal-cursor blink' : 'terminal-cursor';
        cursor.textContent = '█';
        inputLine.appendChild(cursor);
        
        terminalDisplay.appendChild(inputLine);
        container.appendChild(terminalDisplay);
        
        // Add input handler
        container.tabIndex = 0; // Make container focusable
        container.addEventListener('keydown', this._handleKeyDown.bind(this));
        container.addEventListener('click', () => container.focus());
        
        this.element = container;
        
        // Scroll to bottom
        setTimeout(() => {
            terminalDisplay.scrollTop = terminalDisplay.scrollHeight;
        }, 0);
        
        return container;
    }
    
    /**
     * Update the UI
     */
    updateUI() {
        if (!this.element) return;
        
        // Re-render the terminal
        const newElement = this.render();
        if (this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
            this.element.focus();
        }
    }
    
    /**
     * Add input to terminal
     * @param {string} text - Input text
     */
    addInput(text) {
        this.history.push({
            type: 'input',
            text: text
        });
        
        // Add to command history if not empty and not the same as the last command
        if (text.trim() && (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== text)) {
            this.commandHistory.push(text);
        }
        
        this.historyIndex = -1;
        this.currentInput = '';
        this.updateUI();
    }
    
    /**
     * Add output to terminal
     * @param {string} text - Output text
     */
    addOutput(text) {
        this.history.push({
            type: 'output',
            text: text
        });
        
        this.updateUI();
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} event - Keyboard event
     */
    _handleKeyDown(event) {
        // Stop cursor blinking while typing
        this.cursorBlinking = false;
        this._startCursorBlink();
        
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                if (this.commands) {
                    this.commands.executeCommand(this.currentInput);
                } else {
                    this.addInput(this.currentInput);
                    this.addOutput('Command processor not initialized');
                }
                break;
            case 'Backspace':
                event.preventDefault();
                if (this.currentInput.length > 0) {
                    this.currentInput = this.currentInput.slice(0, -1);
                    this.updateUI();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                this._navigateHistory(-1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this._navigateHistory(1);
                break;
            case 'Tab':
                event.preventDefault();
                if (this.commands) {
                    this.commands.autoComplete(this.currentInput);
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.addOutput('^C');
                    this.currentInput = '';
                    this.updateUI();
                    return;
                }
                // Fall through for normal 'c' key
            default:
                // Only handle printable characters
                if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                    event.preventDefault();
                    this.currentInput += event.key;
                    this.updateUI();
                }
        }
    }
    
    /**
     * Navigate command history
     * @param {number} direction - Direction (-1 for up, 1 for down)
     */
    _navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        // Save current input if we're at the bottom of history
        if (this.historyIndex === -1 && direction === -1) {
            this.savedInput = this.currentInput;
        }
        
        // Calculate new index
        let newIndex = this.historyIndex + direction;
        
        // Clamp index
        if (newIndex >= this.commandHistory.length) {
            newIndex = this.commandHistory.length;
        } else if (newIndex < -1) {
            newIndex = -1;
        }
        
        // Update input based on history
        if (newIndex === -1) {
            // Restore saved input at bottom of history
            this.currentInput = this.savedInput || '';
        } else {
            this.currentInput = this.commandHistory[this.commandHistory.length - 1 - newIndex];
        }
        
        this.historyIndex = newIndex;
        this.updateUI();
    }
    
    /**
     * Start cursor blinking
     */
    _startCursorBlink() {
        // Clear any existing blink timeout
        if (this._blinkTimeout) {
            clearTimeout(this._blinkTimeout);
        }
        
        // Set cursor to solid
        this.cursorBlinking = false;
        this.updateUI();
        
        // Start blinking after a delay
        this._blinkTimeout = setTimeout(() => {
            this.cursorBlinking = true;
            this.updateUI();
        }, 500);
    }
    
    /**
     * Format terminal output with special formatting
     * @param {string} text - Text to format
     * @returns {string} - Formatted HTML
     */
    _formatOutput(text) {
        // Handle code blocks
        if (text === '```') {
            return '<div class="code-block-marker"></div>';
        }
        
        // Check if we're inside a code block
        const codeBlockMarkers = this.history
            .filter(item => item.type === 'output' && item.text === '```')
            .length;
        
        const insideCodeBlock = codeBlockMarkers % 2 === 1;
        
        if (insideCodeBlock && text !== '```') {
            return `<pre class="terminal-code">${this._escapeHtml(text)}</pre>`;
        }
        
        return this._escapeHtml(text);
    }
    
    /**
     * Escape HTML characters to prevent XSS
     * @param {string} html - Raw HTML 
     * @returns {string} - Escaped HTML
     */
    _escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
}

// Make the class available globally
window.HolographicTerminalCore = HolographicTerminalCore;